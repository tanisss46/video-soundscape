import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  audioUrl?: string;
  autoPlay?: boolean;
}

export const VideoPlayer = ({ videoUrl, audioUrl, autoPlay = false }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
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
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [autoPlay]);

  // Sync video and audio playback
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    const syncMediaState = async () => {
      try {
        if (isPlaying) {
          await Promise.all([
            video.play().catch(error => console.error("Video playback error:", error)),
            audio?.play().catch(error => console.error("Audio playback error:", error))
          ]);
        } else {
          video.pause();
          audio?.pause();
        }
      } catch (error) {
        console.error("Media sync error:", error);
        setIsPlaying(false);
      }
    };

    syncMediaState();
  }, [isPlaying]);

  // Handle play/pause toggle
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain bg-black"
        loop
        muted
        playsInline
        onClick={togglePlayback}
      />
      <button
        onClick={togglePlayback}
        className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full hover:bg-black/70 transition-colors"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};