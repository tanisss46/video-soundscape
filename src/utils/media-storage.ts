import { supabase } from "@/integrations/supabase/client";

export const storeMediaFile = async (
  url: string, 
  userId: string, 
  type: 'video' | 'audio'
) => {
  try {
    console.log(`Fetching ${type} from:`, url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${type} file`);
    const blob = await response.blob();

    const timestamp = Date.now();
    const extension = type === 'audio' ? 'mp3' : 'mp4';
    const filename = `${userId}/${timestamp}.${extension}`;
    const bucket = type === 'audio' ? 'audio-files' : 'videos';
    const contentType = type === 'audio' ? 'audio/mpeg' : 'video/mp4';

    console.log(`Uploading ${type} to Supabase:`, filename);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, blob, {
        cacheControl: '3600',
        contentType,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    console.log(`${type} stored successfully:`, publicUrl);
    return publicUrl;
  } catch (error) {
    console.error(`Error storing ${type} file:`, error);
    throw error;
  }
};