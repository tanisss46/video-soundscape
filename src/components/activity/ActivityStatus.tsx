import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ActivityStatus = ({ status }: { status: string }) => {
  switch (status) {
    case 'analyzing':
      return (
        <Badge className="bg-[#FFA500] flex items-center gap-1">
          <Loader className="h-3 w-3 animate-spin" />
          Analyzing
        </Badge>
      );
    case 'processing':
      return (
        <Badge className="bg-[#FFA500] flex items-center gap-1">
          <Loader className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case 'completed':
      return <Badge className="bg-[#28A745]">Completed</Badge>;
    case 'downloaded':
      return <Badge className="bg-[#28A745]">Downloaded</Badge>;
    case 'error':
      return <Badge className="bg-[#DC3545]">Failed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};