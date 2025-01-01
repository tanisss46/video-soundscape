import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdvancedSettings } from "@/components/upload/AdvancedSettings";
import { AdvancedSettingsValues } from "@/types/video";
import { VideoAnalysis } from "./VideoAnalysis";

interface VideoProcessorProps {
  isProcessing: boolean;
  isUploading: boolean;
  onProcess: (prompt: string, settings: AdvancedSettingsValues) => Promise<void>;
  disabled: boolean;
  file: File | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const VideoProcessor = ({
  isProcessing,
  isUploading,
  onProcess,
  disabled,
  file,
  onAnalyze,
  isAnalyzing,
}: VideoProcessorProps) => {
  const [prompt, setPrompt] = useState("");
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValues>({
    seed: 0,
    duration: 10,
    numSteps: 25,
    cfgStrength: 4.5,
    negativePrompt: "",
  });

  const handleProcess = () => {
    onProcess(prompt || "ambient sound matching the video content", advancedSettings);
  };

  return (
    <div className="space-y-4">
      <VideoAnalysis 
        file={file}
        isAnalyzing={isAnalyzing}
        onAnalyze={onAnalyze}
      />

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt (optional)</Label>
        <Textarea
          id="prompt"
          placeholder="Describe the sound effect you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <AdvancedSettings
        settings={advancedSettings}
        onSettingsChange={setAdvancedSettings}
      />

      <Button
        className="w-full"
        size="lg"
        onClick={handleProcess}
        disabled={disabled || isUploading || isProcessing}
      >
        {isUploading ? (
          "Uploading..."
        ) : isProcessing ? (
          "Processing..."
        ) : (
          "Generate Sound Effect"
        )}
      </Button>
    </div>
  );
};