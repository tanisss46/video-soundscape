import { Button } from "@/components/ui/button";
import { Loader2, Scan } from "lucide-react";

interface VideoAnalysisButtonProps {
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  disabled: boolean;
  isUploading?: boolean;
  isProcessing?: boolean;
}

export const VideoAnalysisButton = ({
  onAnalyze,
  isAnalyzing,
  disabled,
  isUploading = false,
  isProcessing = false,
}: VideoAnalysisButtonProps) => {
  return (
    <Button
      className="w-full"
      size="lg"
      onClick={onAnalyze}
      disabled={disabled || isUploading || isProcessing || isAnalyzing}
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
  );
};