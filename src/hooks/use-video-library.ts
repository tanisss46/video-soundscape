import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/video";
import { useToast } from "@/hooks/use-toast";
import DownloadLogger, { DownloadError } from "@/utils/download-logger";

export const useVideoLibrary = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      DownloadLogger.info("Fetching videos for user: " + user.id);

      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user_generations (
            id,
            prompt,
            audio_url,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        DownloadLogger.error("Error fetching videos:", error);
        throw error;
      }

      DownloadLogger.info("Fetched videos: " + JSON.stringify(data, null, 2));

      return data.map(video => ({
        ...video,
        audio_url: video.user_generations?.[0]?.audio_url
      })) as Video[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const downloadFile = async (url: string, filename: string): Promise<boolean> => {
    DownloadLogger.info(`Starting download for ${filename} from ${url}`);
    
    try {
      // Validate URL
      if (!url) {
        throw new Error(DownloadError.INVALID_URL);
      }

      // Fetch the file
      DownloadLogger.info(`Fetching ${filename}...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(DownloadError.FETCH_FAILED);
      }

      // Create blob
      DownloadLogger.info(`Creating blob for ${filename}...`);
      const blob = await response.blob();
      if (!blob) {
        throw new Error(DownloadError.BLOB_CREATION_FAILED);
      }

      // Create and trigger download
      DownloadLogger.info(`Triggering download for ${filename}...`);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        DownloadLogger.info(`Cleanup completed for ${filename}`);
      }, 100);

      DownloadLogger.success(`Successfully downloaded ${filename}`);
      return true;
    } catch (error) {
      let errorCode = DownloadError.NETWORK_ERROR;
      
      if (error instanceof Error) {
        errorCode = error.message as DownloadError;
      }
      
      DownloadLogger.error(`Failed to download ${filename}:`, {
        error,
        errorCode,
        url,
        filename,
      });
      
      return false;
    }
  };

  const handleDownload = async (videoUrl: string, audioUrl?: string) => {
    DownloadLogger.info("Starting download process...");
    DownloadLogger.info(`Video URL: ${videoUrl}`);
    DownloadLogger.info(`Audio URL: ${audioUrl || 'No audio available'}`);

    try {
      const timestamp = new Date().getTime();
      const videoSuccess = await downloadFile(videoUrl, `video_${timestamp}.mp4`);
      let audioSuccess = false;
      
      if (audioUrl) {
        audioSuccess = await downloadFile(audioUrl, `audio_${timestamp}.mp3`);
      }

      if (!videoSuccess) {
        throw new Error(DownloadError.DOWNLOAD_TRIGGER_FAILED);
      }

      toast({
        title: "Success",
        description: audioUrl 
          ? audioSuccess 
            ? "Video and audio downloaded successfully"
            : "Video downloaded, but audio download failed"
          : "Video downloaded successfully",
      });
    } catch (error) {
      DownloadLogger.error('Download process failed:', error);
      toast({
        title: "Error",
        description: "Failed to download files. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['videos'] });

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  return {
    videos,
    isLoading,
    error,
    handleDownload,
    handleDelete,
  };
};