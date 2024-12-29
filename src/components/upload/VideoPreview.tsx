import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface VideoPreviewProps {
  videoUrl: string;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const VideoPreview = ({ videoUrl, isAnalyzing, onAnalyze }: VideoPreviewProps) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>Your video is ready!</AlertDescription>
      </Alert>
      <video 
        src={videoUrl} 
        controls 
        className="w-full rounded-lg border"
      />
      <div className="flex gap-4">
        <Button 
          type="button" 
          className="flex-1"
          onClick={() => window.open(videoUrl, "_blank")}
        >
          Download Video
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="whitespace-nowrap"
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
      </div>
    </div>
  );
};