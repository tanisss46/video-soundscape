import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart, Share, Copy, Volume2, VolumeX, Play, Pause, X } from "lucide-react";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
}

export function VideoDetailDialog({ video, open, onOpenChange }: VideoDetailDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!video) return null;

  const audioUrl = video.user_generations?.[0]?.audio_url;
  const prompt = video.user_generations?.[0]?.prompt;

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      videoRef.current.play();
      if (audioUrl && !audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Video Section */}
          <div className="relative bg-black flex items-center">
            <video
              ref={videoRef}
              src={video.video_url}
              className="w-full h-full object-contain"
              loop
              muted
              playsInline
              onMouseEnter={() => setShowVolumeControl(true)}
              onMouseLeave={() => setShowVolumeControl(false)}
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
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

              <div
                className={cn(
                  "flex items-center gap-2 transition-opacity duration-200",
                  showVolumeControl ? "opacity-100" : "opacity-0"
                )}
                onMouseEnter={() => setShowVolumeControl(true)}
                onMouseLeave={() => setShowVolumeControl(false)}
              >
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
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 flex flex-col h-full">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold">{video.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(video.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>

                {prompt && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Prompt</h3>
                    <p className="text-sm text-muted-foreground">{prompt}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        isLiked && "fill-current text-red-500"
                      )}
                    />
                    <span>124 likes</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share className="h-5 w-5" />
                    Share
                  </Button>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Clone & Try
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}