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
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        {prompt && (
          <div>
            <h3 className="text-sm font-medium mb-1">Prompt</h3>
            <p className="text-sm text-muted-foreground">{prompt}</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isLiked && "fill-current text-red-500"
                )}
              />
              <span className="text-sm">124</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Copy className="h-4 w-4" />
            Clone
          </Button>
        </div>
      </div>
    </div>
  );
}