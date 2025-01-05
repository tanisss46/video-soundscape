import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePromptAnalysis = () => {
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeVideo = async (videoUrl: string) => {
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { videoUrl }
      });

      if (error) throw error;

      if (data.output) {
        setPrompt(data.output);
        toast({
          title: "Success",
          description: "Video analysis completed",
        });
      }

      return data.output;
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    prompt,
    setPrompt,
    isAnalyzing,
    analyzeVideo,
  };
};