import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16">
        <div className="flex items-center">
          <span className="text-xl font-bold gradient-text">SoundAI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm hover:text-primary/80 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm hover:text-primary/80 transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm hover:text-primary/80 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </nav>
  );
};