import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { VideoLibrary } from "@/components/VideoLibrary";

export default function Explore() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Amazing
              <span className="gradient-text"> Sound Effects</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the best AI-generated sound effects created by our community. Get inspired and create your own!
            </p>
          </div>
          <VideoLibrary />
        </div>
      </section>
    </div>
  );
}