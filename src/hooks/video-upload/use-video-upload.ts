import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "./use-file-upload";
import { usePromptAnalysis } from "./use-prompt-analysis";
import { useVideoSettings } from "./use-video-settings";
import { AdvancedSettingsValues } from "@/types/video";

export const useVideoUpload = () => {
  const { file, setFile, isUploading, uploadFile } = useFileUpload();
  const { prompt, setPrompt, isAnalyzing, analyzeVideo } = usePromptAnalysis();
  const { settings, handleSettingsChange } = useVideoSettings();
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    try {
      const videoUrl = await uploadFile();
      await analyzeVideo(videoUrl);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus("Uploading video...");
    setProcessedVideoUrl(null);

    try {
      const videoUrl = await uploadFile();
      await processVideo(videoUrl, settings);
    } catch (error: any) {
      console.error("Upload error:", error);
      setProcessingStatus("Error occurred during processing");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const processVideo = async (videoUrl: string, settings: AdvancedSettingsValues) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required");

    // Create video record
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

    // Create generation record
    const { data: generationData, error: generationError } = await supabase
      .from('user_generations')
      .insert([{
        prompt: prompt || "ambient sound matching the video content",
        video_url: videoUrl,
        status: 'processing',
        user_id: session.user.id,
        video_id: videoData.id,
        duration: settings.duration,
      }])
      .select()
      .single();

    if (generationError) throw generationError;

    setProcessingStatus("Generating sound effect...");

    // Generate sound effect
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

      setProcessedVideoUrl(data.output);
      toast({
        title: "Success",
        description: "Video processed successfully!",
      });
    }

    setFile(null);
    setPrompt("");
    setProcessingStatus(null);
  };

  return {
    file,
    setFile,
    prompt,
    setPrompt,
    isUploading,
    isAnalyzing,
    processingStatus,
    processedVideoUrl,
    settings,
    handleSettingsChange,
    handleAnalyze,
    handleUpload,
  };
};