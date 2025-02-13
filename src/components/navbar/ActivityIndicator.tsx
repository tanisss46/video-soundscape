import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ProcessingVideo {
  id: number;
  prompt: string;
  status: string;
  error_message?: string;
  video_url?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'analyzing':
      return <Badge variant="secondary">Analyzing</Badge>;
    case 'processing':
      return <Badge variant="secondary">Generating Sound</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'downloaded':
      return <Badge variant="primary">Downloaded</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusMessage = (status: string) => {
  switch (status) {
    case 'analyzing':
      return 'Analyzing video content...';
    case 'analyzed':
      return 'Analysis complete, ready to generate';
    case 'processing':
      return 'Generating sound effect...';
    case 'completed':
      return 'Sound effect generated successfully';
    case 'error':
      return 'Error occurred';
    default:
      return status;
  }
};

export const ActivityIndicator = () => {
  const [processingVideos, setProcessingVideos] = useState<ProcessingVideo[]>([]);

  useEffect(() => {
    const fetchProcessingVideos = async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        const { data } = await supabase
          .from('user_generations')
          .select('*')
          .eq('user_id', currentUser.user.id)
          .in('status', ['analyzing', 'analyzed', 'processing'])
          .order('id', { ascending: false })
          .limit(10);
        
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
          if (payload.new) {
            const newGeneration = payload.new as ProcessingVideo;
            
            if (payload.eventType === 'INSERT') {
              setProcessingVideos(prev => [newGeneration, ...prev].slice(0, 10));
            } else if (payload.eventType === 'UPDATE') {
              setProcessingVideos(prev => 
                prev.map(video => 
                  video.id === newGeneration.id ? newGeneration : video
                ).filter(video => 
                  video.id === newGeneration.id ? 
                    newGeneration.status !== 'completed' : 
                    video.status !== 'completed'
                ).slice(0, 10)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      <HoverCardContent align="end" className="w-96">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Recent Activities</h4>
          <ScrollArea className="h-[300px] pr-4">
            {processingVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active processes</p>
            ) : (
              <div className="space-y-2">
                {processingVideos.map((video) => (
                  <div
                    key={video.id}
                    className="text-sm p-2 rounded-lg border bg-card flex items-start gap-3"
                  >
                    {video.video_url && (
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                        <video 
                          src={video.video_url} 
                          className="w-full h-full object-cover"
                          muted
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs text-muted-foreground">
                          Process #{video.id}
                        </p>
                        {getStatusBadge(video.status)}
                      </div>
                      <p className="text-sm truncate">
                        {getStatusMessage(video.status)}
                      </p>
                      {video.prompt && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {video.prompt}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};