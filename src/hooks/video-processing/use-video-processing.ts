import { useVideoUpload } from "./use-video-upload";
import { useVideoGeneration } from "./use-video-generation";
import { useQueryClient } from "@tanstack/react-query";
import { AdvancedSettingsValues } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";

export const useVideoProcessing = (onAfterProcess?: () => Promise<void>) => {
  const { isUploading, uploadVideo } = useVideoUpload();
  const { isProcessing, setIsProcessing, createVideoRecord, createGenerationRecord, generateSoundEffect } = useVideoGeneration();
  const queryClient = useQueryClient();

  const processVideo = async (file: File, prompt: string, advancedSettings: AdvancedSettingsValues) => {
    try {
      setIsProcessing(true);
      const videoUrl = await uploadVideo(file);
      if (!videoUrl) throw new Error("Failed to upload video");

      const video = await createVideoRecord(videoUrl);
      const generation = await createGenerationRecord(video.id, prompt);
      const prediction = await generateSoundEffect(videoUrl, prompt, advancedSettings, generation.id);

      const pollInterval = setInterval(async () => {
        const { data: status } = await supabase.functions.invoke("mmaudio", {
          body: {
            action: "get_prediction",
            params: { id: prediction.id },
          },
        });

        if (status.status === "succeeded") {
          clearInterval(pollInterval);
          queryClient.invalidateQueries({ queryKey: ['videos'] });

          if (onAfterProcess) {
            await onAfterProcess();
          }

          setIsProcessing(false);
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
          setIsProcessing(false);
          throw new Error("Failed to generate sound effect");
        }
      }, 1000);

    } catch (error: any) {
      console.error("Error processing video:", error);
      setIsProcessing(false);
      throw error;
    }
  };

  return {
    isUploading,
    isProcessing,
    processVideo,
  };
};