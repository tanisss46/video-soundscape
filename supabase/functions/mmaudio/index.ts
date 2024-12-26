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
      throw new Error('REPLICATE_API_TOKEN is not configured in Supabase Edge Function secrets');
    }

    const { action, ...params } = await req.json();
    console.log('Processing request:', { action, params });

    switch (action) {
      case 'create_prediction':
        const prediction = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${replicateApiToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'wait'
          },
          body: JSON.stringify({
            version: params.version || "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
            input: {
              video: params.video_url,
              prompt: params.prompt || "default sound",
              seed: -1,
              duration: params.duration || 8,
              num_steps: params.num_steps || 25,
              cfg_strength: params.cfg_strength || 4.5,
              negative_prompt: "music"
            }
          }),
        });

        const result = await prediction.json();
        console.log('Replicate API response:', result);

        if (!prediction.ok) {
          throw new Error(`Replicate API error: ${JSON.stringify(result)}`);
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_prediction':
        const status = await fetch(`https://api.replicate.com/v1/predictions/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${replicateApiToken}`,
          },
        });

        const statusResult = await status.json();
        return new Response(JSON.stringify(statusResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'cancel_prediction':
        const cancel = await fetch(`https://api.replicate.com/v1/predictions/${params.id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${replicateApiToken}`,
          },
        });

        const cancelResult = await cancel.json();
        return new Response(JSON.stringify(cancelResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }
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