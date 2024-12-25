import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropZone } from "./upload/DropZone";
import { PromptInput } from "./upload/PromptInput";
import { UploadButton } from "./upload/UploadButton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProcessingStatus("Processing video...");

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("prompt", prompt || "default sound");
      formData.append("duration", "8");

      console.log("Sending request with:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        prompt: prompt || "default sound"
      });

      const response = await fetch("https://mmaudio-fastapi-nfjx.onrender.com/generate_sfx", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      console.log("Raw API Response:", responseText);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${responseText}`);
      }

      const apiResponse = JSON.parse(responseText);
      console.log("Parsed API Response:", apiResponse);

      if (apiResponse.status === "done" && apiResponse.video_url) {
        toast({
          title: "Success",
          description: "Video processed successfully!",
        });
        window.open(apiResponse.video_url, "_blank");
      } else {
        throw new Error("Invalid API response format");
      }

      setFile(null);
      setPrompt("");
      setProcessingStatus(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      setProcessingStatus("Error occurred during processing");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      <DropZone file={file} setFile={setFile} />
      <PromptInput prompt={prompt} setPrompt={setPrompt} />
      {processingStatus && (
        <div className="space-y-2">
          <Alert>
            <AlertDescription>{processingStatus}</AlertDescription>
          </Alert>
          <Progress value={isUploading ? 75 : 0} className="h-2" />
        </div>
      )}
      <UploadButton isUploading={isUploading} disabled={!file} />
    </form>
  );
};