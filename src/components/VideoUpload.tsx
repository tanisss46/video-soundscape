import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { VideoDropzone } from "./upload/VideoDropzone";
import { VideoProcessor } from "./upload/VideoProcessor";
import { AdvancedSettingsValues } from "@/types/video";

interface VideoUploadProps {
  onBeforeProcess?: () => Promise<boolean>;
  onAfterProcess?: () => Promise<void>;
}

export const VideoUpload = ({ onBeforeProcess, onAfterProcess }: VideoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setVideoUrl(null);
  };

  const uploadVideo = async () => {
    if (!selectedFile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from("videos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async (prompt: string, advancedSettings: AdvancedSettingsValues) => {
    if (!selectedFile) return;

    if (onBeforeProcess) {
      const canProceed = await onBeforeProcess();
      if (!canProceed) return;
    }

    try {
      setIsProcessing(true);
      const videoUrl = await uploadVideo();
      if (!videoUrl) throw new Error("Failed to upload video");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: video, error: videoError } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          video_url: videoUrl,
        })
        .select()
        .single();

      if (videoError) throw videoError;

      const { data: generation, error: generationError } = await supabase
        .from("user_generations")
        .insert({
          user_id: user.id,
          video_id: video.id,
          prompt: prompt,
          status: "processing",
        })
        .select()
        .single();

      if (generationError) throw generationError;

      const { data: prediction, error: predictionError } = await supabase.functions.invoke("mmaudio", {
        body: {
          action: "create_prediction",
          params: {
            video_url: videoUrl,
            prompt: prompt,
            ...advancedSettings,
          },
        },
      });

      if (predictionError) throw predictionError;

      const pollInterval = setInterval(async () => {
        const { data: status } = await supabase.functions.invoke("mmaudio", {
          body: {
            action: "get_prediction",
            params: { id: prediction.id },
          },
        });

        if (status.status === "succeeded") {
          clearInterval(pollInterval);
          
          await supabase
            .from("user_generations")
            .update({
              audio_url: status.output,
              status: "completed",
            })
            .eq("id", generation.id);

          queryClient.invalidateQueries({ queryKey: ['videos'] });

          toast({
            title: "Success",
            description: "Sound effect generated successfully!",
          });

          if (onAfterProcess) {
            await onAfterProcess();
          }

          setIsProcessing(false);
          resetUpload();
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
          throw new Error("Failed to generate sound effect");
        }
      }, 1000);
    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: "Failed to process video. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <VideoDropzone
        selectedFile={selectedFile}
        videoUrl={videoUrl}
        onFileSelect={handleFileSelect}
        onReset={resetUpload}
      />
      <VideoProcessor
        isProcessing={isProcessing}
        isUploading={isUploading}
        onProcess={handleProcess}
        disabled={!selectedFile}
      />
    </div>
  );
};