import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSettingsValues } from "@/types/video";

export const useVideoGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createVideoRecord = async (videoUrl: string) => {
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
    return video;
  };

  const createGenerationRecord = async (videoId: string, prompt: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: generation, error: generationError } = await supabase
      .from("user_generations")
      .insert({
        user_id: user.id,
        video_id: videoId,
        prompt: prompt.trim() || "Generate sound effect based on video content",
        status: "processing",
      })
      .select()
      .single();

    if (generationError) throw generationError;
    return generation;
  };

  const generateSoundEffect = async (
    videoUrl: string,
    prompt: string,
    advancedSettings: AdvancedSettingsValues,
    generationId: number
  ) => {
    const apiParams = {
      video_url: videoUrl,
      seed: advancedSettings.seed,
      duration: advancedSettings.duration,
      num_steps: advancedSettings.numSteps,
      cfg_strength: advancedSettings.cfgStrength,
      prompt: prompt.trim() || "Generate sound effect based on video content",
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
    return prediction;
  };

  return {
    isProcessing,
    setIsProcessing,
    createVideoRecord,
    createGenerationRecord,
    generateSoundEffect,
  };
};