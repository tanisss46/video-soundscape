import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSettingsValues } from "@/types/video";
import { storeMediaFile } from "@/utils/media-storage";

export const useVideoGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createVideoRecord = async (videoUrl: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Store video permanently in Supabase
    const permanentVideoUrl = await storeMediaFile(videoUrl, user.id, 'video');

    const { data: video, error: videoError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        video_url: permanentVideoUrl,
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

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

    console.log('Creating prediction with params:', apiParams);
    const { data: prediction, error: predictionError } = await supabase.functions.invoke("mmaudio", {
      body: {
        action: "create_prediction",
        params: apiParams,
      },
    });

    if (predictionError) throw predictionError;

    // If the prediction includes an audio URL, store it permanently in Supabase
    if (prediction.output) {
      console.log('Storing audio file permanently...');
      const permanentAudioUrl = await storeMediaFile(prediction.output, user.id, 'audio');
      
      // Update the generation record with the permanent audio URL
      const { error: updateError } = await supabase
        .from("user_generations")
        .update({
          audio_url: permanentAudioUrl,
          status: "completed",
        })
        .eq("id", generationId);

      if (updateError) throw updateError;
      console.log('Generation record updated with permanent audio URL');
    }

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