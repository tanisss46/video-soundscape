import { ChevronDown, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ActivityStatus } from "./ActivityStatus";

interface ProcessingVideo {
  id: number;
  prompt: string;
  status: string;
  video_url?: string;
}

export const ActivityList = ({ videos }: { videos: ProcessingVideo[] }) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
      <div className="space-y-3">
        {videos.map((video) => (
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
                    <ActivityStatus status={video.status} />
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
  );
};