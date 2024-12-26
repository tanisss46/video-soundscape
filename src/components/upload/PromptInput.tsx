import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const PromptInput = ({ prompt, setPrompt }: PromptInputProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Sound Description</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the sound you want (e.g., 'galloping horses on dirt', 'gentle water flowing', 'footsteps on wooden floor')"
          rows={3}
        />
      </div>
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          For best results, be specific and descriptive about the sound you want. Include details about the environment and materials involved.
        </AlertDescription>
      </Alert>
    </div>
  );
};