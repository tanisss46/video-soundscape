import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { Video } from "@/types/video";

interface VideoCardProps {
  video: Video;
  isPlaying: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export const VideoCard = ({
  video,
  isPlaying,
  onMouseEnter,
  onMouseLeave,
  onDownload,
  onDelete,
}: VideoCardProps) => {
  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-accent/50 border-accent hover:border-primary/50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="p-0 relative">
        <video 
          src={video.video_url} 
          className="w-full aspect-video object-cover"
          controls={false}
          loop
          muted
          playsInline
          autoPlay={isPlaying}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">
              {new Date(video.created_at).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/20"
                onClick={onDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/20"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isPlaying && video.audio_url && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-full animate-pulse">
              ♪ Playing sound effects...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};