import { useState, useEffect } from "react";
import { AdvancedSettings } from "@/components/upload/AdvancedSettings";
import { AdvancedSettingsValues } from "@/types/video";
import { PromptInput } from "./PromptInput";
import { ProcessingStatus } from "./ProcessingStatus";
import { VideoAnalysisButton } from "./VideoAnalysisButton";
import { GenerateButton } from "./GenerateButton";

interface VideoProcessorProps {
  isProcessing: boolean;
  isUploading: boolean;
  onProcess: (prompt: string, settings: AdvancedSettingsValues) => Promise<void>;
  disabled: boolean;
  file: File | null;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  analysisResult?: string;
}

export const VideoProcessor = ({
  isProcessing,
  isUploading,
  onProcess,
  disabled,
  file,
  onAnalyze,
  isAnalyzing,
  analysisResult,
}: VideoProcessorProps) => {
  const [prompt, setPrompt] = useState("");
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValues>({
    seed: 0,
    duration: 10,
    numSteps: 25,
    cfgStrength: 4.5,
    negativePrompt: "",
  });

  useEffect(() => {
    if (analysisResult) {
      setPrompt(analysisResult);
    }
  }, [analysisResult]);

  return (
    <div className="space-y-4">
      {(isUploading || isProcessing || isAnalyzing) && (
        <ProcessingStatus 
          status={
            isAnalyzing 
              ? "Analyzing video content..." 
              : isUploading 
                ? "Uploading video..." 
                : "Processing video..."
          } 
          isUploading={isUploading || isAnalyzing}
        />
      )}

      <VideoAnalysisButton
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
        disabled={disabled}
        isUploading={isUploading}
        isProcessing={isProcessing}
      />

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        disabled={isProcessing || isAnalyzing}
        placeholder="Describe the sound effect you want to generate (optional)"
      />

      <AdvancedSettings
        settings={advancedSettings}
        onSettingsChange={setAdvancedSettings}
      />

      <GenerateButton
        onGenerate={() => onProcess(prompt, advancedSettings)}
        isUploading={isUploading}
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        disabled={disabled}
      />
    </div>
  );
};