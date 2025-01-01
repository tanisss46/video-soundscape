import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoDropzoneProps {
  selectedFile: File | null;
  videoUrl: string | null;
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
      onFileSelect(file);
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
          <video
            src={videoUrl!}
            className="max-h-[400px] mx-auto rounded-lg"
            controls
          />
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
              Supports MP4, MOV, or AVI
            </p>
          </div>
        </div>
      )}
    </div>
  );
};