import { useState } from "react";

interface VideoPromptProps {
  prompt?: string;
}

export function VideoPrompt({ prompt }: VideoPromptProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  if (!prompt) return null;

  const shouldShowMoreButton = prompt.length > 150;
  const displayedPrompt = showFullPrompt ? prompt : prompt.slice(0, 150) + "...";

  return (
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
  );
}