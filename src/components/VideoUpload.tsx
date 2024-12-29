import { DropZone } from "./upload/DropZone";
import { PromptInput } from "./upload/PromptInput";
import { AdvancedSettings } from "./upload/AdvancedSettings";
import { ProcessingStatus } from "./upload/ProcessingStatus";
import { VideoPreview } from "./upload/VideoPreview";
import { useVideoUpload } from "@/hooks/use-video-upload";

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
    <div className="space-y-6">
      <DropZone file={file} setFile={setFile} />
      {file && (
        <>
          <VideoPreview 
            file={file}
            isAnalyzing={isAnalyzing}
            isUploading={isUploading}
            onAnalyze={handleAnalyze}
            onUpload={handleUpload}
          />
          <PromptInput prompt={prompt} setPrompt={setPrompt} />
          <AdvancedSettings 
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </>
      )}
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
          className="w-full max-w-sm mx-auto rounded-lg border"
        />
      )}
    </div>
  );
};