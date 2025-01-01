import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const VideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch user credits
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!userProfile || userProfile.credits < 1) {
      toast({
        title: "Insufficient credits",
        description: "Please purchase more credits or upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const { data, error } = await supabase.storage
        .from("videos")
        .upload(`public/${acceptedFiles[0].name}`, formData);

      if (error) throw error;

      // After successful processing, deduct one credit
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ credits: userProfile.credits - 1 })
          .eq('id', user.id);

        toast({
          title: "Success",
          description: `1 credit used. Remaining credits: ${userProfile.credits - 1}`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [userProfile, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'video/*': [],
    },
  });

  return (
    <div {...getRootProps()} className="border-dashed border-2 border-gray-300 p-4 text-center">
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
      <Button disabled={isUploading} className="mt-4">
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </Button>
    </div>
  );
};
