import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdvancedSettings } from "@/components/upload/AdvancedSettings";
import { AdvancedSettingsValues } from "@/types/video";
import { VideoAnalysis } from "./VideoAnalysis";
import { PromptInput } from "./PromptInput";
import { Loader2 } from "lucide-react";

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
      {file && (
        <Button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full"
          variant="secondary"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Video...
            </>
          ) : (
            "Analyze Video"
          )}
        </Button>
      )}

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        disabled={isProcessing}
        placeholder="Describe the sound effect you want to generate (optional)"
      />

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