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
import { VideoDetailDialog } from "../videos/VideoDetailDialog";
import { useState } from "react";

interface ActivityEntryProps {
  id: number;
  prompt: string;
  status: string;
  video_url?: string;
  audio_url?: string;
  onRemove: (id: number) => void;
}

export const ActivityEntry = ({ 
  id, 
  prompt, 
  status, 
  video_url,
  audio_url, 
  onRemove 
}: ActivityEntryProps) => {
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  const getStatusMessage = () => {
    switch (status) {
      case 'analyzing':
        return "Analyzing video content...";
      case 'analyzed':
        return "Analysis complete";
      case 'processing':
        return "Generating sound effect...";
      case 'completed':
        return "Sound effect ready!";
      case 'error':
        return "Processing failed";
      default:
        return status;
    }
  };

  const handleEntryClick = () => {
    if (status === 'completed' && video_url) {
      setShowVideoDialog(true);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "p-3 rounded-lg border bg-card",
          status === 'completed' && "cursor-pointer hover:bg-accent/50 transition-colors"
        )}
        onClick={handleEntryClick}
      >
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
                Process #{id}
              </span>
              <ActivityBadge status={status} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {getStatusMessage()}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {video_url && (
        <VideoDetailDialog
          video={{
            id: id.toString(),
            video_url,
            audio_url,
            title: `Process #${id}`,
            created_at: new Date().toISOString(),
          }}
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
        />
      )}
    </>
  );
};