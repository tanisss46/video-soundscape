import { Activity, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActivityList } from "./activity/ActivityList";

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
  const { toast } = useToast();

  useEffect(() => {
    // Fetch existing processing videos on mount
    const fetchProcessingVideos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_generations')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['analyzing', 'processing', 'completed'])
        .order('id', { ascending: false })
        .limit(10);

      if (data) {
        setProcessingVideos(data);
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
            setProcessingVideos(prev => [payload.new as ProcessingVideo, ...prev]);
          } else if (payload.new && payload.eventType === 'UPDATE') {
            const updatedVideo = payload.new as ProcessingVideo;
            setProcessingVideos(prev => 
              prev.map(video => 
                video.id === updatedVideo.id ? updatedVideo : video
              )
            );
            
            if (updatedVideo.status === 'completed') {
              // Only show completion toast
              toast({
                title: "Process Complete",
                description: `Process #${updatedVideo.id} has been completed.`,
                variant: "success"
              });
              
              // Remove completed video after 30 seconds
              setTimeout(() => {
                setProcessingVideos(prev => 
                  prev.filter(video => video.id !== updatedVideo.id)
                );
              }, 30000);
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
            <ActivityList videos={processingVideos} />
          </div>
        </div>
      )}
    </>
  );
}