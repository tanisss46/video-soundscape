import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useState } from "react";

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
  const audioUrl = video.user_generations?.[0]?.audio_url;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Card 
      className="group overflow-hidden bg-accent/50 border-accent hover:border-primary/50 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0 relative">
        <video 
          src={video.video_url}
          className="w-full aspect-video object-cover"
          loop
          muted
          playsInline
          {...(isHovered ? { autoPlay: true } : {})}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate">
              {new Date(video.created_at).toLocaleDateString()}
            </p>
            <button className="text-white/80 hover:text-white transition-colors">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
        {audioUrl && isHovered && (
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