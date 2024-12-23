import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  isUploading: boolean;
  disabled?: boolean;
}

export const UploadButton = ({ isUploading, disabled }: UploadButtonProps) => {
  return (
    <Button type="submit" disabled={isUploading || disabled} className="w-full">
      {isUploading ? "Processing..." : "Add Sound Effect"}
    </Button>
  );
};