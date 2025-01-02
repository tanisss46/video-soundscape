import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Share, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VideoDetailsProps {
  title: string;
  createdAt: string;
  prompt?: string;
}

export function VideoDetails({ title, createdAt, prompt }: VideoDetailsProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>

          {prompt && (
            <div>
              <h3 className="text-lg font-medium mb-2">Prompt</h3>
              <p className="text-sm text-muted-foreground">{prompt}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t pt-4 mt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isLiked && "fill-current text-red-500"
                )}
              />
              <span>124 likes</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share className="h-5 w-5" />
              Share
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Clone & Try
          </Button>
        </div>
      </div>
    </div>
  );
}