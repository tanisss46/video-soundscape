import { DropZone } from "./upload/DropZone";
import { PromptInput } from "./upload/PromptInput";
import { AdvancedSettings } from "./upload/AdvancedSettings";
import { ProcessingStatus } from "./upload/ProcessingStatus";
import { useVideoUpload } from "@/hooks/use-video-upload";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export const VideoUpload = () => {
  const {
    file,
    setFile,
    prompt,
    setPrompt,
    isUploading,
    isAnalyzing,
    processingStatus,
    processedVideoUrl,
    settings,
    handleSettingsChange,
    handleAnalyze,
    handleUpload,
  } = useVideoUpload();

  return (
    <div className="w-[80%] mx-auto space-y-6">
      <DropZone file={file} setFile={setFile} />
      
      <PromptInput 
        prompt={prompt} 
        setPrompt={setPrompt} 
        disabled={isAnalyzing || isUploading}
        placeholder="Sound suggestions will appear here after analysis..."
      />
      
      <AdvancedSettings 
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing || isUploading}
          variant="secondary"
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
        
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          variant="default"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Add Sound Effect"
          )}
        </Button>
      </div>
      
      {processingStatus && (
        <ProcessingStatus 
          status={processingStatus}
          isUploading={isUploading}
        />
      )}
      
      {processedVideoUrl && (
        <video 
          src={processedVideoUrl} 
          controls 
          className="w-full rounded-lg border"
        />
      )}
    </div>
  );
};