interface VideoPreviewProps {
  file: File | null;
  isAnalyzing: boolean;
  isUploading: boolean;
}

export const VideoPreview = ({ file, isAnalyzing, isUploading }: VideoPreviewProps) => {
  if (!file) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="w-full max-w-sm overflow-hidden rounded-lg border">
          <video 
            src={URL.createObjectURL(file)} 
            controls 
            className="w-full aspect-video object-cover"
          />
        </div>
      </div>
    </div>
  );
};