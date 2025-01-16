import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    console.log("Received form data keys:", [...formData.keys()]);
    
    const file = formData.get('file');
    const prompt = formData.get('prompt') || '';
    const duration = formData.get('duration');
    const seed = formData.get('seed');
    const numSteps = formData.get('numSteps');
    const cfgStrength = formData.get('cfgStrength');
    const negativePrompt = formData.get('negativePrompt');

    console.log("Received file:", file ? "yes" : "no");
    console.log("Received prompt:", prompt);

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // 1. Upload the original video to Supabase Storage
    const timestamp = Date.now();
    const fileName = `original_${timestamp}.mp4`;
    
    console.log("Uploading original video to Supabase Storage:", fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        contentType: 'video/mp4',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload video: ${uploadError.message}`);
    }

    // 2. Get the public URL for the uploaded video
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log("Video public URL:", publicUrl);

    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    // 3. Send the video URL to Replicate
    console.log("Sending request to Replicate with video URL");
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
        input: {
          video: publicUrl,
          prompt: prompt || "ambient sound matching the video content",
          seed: Number(seed) || 0,
          duration: Number(duration) || 10,
          num_steps: Number(numSteps) || 25,
          cfg_strength: Number(cfgStrength) || 4.5,
          ...(negativePrompt && { negative_prompt: negativePrompt })
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Replicate API error:", error);
      throw new Error(error.detail || 'Failed to process video');
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction);

    // Poll for completion
    const maxAttempts = 180; // 3 minutes
    const pollInterval = 2000; // 2 seconds
    let attempts = 0;
    let result = prediction;

    while (attempts < maxAttempts && result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to check prediction status');
      }
      
      result = await pollResponse.json();
      console.log(`Attempt ${attempts + 1}/${maxAttempts}: Status = ${result.status}`);
      
      if (result.status === "failed") {
        throw new Error(result.error || "Model processing failed");
      }
      
      attempts++;
    }

    if (result.status !== "succeeded") {
      throw new Error(`Processing timeout after ${maxAttempts * (pollInterval/1000)} seconds`);
    }

    // 4. Download the processed video from Replicate
    console.log('Downloading processed video from Replicate:', result.output);
    const processedVideoResponse = await fetch(result.output);
    if (!processedVideoResponse.ok) {
      throw new Error('Failed to download processed video');
    }

    // Explicitly get the video as a blob with video/mp4 type
    const processedVideoBlob = await processedVideoResponse.blob();
    const videoBlob = new Blob([processedVideoBlob], { type: 'video/mp4' });
    
    // 5. Upload the processed video to Supabase Storage
    const processedFileName = `processed_${timestamp}.mp4`;
    console.log('Uploading processed video to Supabase:', processedFileName);
    
    const { data: processedUploadData, error: processedUploadError } = await supabase.storage
      .from('videos')
      .upload(processedFileName, videoBlob, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: false
      });

    if (processedUploadError) {
      console.error("Failed to upload processed video:", processedUploadError);
      throw new Error(`Failed to upload processed video: ${processedUploadError.message}`);
    }

    // Get the public URL for the processed video
    const { data: { publicUrl: processedPublicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(processedFileName);

    console.log('Video successfully processed and uploaded:', processedPublicUrl);

    return new Response(
      JSON.stringify({ 
        status: 'success',
        videoUrl: processedPublicUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in mmaudio function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});