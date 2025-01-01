import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdvancedSettings } from "@/components/upload/AdvancedSettings";
import { AdvancedSettingsValues } from "@/types/video";
import { PromptInput } from "./PromptInput";
import { VideoAnalysis } from "./VideoAnalysis";
import { Loader2, Scan } from "lucide-react";

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
    onProcess(prompt, advancedSettings);
  };

  return (
    <div className="space-y-4">
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
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Generate Sound Effect"
        )}
      </Button>

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
            <>
              <Scan className="mr-2 h-4 w-4" />
              Analyze Video
            </>
          )}
        </Button>
      )}
    </div>
  );
};