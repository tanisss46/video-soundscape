import { VideoMetadata } from "./details/VideoMetadata";
import { VideoPrompt } from "./details/VideoPrompt";
import { VideoActions } from "./details/VideoActions";

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
  return (
    <div className="flex flex-col h-full space-y-6">
      <VideoMetadata title={title} createdAt={createdAt} />
      <VideoPrompt prompt={prompt} />
      
      {/* Comments Section - Placeholder for now */}
      <div className="py-4 border-t border-white/10">
        <h3 className="text-sm font-medium mb-2">Comments</h3>
        <p className="text-sm text-[#E0E0E0]/60">Comments coming soon...</p>
      </div>

      <VideoActions 
        isMyVideos={isMyVideos} 
        onRegenerateSoundEffect={onRegenerateSoundEffect}
      />
    </div>
  );
}
