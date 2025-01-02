import { Info, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ActivityBadge } from "./ActivityBadge";

interface ActivityEntryProps {
  id: number;
  prompt: string;
  status: string;
  video_url?: string;
}

export const ActivityEntry = ({ id, prompt, status, video_url }: ActivityEntryProps) => {
  return (
    <Collapsible key={id}>
      <div className="p-3 rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-2">
          {video_url && (
            <div className="w-16 h-16 rounded overflow-hidden">
              <video
                src={video_url}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium truncate">
                {status === 'completed' 
                  ? "Processing complete"
                  : "Processing video..."}
              </span>
              <ActivityBadge status={status} />
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
            {prompt}
          </p>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};