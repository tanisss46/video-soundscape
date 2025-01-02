import { Badge } from "@/components/ui/badge";

interface ActivityBadgeProps {
  status: string;
}

export const ActivityBadge = ({ status }: ActivityBadgeProps) => {
  switch (status) {
    case 'processing':
      return <Badge className="bg-[#FFA500]">Generating</Badge>;
    case 'analyzing':
      return <Badge className="bg-[#FFA500]">Analyzing</Badge>;
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