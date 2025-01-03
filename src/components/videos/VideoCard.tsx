import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@/types/video";
import { VideoDetailDialog } from "./VideoDetailDialog";
import { VideoControls } from "./VideoControls";
import { VideoPreview } from "./VideoPreview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface VideoCardProps {
  video: Video;
  isPlaying: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onRegenerateSoundEffect?: () => void;
}

export const VideoCard = ({
  video,
  isPlaying,
  onMouseEnter,
  onMouseLeave,
  onDownload,
  onDelete,
  onRegenerateSoundEffect,
}: VideoCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
    toast.success("Video deleted successfully");
  };

  const handleCardClick = () => {
    setShowDetail(true);
    onMouseLeave();
  };

  return (
    <>
      <Card 
        className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-accent/50 border-accent hover:border-primary/50 cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 relative">
          <VideoPreview
            videoUrl={video.video_url}
            audioUrl={video.audio_url}
            isPlaying={isPlaying}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <VideoControls
            onDownload={handleDownloadClick}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      <VideoDetailDialog
        video={video}
        open={showDetail}
        onOpenChange={setShowDetail}
        onRegenerateSoundEffect={onRegenerateSoundEffect}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};