import { Check, Upload, Scan, Music, Download } from "lucide-react";

interface Step {
  number: number;
  label: string;
  icon: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export const StepIndicator = ({ currentStep, completedSteps }: StepIndicatorProps) => {
  const steps: Step[] = [
    { number: 1, label: "Upload", icon: <Upload className="w-5 h-5" /> },
    { number: 2, label: "Analyze", icon: <Scan className="w-5 h-5" /> },
    { number: 3, label: "Add Sound Effect", icon: <Music className="w-5 h-5" /> },
    { number: 4, label: "Download", icon: <Download className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isActive = currentStep === step.number;
          
          return (
            <div
              key={step.number}
              className="flex flex-col items-center space-y-2 relative"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted 
                    ? "bg-green-500 text-white" 
                    : isActive 
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
              {step.number < steps.length && (
                <div
                  className={`
                    absolute top-5 left-[40px] w-[calc(100%-20px)] h-[2px]
                    ${isCompleted ? "bg-green-500" : "bg-muted"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};