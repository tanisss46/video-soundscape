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
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    // Get request data
    const { action, ...data } = await req.json();
    console.log('Processing request:', { action, data });

    // Base URL for Replicate API
    const baseUrl = 'https://api.replicate.com/v1';

    // Configure the request based on the action
    let endpoint = '';
    let method = 'GET';
    let body = null;

    switch (action) {
      case 'create_prediction':
        endpoint = '/predictions';
        method = 'POST';
        body = JSON.stringify({
          version: data.version || "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
          input: {
            video: data.video_url,
            prompt: data.prompt || "default sound",
            seed: -1,
            duration: data.duration || 8,
            num_steps: data.num_steps || 25,
            cfg_strength: data.cfg_strength || 4.5,
            negative_prompt: "music"
          }
        });
        break;

      case 'get_prediction':
        endpoint = `/predictions/${data.prediction_id}`;
        break;

      case 'cancel_prediction':
        endpoint = `/predictions/${data.prediction_id}/cancel`;
        method = 'POST';
        break;

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Make request to Replicate API
    console.log(`Making ${method} request to ${baseUrl}${endpoint}`);
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${replicateApiToken}`,
        'Content-Type': 'application/json',
        'Prefer': action === 'create_prediction' ? 'wait' : undefined
      },
      body
    });

    const result = await response.json();
    console.log('Replicate API response:', result);

    if (!response.ok) {
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
    console.error('Error in mmaudio function:', error);
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