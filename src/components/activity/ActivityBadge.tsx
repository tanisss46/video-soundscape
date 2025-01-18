import { Check, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityBadgeProps {
  status: string;
}

export const ActivityBadge = ({ status }: ActivityBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'analyzing':
        return {
          label: 'Analyzing',
          icon: Loader2,
          className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
        };
      case 'analyzed':
        return {
          label: 'Ready',
          icon: Check,
          className: 'bg-blue-500/20 text-blue-500 border-blue-500/50'
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: Loader2,
          className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
        };
      case 'completed':
        return {
          label: 'Ready',
          icon: Check,
          className: 'bg-green-500/20 text-green-500 border-green-500/50'
        };
      case 'error':
        return {
          label: 'Failed',
          icon: AlertTriangle,
          className: 'bg-red-500/20 text-red-500 border-red-500/50'
        };
      default:
        return {
          label: status,
          icon: null,
          className: 'bg-gray-500/20 text-gray-500 border-gray-500/50'
        };
    }
  };

  const { label, icon: Icon, className } = getStatusConfig();

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1 font-normal",
        className
      )}
    >
      {Icon && <Icon className={cn(
        "h-3 w-3",
        (status === 'analyzing' || status === 'processing') && "animate-spin"
      )} />}
      {label}
    </Badge>
  );
};