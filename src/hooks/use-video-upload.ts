import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSettingsValues } from "@/types/video";

export const useVideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<AdvancedSettingsValues>({
    seed: -1,
    duration: 10,
    numSteps: 50,
    cfgStrength: 7,
    negativePrompt: "",
  });

  const { toast } = useToast();

  const handleSettingsChange = (newSettings: AdvancedSettingsValues) => {
    setSettings(newSettings);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `temp_${timestamp}.${fileExt}`;

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

      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { videoUrl: publicUrl }
      });

      if (error) throw error;

      if (data.output) {
        setPrompt(data.output);
        toast({
          title: "Success",
          description: "Video analysis completed",
        });
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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

    setIsUploading(true);
    setProcessingStatus("Uploading video...");
    setProcessedVideoUrl(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication required");
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;

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

      const { data: generationData, error: generationError } = await supabase
        .from('user_generations')
        .insert([
          {
            prompt: prompt || "ambient sound matching the video content",
            video_url: publicUrl,
            status: 'processing',
            user_id: session.user.id,
            duration: settings.duration,
          }
        ])
        .select()
        .single();

      if (generationError) throw generationError;

      setProcessingStatus("Generating sound effect...");

      const { data, error } = await supabase.functions.invoke('generate-sfx', {
        body: {
          videoUrl: publicUrl,
          prompt: prompt || "ambient sound matching the video content",
          ...settings,
        }
      });

      if (error) throw error;

      if (data.output) {
        const { error: updateError } = await supabase
          .from('user_generations')
          .update({
            status: 'completed',
            audio_url: data.output
          })
          .eq('id', generationData.id);

        if (updateError) throw updateError;

        setProcessedVideoUrl(data.output);
        toast({
          title: "Success",
          description: "Video processed successfully!",
        });
      }

      setFile(null);
      setPrompt("");
      setProcessingStatus(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      setProcessingStatus("Error occurred during processing");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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