import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video } from "@/types/video";
import { VideoCard } from "./VideoCard"; // Add this import

interface VideoGridProps {
  videos: Video[] | null;
  onMouseEnter: (videoId: string, audioUrl?: string) => void;
  onMouseLeave: (videoId: string) => void;
  currentlyPlayingId: string | null;
  onDownload: (videoUrl: string) => void;
  onDelete: (videoId: string) => void;
}

export const VideoGrid = ({
  videos,
  onMouseEnter,
  onMouseLeave,
  currentlyPlayingId,
  onDownload,
  onDelete,
}: VideoGridProps) => {
  if (!videos?.length) {
    return (
      <Alert>
        <AlertDescription>No videos found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isPlaying={currentlyPlayingId === video.id}
          onMouseEnter={() => onMouseEnter(video.id, video.audio_url)}
          onMouseLeave={() => onMouseLeave(video.id)}
          onDownload={() => onDownload(video.video_url)}
          onDelete={() => onDelete(video.id)}
        />
      ))}
    </div>
  );
};