import { useDropzone } from "react-dropzone";

interface DropZoneProps {
  file: File | null;
  setFile: (file: File) => void;
}

export const DropZone = ({ file, setFile }: DropZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'video/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected file:</p>
          <p className="text-sm text-muted-foreground">{file.name}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragActive ? "Drop the video here" : "Drag & drop a video here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to select a file
          </p>
        </div>
      )}
    </div>
  );
};