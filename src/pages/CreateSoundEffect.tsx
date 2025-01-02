import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "@/components/VideoUpload";
import { StepIndicator } from "@/components/steps/StepIndicator";
import { Upload, Scan, Music, Check, LoaderCircle } from "lucide-react";

const steps = [
  { 
    number: 1, 
    label: "Upload", 
    icon: <Upload className="w-5 h-5" />,
    loadingIcon: <LoaderCircle className="w-5 h-5 animate-spin" />
  },
  { 
    number: 2, 
    label: "Analyze", 
    icon: <Scan className="w-5 h-5" />,
    loadingIcon: <LoaderCircle className="w-5 h-5 animate-spin" />
  },
  { 
    number: 3, 
    label: "Add Sound Effect", 
    icon: <Music className="w-5 h-5" />,
    loadingIcon: <LoaderCircle className="w-5 h-5 animate-spin" />
  },
  { 
    number: 4, 
    label: "Completed", 
    icon: <Check className="w-5 h-5" />,
    loadingIcon: <LoaderCircle className="w-5 h-5 animate-spin" />
  },
];

export default function CreateSoundEffect() {
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      setUserCredits(profile?.credits ?? 0);
    };

    fetchUserCredits();
  }, []);

  const handleBeforeProcess = async () => {
    if (userCredits === null) return false;
    
    if (userCredits < 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Insufficient credits",
      });
      return false;
    }
    setCurrentStep(3);
    setCompletedSteps(prev => [...prev, 2]);
    setIsProcessing(true);
    return true;
  };

  const handleAfterProcess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: userCredits! - 1 })
      .eq('id', user.id)
      .select('credits')
      .single();

    if (error) {
      console.error('Error updating credits:', error);
      return;
    }

    setUserCredits(data.credits);
    setCurrentStep(4);
    setCompletedSteps(prev => [...prev, 3]);
    setIsProcessing(false);
    
    toast({
      variant: "success",
      title: "Success",
      description: "Video processing completed!",
    });
  };

  const handleFileSelect = () => {
    setCurrentStep(2);
    setCompletedSteps([1]);
  };

  const handleAnalyzeStart = () => {
    setIsAnalyzing(true);
  };

  const handleAnalyzeComplete = () => {
    setIsAnalyzing(false);
    setCompletedSteps(prev => [...prev, 2]);
    setCurrentStep(3);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Sound Effect</h1>
        <p className="text-muted-foreground">
          Available Credits: {userCredits ?? '...'}
        </p>
      </div>

      <StepIndicator 
        currentStep={currentStep}
        completedSteps={completedSteps}
        isAnalyzing={isAnalyzing}
        isProcessing={isProcessing}
        steps={steps}
      />

      <VideoUpload 
        onBeforeProcess={handleBeforeProcess}
        onAfterProcess={handleAfterProcess}
        onFileSelect={handleFileSelect}
        onAnalyzeStart={handleAnalyzeStart}
        onAnalyzeComplete={handleAnalyzeComplete}
      />
    </div>
  );
}