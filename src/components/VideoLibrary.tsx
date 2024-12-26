import { useState } from "react";
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
  created_at: string;
};

export const VideoLibrary = () => {
  const [activeTab, setActiveTab] = useState("all");

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Video[];
    }
  });

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
          <Card key={video.id} className="overflow-hidden">
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