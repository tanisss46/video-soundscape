import { useState, useRef } from "react";
import { Film, Heart, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
          user_generations (
            audio_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Transform the data to include the audio_url from the latest generation
      const transformedData = data.map(video => ({
        ...video,
        audio_url: video.user_generations?.[0]?.audio_url || null
      }));

      return transformedData as Video[];
    }
  });

  const handleMouseEnter = (videoId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    
    // Stop any currently playing audio
    if (currentlyPlayingId && audioRefs.current[currentlyPlayingId]) {
      audioRefs.current[currentlyPlayingId].pause();
      audioRefs.current[currentlyPlayingId].currentTime = 0;
    }

    // Play the new audio
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

  const renderVideoGrid = (videos: Video[] | null) => {
    if (!videos?.length) {
      return (
        <Alert>
          <AlertDescription>No videos found</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className="overflow-hidden transition-transform hover:scale-[1.02]"
            onMouseEnter={() => handleMouseEnter(video.id, video.audio_url)}
            onMouseLeave={() => handleMouseLeave(video.id)}
          >
            <CardContent className="p-0">
              <video 
                src={video.video_url} 
                controls 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-sm font-medium">
                  {new Date(video.created_at).toLocaleDateString()}
                </p>
                {currentlyPlayingId === video.id && video.audio_url && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ♪ Playing sound effects...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center">Loading videos...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading videos</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-8">
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
        {renderVideoGrid(videos)}
      </TabsContent>
      
      <TabsContent value="favorites">
        {renderVideoGrid(videos?.filter(v => false))} {/* TODO: Add favorites functionality */}
      </TabsContent>
      
      <TabsContent value="uploads">
        {renderVideoGrid(videos)}
      </TabsContent>
    </Tabs>
  );
};