import { useRef, useEffect } from "react";

interface VideoThumbnailProps {
  videoUrl: string;
  audioUrl?: string;
  isPlaying: boolean;
  onLoadError?: (error: Error) => void;
}

export const VideoThumbnail = ({ 
  videoUrl, 
  audioUrl, 
  isPlaying,
  onLoadError 
}: VideoThumbnailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
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

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    const playMedia = async () => {
      try {
        if (isPlaying) {
          await Promise.all([
            video.play().catch(error => {
              console.error("Video playback error:", error);
              onLoadError?.(error);
            }),
            audio?.play().catch(error => {
              console.error("Audio playback error:", error);
              onLoadError?.(error);
            })
          ]);
        } else {
          video.pause();
          video.currentTime = 0;
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      } catch (error: any) {
        console.error("Media playback error:", error);
        onLoadError?.(error);
      }
    };

    playMedia();
  }, [isPlaying, onLoadError]);

  return (
    <video 
      ref={videoRef}
      src={videoUrl}
      className="w-full aspect-video object-cover"
      loop
      muted
      playsInline
    />
  );
};