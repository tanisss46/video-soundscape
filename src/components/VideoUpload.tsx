import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropZone } from "./upload/DropZone";
import { PromptInput } from "./upload/PromptInput";
import { UploadButton } from "./upload/UploadButton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSettings, AdvancedSettingsValues } from "./upload/AdvancedSettings";

export const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValues>({
    seed: -1,
    duration: 10, // Increased default duration
    numSteps: 50, // Increased for better quality
    cfgStrength: 4.5, // Lowered for more natural results
    negativePrompt: "background noise, static" // Updated negative prompt
  });
  
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

    if (!prompt.trim()) {
      toast({
        title: "Warning",
        description: "Adding a descriptive prompt will help generate better sound effects",
      });
    }

    setIsUploading(true);
    setProcessingStatus("Uploading video...");
    setProcessedVideoUrl(null);

    try {
      // Get the current session to ensure we're authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication required");
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      setProcessingStatus("Generating sound effect...");

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('generate-sfx', {
        body: {
          videoUrl: publicUrl,
          prompt: prompt || "ambient sound matching the video content",
          seed: advancedSettings.seed,
          duration: advancedSettings.duration,
          numSteps: advancedSettings.numSteps,
          cfgStrength: advancedSettings.cfgStrength,
          negativePrompt: advancedSettings.negativePrompt
        }
      });

      if (error) throw error;

      console.log('Edge function response:', data);

      if (data.output) {
        setProcessedVideoUrl(data.output);
        toast({
          title: "Success",
          description: "Video processed successfully!",
        });
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
      <AdvancedSettings 
        settings={advancedSettings}
        onSettingsChange={setAdvancedSettings}
      />
      {processingStatus && (
        <div className="space-y-2">
          <Alert>
            <AlertDescription>{processingStatus}</AlertDescription>
          </Alert>
          <Progress value={isUploading ? 75 : 0} className="h-2" />
        </div>
      )}
      {processedVideoUrl && (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>Your video is ready!</AlertDescription>
          </Alert>
          <video 
            src={processedVideoUrl} 
            controls 
            className="w-full rounded-lg border"
          />
          <Button 
            type="button" 
            className="w-full"
            onClick={() => window.open(processedVideoUrl, "_blank")}
          >
            Download Video
          </Button>
        </div>
      )}
      <UploadButton isUploading={isUploading} disabled={!file} />
    </form>
  );
};
