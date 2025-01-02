import { Activity, Bell, ChevronDown, Info, Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

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
        .in('status', ['analyzing', 'processing'])
        .order('id', { ascending: false });

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
            toast({
              title: "Processing Started",
              description: "Processing your video... Please wait.",
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
                title: "Video Ready",
                description: "Your video is ready to download.",
                variant: "success"
              });
              // Remove completed video after 5 seconds
              setTimeout(() => {
                setProcessingVideos(prev => 
                  prev.filter(video => video.id !== updatedVideo.id)
                );
              }, 5000);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzing':
        return (
          <Badge className="bg-[#FFA500] flex items-center gap-1">
            <Loader className="h-3 w-3 animate-spin" />
            Analyzing
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-[#FFA500] flex items-center gap-1">
            <Loader className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'completed':
        return <Badge className="bg-[#28A745]">Completed</Badge>;
      case 'downloaded':
        return <Badge className="bg-[#28A745]">Downloaded</Badge>;
      case 'error':
        return <Badge className="bg-[#DC3545]">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
                  <Collapsible key={video.id}>
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between gap-2">
                        {video.video_url && (
                          <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                            <video
                              src={video.video_url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              autoPlay
                              loop
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium truncate">
                              Process #{video.id}
                            </span>
                            {getStatusBadge(video.status)}
                          </div>
                          <CollapsibleTrigger className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                            <Info className="h-3 w-3 mr-1" />
                            Show details
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {video.prompt}
                        </p>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
}