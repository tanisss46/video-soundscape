import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Heart, Share2, Copy } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoDetails } from "./VideoDetails";
import { cn } from "@/lib/utils";

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
      <DialogContent 
        className={cn(
          "max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px] h-[90vh] p-0 gap-0 bg-[#1B1B1B] text-[#E0E0E0]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2"
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] h-full">
          {/* Video Section */}
          <div className="relative h-full bg-black flex items-center justify-center">
            <VideoPlayer 
              videoUrl={video.video_url} 
              audioUrl={audioUrl} 
              autoPlay={true}
            />
          </div>

          {/* Details Section */}
          <div className="relative h-full border-l border-white/10 overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 text-white/70 hover:text-white hover:scale-110 transition-all"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
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