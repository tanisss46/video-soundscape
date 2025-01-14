import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const prompt = formData.get('prompt');
    const duration = formData.get('duration');
    const seed = formData.get('seed');
    const numSteps = formData.get('numSteps');
    const cfgStrength = formData.get('cfgStrength');
    const negativePrompt = formData.get('negativePrompt');

    if (!file || !prompt) {
      throw new Error('File and prompt are required');
    }

    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    // Upload to Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
        input: {
          video: file,
          prompt: prompt,
          seed: Number(seed) || 0,
          duration: Number(duration) || 10,
          num_steps: Number(numSteps) || 25,
          cfg_strength: Number(cfgStrength) || 4.5,
          ...(negativePrompt && { negative_prompt: negativePrompt })
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to process video');
    }

    const result = await response.json();
    
    // Poll for completion
    let status = result.status;
    while (status === 'starting' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check processing status');
      }
      
      const statusResult = await statusResponse.json();
      status = statusResult.status;
      
      if (status === 'succeeded') {
        // Download the processed video
        const videoResponse = await fetch(statusResult.output);
        if (!videoResponse.ok) {
          throw new Error('Failed to download processed video');
        }
        
        return new Response(await videoResponse.blob(), {
          headers: { ...corsHeaders, 'Content-Type': 'video/mp4' },
        });
      }
      
      if (status === 'failed') {
        throw new Error('Video processing failed');
      }
    }

    throw new Error('Unexpected processing status');
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