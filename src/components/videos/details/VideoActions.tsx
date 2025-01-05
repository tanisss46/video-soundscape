import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoActionsProps {
  isMyVideos?: boolean;
  onRegenerateSoundEffect?: () => void;
}

export function VideoActions({ isMyVideos, onRegenerateSoundEffect }: VideoActionsProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2",
          "hover:bg-white/5",
          isLiked && "text-[#8B5CF6]"
        )}
        onClick={() => setIsLiked(!isLiked)}
      >
        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        <span className="text-sm">Like</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-white/5"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm">Share</span>
      </Button>

      {isMyVideos && onRegenerateSoundEffect && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-white/5 ml-auto"
          onClick={onRegenerateSoundEffect}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm">Re-generate Sound</span>
        </Button>
      )}
    </div>
  );
}