import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VideoDropzone } from "./upload/VideoDropzone";
import { VideoProcessor } from "./upload/VideoProcessor";
import { AdvancedSettingsValues } from "@/types/video";
import { useVideoProcessing } from "@/hooks/use-video-processing";
import { toast } from "sonner";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [currentGenerationId, setCurrentGenerationId] = useState<number | null>(null);

  const { isUploading, isProcessing, processVideo } = useVideoProcessing(onAfterProcess);

  const handleFileSelect = async (file: File) => {
    // Check video duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    const duration = await new Promise<number>((resolve) => {
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });

    if (duration > 30) {
      toast.error("Video must be 30 seconds or shorter");
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect();
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setAnalysisResult("");
    setCurrentGenerationId(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    if (onAnalyzeStart) {
      onAnalyzeStart();
    }

    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create generation record
      const { data: generationData, error: generationError } = await supabase
        .from('user_generations')
        .insert({
          prompt: 'Analyzing video content...',
          status: 'analyzing',
          user_id: user.id
        })
        .select()
        .single();

      if (generationError) throw generationError;
      setCurrentGenerationId(generationData.id);

      const formData = new FormData();
      formData.append('file', selectedFile);

      // Update to use invoke with proper function name
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: formData
      });

      if (error) throw error;

      if (data.output) {
        setAnalysisResult(data.output);
        await supabase
          .from('user_generations')
          .update({ 
            status: 'analyzed',
            prompt: data.output
          })
          .eq('id', generationData.id);

        if (onAnalyzeComplete) {
          onAnalyzeComplete();
        }
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze video");
      if (currentGenerationId) {
        await supabase
          .from('user_generations')
          .update({ 
            status: 'error',
            error_message: error.message
          })
          .eq('id', currentGenerationId);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProcess = async (prompt: string, advancedSettings: AdvancedSettingsValues) => {
    if (!selectedFile) return;

    if (onBeforeProcess) {
      const canProceed = await onBeforeProcess();
      if (!canProceed) return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (currentGenerationId) {
        await supabase
          .from('user_generations')
          .update({
            prompt: prompt,
            status: 'processing',
            duration: advancedSettings.duration
          })
          .eq('id', currentGenerationId);
      }

      // Create FormData with all required fields
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('prompt', prompt);
      formData.append('duration', advancedSettings.duration.toString());
      formData.append('seed', advancedSettings.seed.toString());
      formData.append('numSteps', advancedSettings.numSteps.toString());
      formData.append('cfgStrength', advancedSettings.cfgStrength.toString());
      if (advancedSettings.negativePrompt) {
        formData.append('negativePrompt', advancedSettings.negativePrompt);
      }

      // Update to use invoke with proper function name and formData
      await processVideo(selectedFile, prompt, advancedSettings);
      resetUpload();
    } catch (error: any) {
      console.error("Error processing video:", error);
      toast.error(error.message || "Failed to process video");
      if (currentGenerationId) {
        await supabase
          .from('user_generations')
          .update({ 
            status: 'error',
            error_message: error.message
          })
          .eq('id', currentGenerationId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <VideoDropzone
        selectedFile={selectedFile}
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