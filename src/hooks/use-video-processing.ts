import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AdvancedSettingsValues } from "@/types/video";

export const useVideoProcessing = (onAfterProcess?: () => Promise<void>) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const uploadVideo = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from("videos")
        .upload(filePath, file, {
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

  const processVideo = async (file: File, prompt: string, advancedSettings: AdvancedSettingsValues) => {
    try {
      setIsProcessing(true);
      const videoUrl = await uploadVideo(file);
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

      // Ensure we always have a prompt value
      const defaultPrompt = "Generate sound effect based on video content";
      const finalPrompt = prompt.trim() || defaultPrompt;

      const { data: generation, error: generationError } = await supabase
        .from("user_generations")
        .insert({
          user_id: user.id,
          video_id: video.id,
          prompt: finalPrompt,
          status: "processing",
        })
        .select()
        .single();

      if (generationError) throw generationError;

      const apiParams = {
        video_url: videoUrl,
        seed: advancedSettings.seed,
        duration: advancedSettings.duration,
        num_steps: advancedSettings.numSteps,
        cfg_strength: advancedSettings.cfgStrength,
        prompt: finalPrompt,
        ...(advancedSettings.negativePrompt && { 
          negative_prompt: advancedSettings.negativePrompt 
        }),
      };

      const { data: prediction, error: predictionError } = await supabase.functions.invoke("mmaudio", {
        body: {
          action: "create_prediction",
          params: apiParams,
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