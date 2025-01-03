import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, Share2, RefreshCw } from "lucide-react";

interface VideoDetailsProps {
  title: string;
  createdAt: string;
  prompt?: string;
  isMyVideos?: boolean;
  onRegenerateSoundEffect?: () => void;
}

export function VideoDetails({ 
  title, 
  createdAt, 
  prompt,
  isMyVideos,
  onRegenerateSoundEffect 
}: VideoDetailsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const shouldShowMoreButton = prompt && prompt.length > 150;
  const displayedPrompt = showFullPrompt ? prompt : prompt?.slice(0, 150) + "...";

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Title and Date */}
      <div>
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        <p className="text-sm text-[#E0E0E0]/60 mt-1">
          {format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      {/* Prompt/Description */}
      {prompt && (
        <div>
          <h3 className="text-sm font-medium mb-2">Prompt</h3>
          <p className="text-sm text-[#E0E0E0]/80 leading-relaxed">
            {displayedPrompt}
          </p>
          {shouldShowMoreButton && (
            <button
              onClick={() => setShowFullPrompt(!showFullPrompt)}
              className="text-sm text-[#8B5CF6] hover:text-[#9F7AEA] mt-2 transition-colors"
            >
              {showFullPrompt ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      )}

      {/* Comments Section - Placeholder for now */}
      <div className="py-4 border-t border-white/10">
        <h3 className="text-sm font-medium mb-2">Comments</h3>
        <p className="text-sm text-[#E0E0E0]/60">Comments coming soon...</p>
      </div>

      {/* Action Buttons */}
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
    </div>
  );
}