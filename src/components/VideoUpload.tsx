import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VideoDropzone } from "./upload/VideoDropzone";
import { VideoProcessor } from "./upload/VideoProcessor";
import { AdvancedSettingsValues } from "@/types/video";
import { useVideoProcessing } from "@/hooks/use-video-processing";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const { isUploading, isProcessing, processVideo } = useVideoProcessing(onAfterProcess);

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
    if (!selectedFile) return;

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
        if (onAnalyzeComplete) {
          onAnalyzeComplete();
        }
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
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
      await processVideo(selectedFile, prompt, advancedSettings);
      resetUpload();
    } catch (error: any) {
      console.error("Error processing video:", error);
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