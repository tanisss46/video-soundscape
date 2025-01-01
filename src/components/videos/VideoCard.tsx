import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Volume2, VolumeX } from "lucide-react";
import { Video } from "@/types/video";
import { useState, useRef, useEffect } from "react";

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
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSoundEnabled(!isSoundEnabled);
  };

  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-accent/50 border-accent hover:border-primary/50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="p-0 relative">
        <video 
          ref={videoRef}
          src={video.video_url} 
          className="w-full aspect-video object-cover cursor-pointer"
          controls={false}
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <button 
              className="text-white/80 hover:text-white transition-colors"
              onClick={toggleSound}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>
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

        {isPlaying && video.audio_url && isSoundEnabled && (
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