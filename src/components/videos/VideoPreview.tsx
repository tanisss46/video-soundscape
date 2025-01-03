import { useRef, useEffect } from "react";

interface VideoPreviewProps {
  videoUrl: string;
  audioUrl?: string;
  isPlaying: boolean;
}

export const VideoPreview = ({ videoUrl, audioUrl, isPlaying }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    if (isPlaying) {
      Promise.all([
        video.play().catch(error => console.error("Video playback error:", error)),
        audio?.play().catch(error => console.error("Audio playback error:", error))
      ]);
    } else {
      video.pause();
      video.currentTime = 0;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [isPlaying]);

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