import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface ProcessingVideo {
  id: number;
  prompt: string;
  status: string;
}

export const ActivityIndicator = () => {
  const [processingVideos, setProcessingVideos] = useState<ProcessingVideo[]>([]);
  const { toast } = useToast();

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
            toast({
              title: "New Video Processing",
              description: "Your video is being processed...",
            });
          } else if (payload.new && payload.eventType === 'UPDATE') {
            const updatedVideo = payload.new as ProcessingVideo;
            setProcessingVideos(prev => 
              prev.map(video => 
                video.id === updatedVideo.id ? updatedVideo : video
              ).filter(video => video.status !== 'completed' && video.status !== 'error')
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

  if (processingVideos.length === 0) return null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {processingVideos.length}
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Active Processes</h4>
          {processingVideos.map((video) => (
            <div
              key={video.id}
              className="text-sm p-2 rounded-lg border bg-card"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-muted-foreground">
                  {video.prompt || "Processing video..."}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
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
      </HoverCardContent>
    </HoverCard>
  );
};