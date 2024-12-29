import { Activity, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProcessingVideo {
  id: number;
  prompt: string;
  status: string;
  video_url?: string;
  audio_url?: string;
  error_message?: string;
}

export function ActivityPanel() {
  const [processingVideos, setProcessingVideos] = useState<ProcessingVideo[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to changes in user_generations table
    const channel = supabase
      .channel('user_generations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_generations'
        },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.new && payload.eventType === 'INSERT') {
            setProcessingVideos(prev => [...prev, payload.new as ProcessingVideo]);
            toast({
              title: "New Video Processing",
              description: "Your video is being processed...",
            });
          } else if (payload.new && payload.eventType === 'UPDATE') {
            const updatedVideo = payload.new as ProcessingVideo;
            setProcessingVideos(prev => 
              prev.map(video => 
                video.id === updatedVideo.id ? updatedVideo : video
              )
            );
            
            if (updatedVideo.status === 'completed') {
              toast({
                title: "Video Ready!",
                description: "Your video has been processed successfully.",
              });
            } else if (updatedVideo.status === 'error') {
              toast({
                title: "Processing Error",
                description: updatedVideo.error_message || "An error occurred while processing your video.",
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
        >
          <Activity className="h-6 w-6" />
          {processingVideos.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {processingVideos.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Activity</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {processingVideos.map((video) => (
              <div
                key={video.id}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Video Processing</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {video.prompt || "No prompt provided"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    video.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : video.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {video.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}