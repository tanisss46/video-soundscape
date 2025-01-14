import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFileHandler } from "./use-file-handler";
import { useVideoProcessor } from "./use-video-processor";
import { useVideoSettings } from "./use-video-settings";
import { useToast } from "@/hooks/use-toast";

export const useVideoUpload = () => {
  const { file, setFile, isUploading, uploadVideo } = useFileHandler();
  const { isProcessing, processVideo } = useVideoProcessor();
  const { settings, handleSettingsChange } = useVideoSettings();
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleUpload = async () => {
    try {
      const videoUrl = await uploadVideo();
      if (!videoUrl) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert([{
          user_id: session.user.id,
          video_url: videoUrl,
          title: file?.name.split('.')[0],
        }])
        .select()
        .single();

      if (videoError) throw videoError;

      await processVideo(videoUrl, prompt, settings, videoData.id);
      setFile(null);
      setPrompt("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    file,
    setFile,
    prompt,
    setPrompt,
    isUploading,
    isProcessing,
    settings,
    handleSettingsChange,
    handleUpload,
  };
};