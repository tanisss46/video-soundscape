import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFileHandler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    setFile,
    isUploading,
    uploadVideo,
  };
};