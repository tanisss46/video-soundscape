import { Activity, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActivityEntry } from "./ActivityEntry";

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
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
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
          if (payload.new && payload.eventType === 'INSERT') {
            setProcessingVideos(prev => [...prev, payload.new as ProcessingVideo]);
          } else if (payload.new && payload.eventType === 'UPDATE') {
            const updatedVideo = payload.new as ProcessingVideo;
            setProcessingVideos(prev => 
              prev.map(video => 
                video.id === updatedVideo.id ? updatedVideo : video
              )
            );
            
            if (updatedVideo.status === 'completed') {
              // Remove completed video after 5 seconds
              setTimeout(() => {
                setProcessingVideos(prev => 
                  prev.filter(video => video.id !== updatedVideo.id)
                );
              }, 5000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (processingVideos.length === 0) {
    return null;
  }

  return (
    <>
      {!isPanelOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-20 h-14 w-14 rounded-full shadow-lg bg-background"
          onClick={() => setIsPanelOpen(true)}
        >
          <Activity className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {processingVideos.length}
          </span>
        </Button>
      )}

      {isPanelOpen && (
        <div className="fixed right-4 top-20 w-[320px] bg-background border rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Active Processes</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
              <div className="space-y-3">
                {processingVideos.map((video) => (
                  <ActivityEntry
                    key={video.id}
                    id={video.id}
                    prompt={video.prompt}
                    status={video.status}
                    video_url={video.video_url}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
}