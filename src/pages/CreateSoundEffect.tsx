import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "@/components/VideoUpload";
import { StepIndicator } from "@/components/steps/StepIndicator";

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
        title: "Insufficient Credits",
        description: "Please purchase more credits or upgrade your plan.",
        variant: "destructive",
      });
      return false;
    }
    setCurrentStep(3);
    setCompletedSteps([1, 2]);
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
    setCompletedSteps([1, 2, 3]);
    setIsProcessing(false);
    
    toast({
      title: "Success!",
      description: "Your video with sound effect is ready! You can download it now.",
      variant: "default",
      className: "bg-green-500 text-white",
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
    setCompletedSteps([1, 2]);
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