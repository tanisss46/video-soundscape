import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VideoPreviewProps {
  file: File | null;
  isAnalyzing: boolean;
  isUploading: boolean;
  onAnalyze: () => void;
  onUpload: () => void;
}

export const VideoPreview = ({ file, isAnalyzing, isUploading, onAnalyze, onUpload }: VideoPreviewProps) => {
  if (!file) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="w-full max-w-sm overflow-hidden rounded-lg border">
          <video 
            src={URL.createObjectURL(file)} 
            controls 
            className="w-full aspect-video object-cover"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <Button 
          type="button" 
          onClick={onAnalyze} 
          disabled={isAnalyzing || isUploading}
          variant="default"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Video"
          )}
        </Button>
        <Button 
          type="submit" 
          onClick={onUpload}
          disabled={isAnalyzing || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Add Sound Effect"
          )}
        </Button>
      </div>
    </div>
  );
};