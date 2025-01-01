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
  onFileSelect?: () => void;
  onAnalyzeStart?: () => void;
  onAnalyzeComplete?: () => void;
}

export const VideoUpload = ({ 
  onBeforeProcess, 
  onAfterProcess,
  onFileSelect,
  onAnalyzeStart,
  onAnalyzeComplete
}: VideoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
    if (onFileSelect) {
      onFileSelect();
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setAnalysisResult("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    if (onAnalyzeStart) {
      onAnalyzeStart();
    }

    setIsAnalyzing(true);
    try {
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `temp_${timestamp}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, selectedFile, {
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
        setAnalysisResult(data.output);
        toast({
          title: "Success",
          description: "Video analysis completed",
        });
        if (onAnalyzeComplete) {
          onAnalyzeComplete();
        }
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
          prompt: prompt || null,
          status: "processing",
        })
        .select()
        .single();

      if (generationError) throw generationError;

      const apiParams: any = {
        video_url: videoUrl,
        seed: advancedSettings.seed,
        duration: advancedSettings.duration,
        num_steps: advancedSettings.numSteps,
        cfg_strength: advancedSettings.cfgStrength,
      };

      if (prompt) {
        apiParams.prompt = prompt;
      }
      if (advancedSettings.negativePrompt) {
        apiParams.negative_prompt = advancedSettings.negativePrompt;
      }

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

          toast({
            variant: "success",
            title: "Success",
            description: "Video processing completed!",
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

    } catch (error: any) {
      console.error("Error processing video:", error);
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to process video. Please try again.",
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
        file={selectedFile}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        analysisResult={analysisResult}
      />
    </div>
  );
};
