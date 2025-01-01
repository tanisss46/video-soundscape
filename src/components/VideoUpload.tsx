import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { AdvancedSettings } from "@/components/upload/AdvancedSettings";
import { AdvancedSettingsValues } from "@/types/video";

interface VideoUploadProps {
  onBeforeProcess?: () => Promise<boolean>;
  onAfterProcess?: () => Promise<void>;
}

export const VideoUpload = ({ onBeforeProcess, onAfterProcess }: VideoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValues>({
    seed: -1,
    duration: 10,
    numSteps: 25,
    cfgStrength: 4.5,
    negativePrompt: "",
  });

  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetUpload = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setProgress(0);
  };

  const uploadVideo = async () => {
    if (!selectedFile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);
    setProgress(0);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from("videos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    // Check credits before processing
    if (onBeforeProcess) {
      const canProceed = await onBeforeProcess();
      if (!canProceed) return;
    }

    try {
      setIsProcessing(true);
      const videoUrl = await uploadVideo();
      if (!videoUrl) throw new Error("Failed to upload video");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create video record
      const { data: video, error: videoError } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          video_url: videoUrl,
        })
        .select()
        .single();

      if (videoError) throw videoError;

      // Create generation record
      const { data: generation, error: generationError } = await supabase
        .from("user_generations")
        .insert({
          user_id: user.id,
          video_id: video.id,
          prompt: prompt,
          status: "processing",
        })
        .select()
        .single();

      if (generationError) throw generationError;

      // Call Edge Function
      const { data: prediction, error: predictionError } = await supabase.functions.invoke("mmaudio", {
        body: {
          action: "create_prediction",
          params: {
            video_url: videoUrl,
            prompt: prompt,
            ...advancedSettings,
          },
        },
      });

      if (predictionError) throw predictionError;

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const { data: status } = await supabase.functions.invoke("mmaudio", {
          body: {
            action: "get_prediction",
            params: { id: prediction.id },
          },
        });

        if (status.status === "succeeded") {
          clearInterval(pollInterval);
          
          // Update generation with audio URL
          await supabase
            .from("user_generations")
            .update({
              audio_url: status.output,
              status: "completed",
            })
            .eq("id", generation.id);

          toast({
            title: "Success",
            description: "Sound effect generated successfully!",
          });

          // After successful processing
          if (onAfterProcess) {
            await onAfterProcess();
          }

          setIsProcessing(false);
          resetUpload();
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
          throw new Error("Failed to generate sound effect");
        }
      }, 1000);
    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: "Failed to process video. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
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
                resetUpload();
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe the sound effect you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <AdvancedSettings
          settings={advancedSettings}
          onSettingsChange={setAdvancedSettings}
        />

        <Button
          className="w-full"
          size="lg"
          onClick={handleProcess}
          disabled={!selectedFile || !prompt || isUploading || isProcessing}
        >
          {isUploading ? (
            "Uploading..."
          ) : isProcessing ? (
            "Processing..."
          ) : (
            "Generate Sound Effect"
          )}
        </Button>
      </div>
    </div>
  );
};