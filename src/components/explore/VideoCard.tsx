import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { VideoDetailDialog } from "../videos/VideoDetailDialog";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    video_url: string;
    created_at: string;
    user_generations: { audio_url: string | null }[] | null;
  };
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = video.user_generations?.[0]?.audio_url;

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (audioUrl && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.error("Audio playback error:", error);
      }
    }
    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video playback error:", error);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleClick = () => {
    setShowDetail(true);
    handleMouseLeave();
  };

  return (
    <>
      <Card 
        className="web3-card group overflow-hidden cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <CardContent className="p-0 relative">
          <video 
            ref={videoRef}
            src={video.video_url}
            className="w-full aspect-video object-cover"
            loop
            muted
            playsInline
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-web3-background/90 via-web3-background/20 to-transparent 
                       opacity-0 group-hover:opacity-100 transition-all duration-300"
          />
          
          {audioUrl && isHovered && (
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-web3-surface/80 text-web3-accent px-2 py-1 rounded-full animate-fade-up">
                ♪ Playing sound effects...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <VideoDetailDialog
        video={video}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
};