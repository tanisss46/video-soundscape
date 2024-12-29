import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const InfoTooltip = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">
          For best results, be specific and descriptive about the sound you want. Include details about the environment and materials involved.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};