import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface VideoControlsProps {
  onDownload: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const VideoControls = ({ onDownload, onDelete }: VideoControlsProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/20"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/20"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};