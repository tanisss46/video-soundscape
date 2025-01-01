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

      if (error) throw error;

      return data.map(video => ({
        ...video,
        audio_url: video.user_generations?.[0]?.audio_url
      })) as Video[];
    },
  });

  const handleDownload = async (videoUrl: string, audioUrl?: string) => {
    try {
      // If we have an audio URL, use that as the video URL since it contains both video and audio
      const finalVideoUrl = audioUrl || videoUrl;
      
      const response = await fetch(finalVideoUrl);
      if (!response.ok) throw new Error('Failed to fetch video');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `video_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Video downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download video",
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