import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoDetails } from "./VideoDetails";

interface VideoDetailDialogProps {
  video: {
    id: string;
    title: string;
    video_url: string;
    created_at: string;
    user_generations?: {
      prompt?: string;
      audio_url?: string;
    }[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoDetailDialog({ video, open, onOpenChange }: VideoDetailDialogProps) {
  if (!video) return null;

  const audioUrl = video.user_generations?.[0]?.audio_url;
  const prompt = video.user_generations?.[0]?.prompt;

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[80vw] h-[80vh] p-0 gap-0 bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] h-full">
          {/* Video Section - 70% width on desktop */}
          <div className="relative h-full bg-black flex items-center justify-center">
            <VideoPlayer 
              videoUrl={video.video_url} 
              audioUrl={audioUrl} 
              autoPlay={true}
            />
          </div>

          {/* Details Section - 30% width on desktop */}
          <div className="relative h-full border-l border-border overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="p-6">
              <VideoDetails
                title={video.title}
                createdAt={video.created_at}
                prompt={prompt}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}