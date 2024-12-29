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
    <div className="w-[70%] mx-auto space-y-6">
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
        <button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing || isUploading}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${!file ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
            'bg-primary text-primary-foreground hover:bg-primary/90'}`}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Video"}
        </button>
        
        <button
          onClick={handleUpload}
          disabled={!file || !prompt || isAnalyzing || isUploading}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${(!file || !prompt) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
            'bg-primary text-primary-foreground hover:bg-primary/90'}`}
        >
          {isUploading ? "Processing..." : "Add Sound Effect"}
        </button>
      </div>

      {file && <VideoPreview 
        file={file}
        isAnalyzing={isAnalyzing}
        isUploading={isUploading}
        onAnalyze={handleAnalyze}
        onUpload={handleUpload}
      />}
      
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