import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onGenerate: () => void;
  isUploading: boolean;
  isProcessing: boolean;
  isAnalyzing: boolean;
  disabled: boolean;
}

export const GenerateButton = ({
  onGenerate,
  isUploading,
  isProcessing,
  isAnalyzing,
  disabled,
}: GenerateButtonProps) => {
  return (
    <Button
      className="w-full"
      size="lg"
      onClick={onGenerate}
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
  );
};