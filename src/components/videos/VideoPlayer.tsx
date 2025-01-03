import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  audioUrl?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ videoUrl, audioUrl, autoPlay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio if URL is provided
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.load(); // Explicitly load the audio
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (autoPlay) {
      handlePlay();
    }
  }, [autoPlay]);

  const handlePlay = async () => {
    if (!videoRef.current) return;
    
    try {
      await videoRef.current.play();
      if (audioRef.current && audioUrl) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        await audioRef.current.play();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    
    videoRef.current.pause();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain aspect-video"
        loop
        muted
        playsInline
      />
      
      <div 
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 transition-opacity duration-200",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        {audioUrl && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              className="w-24"
              onValueChange={handleVolumeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}