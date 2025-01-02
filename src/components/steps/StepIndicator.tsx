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
      <div className="flex justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-muted">
          <div 
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ 
              width: `${(Math.max(...completedSteps) / steps.length) * 100}%`
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isActive = currentStep === step.number;
          const isLoading = (isAnalyzing && step.number === 2) || 
                          (isProcessing && step.number === 3);
          
          return (
            <div
              key={step.number}
              className="flex flex-col items-center space-y-2 relative z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted 
                    ? "bg-purple-100 text-purple-600" 
                    : isActive 
                      ? "bg-purple-600 text-white"
                      : "bg-background border-2 border-muted text-muted-foreground"
                )}
              >
                {isLoading ? step.loadingIcon : 
                 isCompleted ? <Check className="w-5 h-5" /> : 
                 step.icon}
              </div>
              <span className={cn(
                "text-sm font-medium whitespace-nowrap",
                isCompleted && "text-purple-600",
                isActive && "text-purple-600"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};