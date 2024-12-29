import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  file: File | null;
}

export const VideoPreview = ({ file }: VideoPreviewProps) => {
  if (!file) return null;

  return (
    <div className="mt-4">
      <video 
        src={URL.createObjectURL(file)} 
        controls 
        className="w-full rounded-lg border"
      />
    </div>
  );
};