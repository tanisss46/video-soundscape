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
  error_message?: string;
}

export const ActivityIndicator = () => {
  const [processingVideos, setProcessingVideos] = useState<ProcessingVideo[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProcessingVideos = async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        const { data } = await supabase
          .from('user_generations')
          .select('*')
          .eq('user_id', currentUser.user.id)
          .in('status', ['processing', 'analyzing'])
          .order('id', { ascending: false });
        
        if (data) {
          setProcessingVideos(data);
        }
      }
    };

    fetchProcessingVideos();

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
              title: "Processing Started",
              description: "Your sound effect is being generated...",
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
                title: "Sound Effect Ready!",
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
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {processingVideos.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
              {processingVideos.length}
            </span>
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Active Processes</h4>
          {processingVideos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active processes</p>
          ) : (
            processingVideos.map((video) => (
              <div
                key={video.id}
                className="text-sm p-2 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-muted-foreground">
                    {video.prompt || "Generating sound effect..."}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap bg-primary/20 text-primary">
                    {video.status === 'processing' ? 'Generating' : video.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};