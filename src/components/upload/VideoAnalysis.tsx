import { Button } from "@/components/ui/button";
import { Loader2, Scan } from "lucide-react";

interface VideoAnalysisProps {
  file: File | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const VideoAnalysis = ({ file, isAnalyzing, onAnalyze }: VideoAnalysisProps) => {
  if (!file) return null;

  return (
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
  );
};