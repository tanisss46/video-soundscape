import { useState } from "react";
import { Film } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoGrid } from "./videos/VideoGrid";
import { useVideoLibrary } from "@/hooks/use-video-library";

export const VideoLibrary = () => {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const { videos, isLoading, error, handleDownload, handleDelete } = useVideoLibrary();

  const handleMouseEnter = (videoId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    setCurrentlyPlayingId(videoId);
  };

  const handleMouseLeave = () => {
    setCurrentlyPlayingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading videos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full space-y-8">
      <TabsList className="grid w-full grid-cols-1 bg-accent/50">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Film className="h-4 w-4" />
          All Videos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <VideoGrid
          videos={videos}
          currentlyPlayingId={currentlyPlayingId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </TabsContent>
    </Tabs>
  );
};