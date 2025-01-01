import { Check, Upload, Scan, Music, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  icon: React.ReactNode;
  loadingIcon: React.ReactNode;
}

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  isAnalyzing?: boolean;
  isProcessing?: boolean;
}

export const StepIndicator = ({ 
  currentStep, 
  completedSteps,
  isAnalyzing = false,
  isProcessing = false,
}: StepIndicatorProps) => {
  const steps: Step[] = [
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

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isActive = currentStep === step.number;
          const isLoading = (isAnalyzing && step.number === 2) || 
                          (isProcessing && step.number === 3);
          
          return (
            <div
              key={step.number}
              className="flex flex-col items-center space-y-2 relative"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted 
                    ? "bg-green-100 text-green-600" 
                    : isActive 
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isLoading ? step.loadingIcon : 
                 isCompleted ? <Check className="w-5 h-5 text-green-600" /> : 
                 step.icon}
              </div>
              <span className={cn(
                "text-sm font-medium",
                isCompleted && "text-green-600",
                isActive && "text-primary"
              )}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-[40px] w-[calc(100%-20px)] h-[2px] transition-all duration-300",
                    isCompleted ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};