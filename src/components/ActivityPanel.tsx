import { Activity, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-20 h-14 w-14 rounded-full shadow-lg bg-background"
        >
          <Activity className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {processingVideos.length}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Active Processes</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {processingVideos.map((video) => (
              <Collapsible key={video.id}>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {video.status === 'completed' 
                          ? "Your video is ready to download"
                          : "Processing your video... Please wait"}
                      </p>
                      <CollapsibleTrigger className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                        Show details
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </CollapsibleTrigger>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      video.status === 'completed' 
                        ? 'bg-primary/20 text-primary'
                        : video.status === 'error'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {video.status}
                    </span>
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
      </SheetContent>
    </Sheet>
  );
}