import { useState } from "react";
import { Film, Heart, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { VideoGrid } from "./videos/VideoGrid";
import { Video } from "@/types/video";

export const VideoLibrary = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      console.log("Fetching videos for user:", user.id);

      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user_generations (
            id,
            prompt,
            audio_url,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      console.log("Fetched videos:", data);

      return data.map(video => ({
        ...video,
        audio_url: video.user_generations?.[0]?.audio_url
      })) as Video[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const handleMouseEnter = (videoId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    setCurrentlyPlayingId(videoId);
  };

  const handleMouseLeave = () => {
    setCurrentlyPlayingId(null);
  };

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Video download started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download video",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      // Invalidate and refetch the videos query
      queryClient.invalidateQueries({ queryKey: ['videos'] });

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
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
    <Tabs defaultValue="all" className="w-full space-y-8" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 bg-accent/50">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Film className="h-4 w-4" />
          All Videos
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Favorites
        </TabsTrigger>
        <TabsTrigger value="uploads" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          My Creations
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
      
      <TabsContent value="favorites">
        <VideoGrid
          videos={videos?.filter(() => false)}
          currentlyPlayingId={currentlyPlayingId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </TabsContent>
      
      <TabsContent value="uploads">
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