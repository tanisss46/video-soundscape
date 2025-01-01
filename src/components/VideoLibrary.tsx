import { useState, useRef } from "react";
import { Film, Heart, Upload, Edit3, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type UserGeneration = {
  audio_url: string | null;
};

type VideoWithGenerations = {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
  user_generations: UserGeneration[] | null;
};

type Video = {
  id: string;
  title: string;
  video_url: string;
  audio_url?: string;
  created_at: string;
};

export const VideoLibrary = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { toast } = useToast();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          video_url,
          created_at,
          user_generations!video_id (
            audio_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const transformedData = data.map(video => ({
        ...video,
        audio_url: video.user_generations?.[0]?.audio_url || undefined
      }));

      return transformedData as Video[];
    }
  });

  const handleMouseEnter = (videoId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    
    if (currentlyPlayingId && audioRefs.current[currentlyPlayingId]) {
      audioRefs.current[currentlyPlayingId].pause();
      audioRefs.current[currentlyPlayingId].currentTime = 0;
    }

    if (!audioRefs.current[videoId]) {
      audioRefs.current[videoId] = new Audio(audioUrl);
    }
    audioRefs.current[videoId].play();
    setCurrentlyPlayingId(videoId);
  };

  const handleMouseLeave = (videoId: string) => {
    if (audioRefs.current[videoId]) {
      audioRefs.current[videoId].pause();
      audioRefs.current[videoId].currentTime = 0;
      setCurrentlyPlayingId(null);
    }
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

  const renderVideoGrid = (videos: Video[] | null) => {
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
          <Card 
            key={video.id} 
            className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-accent/50 border-accent hover:border-primary/50"
            onMouseEnter={() => handleMouseEnter(video.id, video.audio_url)}
            onMouseLeave={() => handleMouseLeave(video.id)}
          >
            <CardContent className="p-0 relative">
              <video 
                src={video.video_url} 
                className="w-full aspect-video object-cover"
                controls={false}
                loop
                muted
                playsInline
                {...(currentlyPlayingId === video.id ? { autoPlay: true } : {})}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => handleDownload(video.video_url)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white hover:bg-white/20"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {currentlyPlayingId === video.id && video.audio_url && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-full animate-pulse">
                    ♪ Playing sound effects...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
        <AlertDescription>Error loading videos</AlertDescription>
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

      <TabsContent value="all" className="space-y-4">
        {renderVideoGrid(videos)}
      </TabsContent>
      
      <TabsContent value="favorites" className="space-y-4">
        {renderVideoGrid(videos?.filter(v => false))} {/* TODO: Add favorites functionality */}
      </TabsContent>
      
      <TabsContent value="uploads" className="space-y-4">
        {renderVideoGrid(videos)}
      </TabsContent>
    </Tabs>
  );
};