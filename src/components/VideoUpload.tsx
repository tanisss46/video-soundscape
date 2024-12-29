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
import { Loader2 } from "lucide-react";

export const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValues>({
    seed: -1,
    duration: 10,
    numSteps: 50,
    cfgStrength: 4.5,
    negativePrompt: "background noise, static"
  });
  
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!processedVideoUrl) {
      toast({
        title: "Error",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setVideoAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { videoUrl: processedVideoUrl }
      });

      if (error) throw error;

      if (data.output) {
        setVideoAnalysis(data.output);
        setPrompt(data.output);
        toast({
          title: "Success",
          description: "Video analysis completed",
        });
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication required");
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Create a record in user_generations table with user_id
      const { data: generationData, error: generationError } = await supabase
        .from('user_generations')
        .insert([
          {
            prompt: prompt || "ambient sound matching the video content",
            video_url: publicUrl,
            status: 'processing',
            user_id: session.user.id // Add the user_id here
          }
        ])
        .select()
        .single();

      if (generationError) throw generationError;

      setProcessingStatus("Generating sound effect...");

      const { data, error } = await supabase.functions.invoke('generate-sfx', {
        body: {
          videoUrl: publicUrl,
          prompt: prompt || "ambient sound matching the video content",
          seed: advancedSettings.seed,
          duration: advancedSettings.duration,
          num_steps: advancedSettings.numSteps,
          cfg_strength: advancedSettings.cfgStrength,
          negative_prompt: advancedSettings.negativePrompt
        }
      });

      if (error) throw error;

      console.log('Edge function response:', data);

      if (data.output) {
        // Update the generation record with the processed video
        const { error: updateError } = await supabase
          .from('user_generations')
          .update({
            status: 'completed',
            audio_url: data.output
          })
          .eq('id', generationData.id);

        if (updateError) throw updateError;

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
      <div className="flex gap-4">
        <PromptInput prompt={prompt} setPrompt={setPrompt} />
        {processedVideoUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-8 whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Video"
            )}
          </Button>
        )}
      </div>
      <AdvancedSettings 
        settings={advancedSettings}
        onSettingsChange={setAdvancedSettings}
      />
      {videoAnalysis && (
        <Alert>
          <AlertDescription className="whitespace-pre-wrap">
            {videoAnalysis}
          </AlertDescription>
        </Alert>
      )}
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
