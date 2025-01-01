import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/video";
import { useToast } from "@/hooks/use-toast";

export const useVideoLibrary = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      console.log("Fetching videos for user:", user.id);

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
        console.error("Error fetching videos:", error);
        throw error;
      }

      console.log("Fetched videos:", data);

      return data.map(video => ({
        ...video,
        audio_url: video.user_generations?.[0]?.audio_url
      })) as Video[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      return true;
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      return false;
    }
  };

  const handleDownload = async (videoUrl: string, audioUrl?: string) => {
    try {
      const timestamp = new Date().getTime();
      const videoSuccess = await downloadFile(videoUrl, `video_${timestamp}.mp4`);
      let audioSuccess = false;
      
      if (audioUrl) {
        audioSuccess = await downloadFile(audioUrl, `audio_${timestamp}.mp3`);
      }

      if (!videoSuccess) {
        throw new Error('Failed to download video');
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
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download files",
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