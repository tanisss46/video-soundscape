import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { storeMediaFile } from "@/utils/media-storage";

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadVideo = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    setIsUploading(true);
    console.log('Processing video upload...');

    try {
      // Create a temporary URL for the file
      const tempUrl = URL.createObjectURL(file);
      
      // Store the video permanently in Supabase
      const permanentUrl = await storeMediaFile(tempUrl, user.id, 'video');
      
      // Clean up the temporary URL
      URL.revokeObjectURL(tempUrl);

      console.log('Video uploaded successfully:', permanentUrl);
      return permanentUrl;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadVideo,
  };
};