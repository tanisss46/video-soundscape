import { format } from "date-fns";

interface VideoMetadataProps {
  title: string;
  createdAt: string;
}

export function VideoMetadata({ title, createdAt }: VideoMetadataProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight">{title}</h2>
      <p className="text-sm text-[#E0E0E0]/60 mt-1">
        {format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")}
      </p>
    </div>
  );
}