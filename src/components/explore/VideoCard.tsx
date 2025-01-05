import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { VideoDetailDialog } from "../videos/VideoDetailDialog";
import { VideoThumbnail } from "../videos/common/VideoThumbnail";

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
  const audioUrl = video.user_generations?.[0]?.audio_url;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    setShowDetail(true);
    handleMouseLeave();
  };

  const handleLoadError = (error: Error) => {
    console.error("Media loading error:", error);
  };

  return (
    <>
      <Card 
        className="group overflow-hidden border border-white/10 hover:border-white/20 
                   transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-lg 
                   bg-[#262626] cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <CardContent className="p-0 relative">
          <VideoThumbnail
            videoUrl={video.video_url}
            audioUrl={audioUrl}
            isPlaying={isHovered}
            onLoadError={handleLoadError}
          />
          
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                       opacity-0 group-hover:opacity-100 transition-all duration-300"
          />
          
          {audioUrl && isHovered && (
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-black/80 text-white px-2 py-1 rounded-full animate-fade-up">
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