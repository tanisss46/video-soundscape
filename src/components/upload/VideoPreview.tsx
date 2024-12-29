import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  file: File | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const VideoPreview = ({ file, isAnalyzing, onAnalyze }: VideoPreviewProps) => {
  if (!file) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-lg border">
          <video 
            src={URL.createObjectURL(file)} 
            controls 
            className="w-full aspect-video object-cover"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          type="button" 
          onClick={onAnalyze} 
          disabled={isAnalyzing}
          className="flex-1"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Video"}
        </Button>
        <Button type="submit" disabled={isAnalyzing} className="flex-1">
          Add Sound Effect
        </Button>
      </div>
    </div>
  );
};