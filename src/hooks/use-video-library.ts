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

  const handleDownload = async (videoUrl: string, audioUrl?: string) => {
    try {
      // Download video
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) throw new Error('Failed to fetch video');
      const videoBlob = await videoResponse.blob();
      const videoDownloadUrl = window.URL.createObjectURL(videoBlob);
      const videoLink = document.createElement('a');
      videoLink.href = videoDownloadUrl;
      videoLink.download = 'video.mp4';
      videoLink.click();
      window.URL.revokeObjectURL(videoDownloadUrl);

      // Download audio if available
      if (audioUrl) {
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) throw new Error('Failed to fetch audio');
        const audioBlob = await audioResponse.blob();
        const audioDownloadUrl = window.URL.createObjectURL(audioBlob);
        const audioLink = document.createElement('a');
        audioLink.href = audioDownloadUrl;
        audioLink.download = 'audio.mp3';
        audioLink.click();
        window.URL.revokeObjectURL(audioDownloadUrl);
      }
      
      toast({
        title: "Success",
        description: audioUrl 
          ? "Video and audio download started" 
          : "Video download started",
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