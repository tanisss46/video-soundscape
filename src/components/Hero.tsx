import { Button } from "@/components/ui/button";
import { Video, Music, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern">
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Your Videos with
            <span className="gradient-text"> AI-Powered Sound Effects</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your videos and let our AI automatically add perfectly timed, contextually relevant sound effects that bring your content to life.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-[#7b22b4] hover:bg-[#7b22b4]/90 gap-2">
              <Sparkles className="w-4 h-4" />
              Start Creating for Free
            </Button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-accent/50 p-6 rounded-lg backdrop-blur-sm animate-float">
            <Sparkles className="w-8 h-8 mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">Smart detection of scenes and context for perfect sound matching</p>
          </div>
          <div className="bg-accent/50 p-6 rounded-lg backdrop-blur-sm animate-float [animation-delay:200ms]">
            <Video className="w-8 h-8 mb-4 text-purple-400" />
            <h3 className="text-lg font-semibold mb-2">One-Click Upload</h3>
            <p className="text-sm text-muted-foreground">Simple drag-and-drop interface for quick video processing</p>
          </div>
          <div className="bg-accent/50 p-6 rounded-lg backdrop-blur-sm animate-float [animation-delay:400ms]">
            <Music className="w-8 h-8 mb-4 text-pink-400" />
            <h3 className="text-lg font-semibold mb-2">Premium Effects</h3>
            <p className="text-sm text-muted-foreground">Access to a vast library of high-quality sound effects</p>
          </div>
        </div>
      </div>
    </div>
  );
};