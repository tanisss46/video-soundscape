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
        <Label htmlFor="prompt">Sound Description</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">
              For best results, be specific and descriptive about the sound you want. Include details about the environment and materials involved.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder || "Describe the sound you want (e.g., 'galloping horses on dirt', 'gentle water flowing')"}
        rows={3}
        disabled={disabled}
        className={disabled ? "bg-gray-50 cursor-not-allowed" : ""}
      />
    </div>
  );
};