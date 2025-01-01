import { VideoCard } from "@/components/explore/VideoCard";
import { CategoryTabs } from "@/components/explore/CategoryTabs";
import { SearchInput } from "@/components/explore/SearchInput";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Explore() {
  const navigate = useNavigate();
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          video_url,
          created_at,
          user_generations (
            audio_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-[#0f111a]">
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Next-Generation
              <span className="gradient-text"> AI Sound Effects</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Easily add AI-generated sound effects to your videos. Upload your clip and let our AI do the rest.
            </p>
            <Button 
              size="lg" 
              className="mt-4"
              onClick={() => navigate('/create-sound-effect')}
            >
              Create Sound Effect
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <SearchInput />
            <CategoryTabs />
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos?.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}