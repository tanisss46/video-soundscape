import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Music, Settings, Cloud, Sparkles, Info } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <Sparkles className="w-10 h-10 text-blue-400" />,
      title: "AI Scene Detection",
      description: "Advanced AI algorithms analyze your video content frame by frame to identify perfect moments for sound effects."
    },
    {
      icon: <Music className="w-10 h-10 text-purple-400" />,
      title: "Smart Sound Library",
      description: "Access thousands of premium sound effects, automatically matched to your video content."
    },
    {
      icon: <Settings className="w-10 h-10 text-pink-400" />,
      title: "Custom Controls",
      description: "Fine-tune and adjust AI suggestions with our intuitive editing interface."
    },
    {
      icon: <Cloud className="w-10 h-10 text-blue-400" />,
      title: "Cloud Processing",
      description: "Process your videos in the cloud for faster rendering and unlimited scalability."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-radial">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for
            <span className="gradient-text"> Content Creators</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to enhance your videos with professional-grade sound effects, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-accent/50 border-accent hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};