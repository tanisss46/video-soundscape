import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VideoPlayer } from "./VideoPlayer";
import { VideoDetails } from "./VideoDetails";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

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
  onRegenerateSoundEffect?: () => void;
}

export function VideoDetailDialog({ 
  video, 
  open, 
  onOpenChange,
  onRegenerateSoundEffect 
}: VideoDetailDialogProps) {
  const location = useLocation();
  const isMyVideos = location.pathname === "/my-videos";
  
  if (!video) return null;

  const audioUrl = video.user_generations?.[0]?.audio_url;
  const prompt = video.user_generations?.[0]?.prompt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] p-0 gap-0 bg-[#1B1B1B] text-[#E0E0E0]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2",
          "shadow-lg shadow-black/20 overflow-hidden"
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] h-full max-h-[90vh]">
          {/* Video Section */}
          <div className="relative bg-black flex items-center justify-center max-h-[50vh] lg:max-h-[90vh]">
            <VideoPlayer 
              videoUrl={video.video_url} 
              audioUrl={audioUrl} 
              autoPlay={true}
            />
          </div>

          {/* Details Section */}
          <div className="relative border-l border-white/10 overflow-y-auto max-h-[40vh] lg:max-h-[90vh]">
            <div className="p-6">
              <VideoDetails
                title={video.title}
                createdAt={video.created_at}
                prompt={prompt}
                isMyVideos={isMyVideos}
                onRegenerateSoundEffect={onRegenerateSoundEffect}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}