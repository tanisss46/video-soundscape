import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, prompt } = await req.json();
    console.log('Processing request for video:', videoUrl, 'with prompt:', prompt);

    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      console.error('REPLICATE_API_TOKEN is not configured');
      throw new Error('REPLICATE_API_TOKEN is not configured in Supabase Edge Function secrets');
    }

    console.log('Making request to Replicate API...');
    
    // Call Replicate API with exact specifications from their documentation
    const prediction = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
        input: {
          video: videoUrl,
          prompt: prompt || "default sound",
          seed: -1,
          duration: 8,
          num_steps: 25,
          cfg_strength: 4.5,
          negative_prompt: "music"
        }
      })
    });

    console.log('Replicate API response status:', prediction.status);
    const result = await prediction.json();
    console.log('Replicate API response:', result);

    // Check for API-specific error responses
    if (result.error) {
      console.error('Replicate API error:', result.error);
      throw new Error(`Replicate API error: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-sfx function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});