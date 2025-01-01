import { Card, CardContent } from "@/components/ui/card";
import { Heart, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    video_url: string;
    user_generations: { audio_url: string | null }[] | null;
  };
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioUrl = video.user_generations?.[0]?.audio_url;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (audioUrl && isSoundEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      }
      audioRef.current.play();
    }
    if (videoRef.current) {
      videoRef.current.play();
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

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled && isHovered && audioRef.current && audioUrl) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <Card 
      className="group overflow-hidden bg-accent/50 border-accent hover:border-primary/50 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0 relative">
        <video 
          ref={videoRef}
          src={video.video_url}
          className="w-full aspect-video object-cover cursor-pointer"
          loop
          muted
          playsInline
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
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
            <button className="text-white/80 hover:text-white transition-colors">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
        {audioUrl && isHovered && isSoundEnabled && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-full">
              ♪ Playing sound effects...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};