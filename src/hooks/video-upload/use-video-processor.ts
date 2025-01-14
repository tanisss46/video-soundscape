import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdvancedSettingsValues } from "@/types/video";

export const useVideoProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processVideo = async (
    videoUrl: string,
    prompt: string,
    settings: AdvancedSettingsValues,
    videoId: string
  ) => {
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: generationData, error: generationError } = await supabase
        .from('user_generations')
        .insert([{
          prompt: prompt || "ambient sound matching the video content",
          video_url: videoUrl,
          status: 'processing',
          user_id: user.id,
          video_id: videoId,
          duration: settings.duration,
        }])
        .select()
        .single();

      if (generationError) throw generationError;

      const { data, error } = await supabase.functions.invoke('generate-sfx', {
        body: {
          videoUrl,
          prompt: prompt || "ambient sound matching the video content",
          ...settings,
        }
      });

      if (error) throw error;

      if (data.output) {
        await supabase
          .from('user_generations')
          .update({
            status: 'completed',
            audio_url: data.output
          })
          .eq('id', generationData.id);

        toast({
          title: "Success",
          description: "Video processed successfully!",
        });
      }
    } catch (error: any) {
      console.error("Processing error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processVideo,
  };
};