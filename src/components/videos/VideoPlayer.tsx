import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  audioUrl?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ videoUrl, audioUrl, autoPlay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedAutoPlay = useRef(false);

  // Initialize audio
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

  // Handle autoPlay
  useEffect(() => {
    if (autoPlay && !hasAttemptedAutoPlay.current && videoRef.current) {
      hasAttemptedAutoPlay.current = true;
      handlePlay();
    }
  }, [autoPlay, videoRef.current]);

  // Sync video and audio state
  const syncMediaState = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      try {
        const videoPromise = videoRef.current.play();
        const promises: Promise<void>[] = [videoPromise];
        
        if (audioRef.current && audioUrl) {
          audioRef.current.currentTime = videoRef.current.currentTime;
          audioRef.current.volume = volume;
          const audioPromise = audioRef.current.play();
          promises.push(audioPromise);
        }
        
        await Promise.all(promises);
      } catch (error) {
        console.error("Media sync error:", error);
        setIsPlaying(false);
      }
    } else {
      videoRef.current.pause();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Monitor video state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (video) video.currentTime = 0;
      if (audioRef.current) audioRef.current.currentTime = 0;
    };

    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync media whenever isPlaying changes
  useEffect(() => {
    syncMediaState();
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
      className="relative w-full h-full bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-h-full w-full object-contain"
          loop
          muted={!audioUrl}
          playsInline
        />
      </div>
      
      <div 
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 rounded-lg bg-black/50 backdrop-blur-sm transition-all duration-200",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
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
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
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