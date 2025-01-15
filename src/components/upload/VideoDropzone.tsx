import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoDropzoneProps {
  selectedFile: File | null;
  videoUrl?: string | null; // Made optional with ?
  onFileSelect: (file: File) => void;
  onReset: () => void;
}

export const VideoDropzone = ({ 
  selectedFile, 
  videoUrl, 
  onFileSelect, 
  onReset 
}: VideoDropzoneProps) => {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("video/")) {
      // Check video duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          toast({
            title: "Video too long",
            description: "Please upload a video that is 30 seconds or shorter",
            variant: "destructive",
          });
          return;
        }
        onFileSelect(file);
      };

      video.src = URL.createObjectURL(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? "border-primary bg-primary/5" : "border-border"}
        ${selectedFile ? "border-success" : ""}
      `}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <div className="space-y-4">
          {videoUrl && (
            <video
              src={videoUrl}
              className="max-h-[400px] mx-auto rounded-lg"
              controls
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop your video here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: MP4, MOV, AVI. Max length: 30s.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};