import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Flame, Clock } from "lucide-react";

export const CategoryTabs = () => {
  return (
    <Tabs defaultValue="trending">
      <TabsList className="bg-accent/50">
        <TabsTrigger value="trending" className="flex items-center gap-2">
          <Flame className="h-4 w-4" />
          Trending
        </TabsTrigger>
        <TabsTrigger value="latest" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Latest
        </TabsTrigger>
        <TabsTrigger value="featured" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Featured
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};