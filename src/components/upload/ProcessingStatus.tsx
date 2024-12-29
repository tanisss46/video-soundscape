import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ProcessingStatusProps {
  status: string;
  isUploading: boolean;
}

export const ProcessingStatus = ({ status, isUploading }: ProcessingStatusProps) => {
  return (
    <div className="space-y-2">
      <Alert>
        <AlertDescription>{status}</AlertDescription>
      </Alert>
      <Progress value={isUploading ? 75 : 0} className="h-2" />
    </div>
  );
};