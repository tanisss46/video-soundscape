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
    const fetchProcessingVideos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_generations')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['analyzing', 'analyzed', 'processing'])
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
          if (payload.new) {
            const newGeneration = payload.new as ProcessingVideo;
            
            if (payload.eventType === 'INSERT') {
              setProcessingVideos(prev => [newGeneration, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setProcessingVideos(prev => 
                prev.map(video => 
                  video.id === newGeneration.id ? newGeneration : video
                ).filter(video => 
                  video.id === newGeneration.id ? 
                    newGeneration.status !== 'completed' : 
                    video.status !== 'completed'
                )
              );
              
              if (newGeneration.status === 'completed') {
                toast({
                  title: "Process Complete",
                  description: `Sound effect generated successfully for Process #${newGeneration.id}`,
                  variant: "success"
                });
              } else if (newGeneration.status === 'error') {
                toast({
                  title: "Processing Error",
                  description: newGeneration.error_message || "An error occurred while processing your video.",
                  variant: "destructive",
                });
              }
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