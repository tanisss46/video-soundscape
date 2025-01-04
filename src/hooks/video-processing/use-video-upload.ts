import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadVideo = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const filePath = `${user.id}/${timestamp}.${fileExt}`;

    setIsUploading(true);
    console.log('Uploading video:', filePath);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from("videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      console.log('Video uploaded successfully:', publicUrl);
      return publicUrl;
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