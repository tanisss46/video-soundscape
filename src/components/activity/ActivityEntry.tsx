import { Info, ChevronDown, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityBadge } from "./ActivityBadge";

interface ActivityEntryProps {
  id: number;
  prompt: string;
  status: string;
  video_url?: string;
  onRemove: (id: number) => void;
}

export const ActivityEntry = ({ id, prompt, status, video_url, onRemove }: ActivityEntryProps) => {
  return (
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
                : status === 'analyzing'
                ? "Analyzing video..."
                : "Generating sound effect..."}
            </span>
            <ActivityBadge status={status} />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                <Info className="h-3 w-3 mr-1" />
                Show details
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Details</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{prompt}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-2"
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};