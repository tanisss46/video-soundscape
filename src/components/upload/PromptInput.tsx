import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const PromptInput = ({ prompt, setPrompt, disabled, placeholder }: PromptInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="prompt">Sound Description (Optional)</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">
              You can describe the sound you want, or let us analyze the video to generate a matching sound automatically.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder || "Leave empty for automatic sound generation based on video content"}
        rows={3}
        disabled={disabled}
        className={disabled ? "bg-gray-50 cursor-not-allowed" : ""}
      />
    </div>
  );
};