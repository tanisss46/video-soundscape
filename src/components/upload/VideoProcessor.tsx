import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdvancedSettings } from "@/components/upload/AdvancedSettings";
import { AdvancedSettingsValues } from "@/types/video";
import { PromptInput } from "./PromptInput";
import { ProcessingStatus } from "./ProcessingStatus";
import { Loader2, Scan } from "lucide-react";

interface VideoProcessorProps {
  isProcessing: boolean;
  isUploading: boolean;
  onProcess: (prompt: string, settings: AdvancedSettingsValues) => Promise<void>;
  disabled: boolean;
  file: File | null;
  onAnalyze: () => Promise<void>;
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

  const handleProcess = async () => {
    onProcess(prompt, advancedSettings);
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={onAnalyze}
        disabled={isAnalyzing || !file}
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
            Analyze Video Content
          </>
        )}
      </Button>

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

      <Button
        className="w-full"
        size="lg"
        onClick={handleProcess}
        disabled={disabled || isUploading || isProcessing || isAnalyzing}
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
    </div>
  );
};