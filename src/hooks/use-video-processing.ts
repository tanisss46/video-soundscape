import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AdvancedSettingsValues } from "@/types/video";
import { toast } from "sonner";

export const useVideoProcessing = (onAfterProcess?: () => Promise<void>) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const processVideo = async (file: File, prompt: string, advancedSettings: AdvancedSettingsValues) => {
    try {
      setIsProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Send directly to Edge Function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      formData.append('duration', advancedSettings.duration.toString());
      formData.append('seed', advancedSettings.seed.toString());
      formData.append('numSteps', advancedSettings.numSteps.toString());
      formData.append('cfgStrength', advancedSettings.cfgStrength.toString());
      if (advancedSettings.negativePrompt) {
        formData.append('negativePrompt', advancedSettings.negativePrompt);
      }

      const { data: processedVideo, error: processError } = await supabase.functions.invoke('mmaudio', {
        body: formData
      });

      if (processError) throw processError;

      // Create video record with the final video URL
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          video_url: processedVideo.videoUrl,
          title: file.name.split('.')[0],
        })
        .select()
        .single();

      if (videoError) throw videoError;

      // Create generation record
      const { error: generationError } = await supabase
        .from('user_generations')
        .insert({
          user_id: user.id,
          video_id: videoData.id,
          prompt: prompt,
          status: 'completed',
          audio_url: processedVideo.videoUrl,
          duration: advancedSettings.duration
        });

      if (generationError) throw generationError;

      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success("Video processed successfully!");

      if (onAfterProcess) {
        await onAfterProcess();
      }
    } catch (error: any) {
      console.error("Error processing video:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isUploading,
    isProcessing,
    processVideo,
  };
};