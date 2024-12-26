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

    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    // Get and verify the API token
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    // Create prediction
    const createPredictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
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
        },
      }),
    });

    if (!createPredictionResponse.ok) {
      const errorData = await createPredictionResponse.json();
      console.error('Replicate API error:', errorData);
      throw new Error(`Failed to create prediction: ${JSON.stringify(errorData)}`);
    }

    let prediction = await createPredictionResponse.json();
    console.log('Prediction created:', prediction.id);

    // Poll for results
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes timeout

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - startTime > timeout) {
        throw new Error('Prediction timed out after 5 minutes');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
        },
      });

      if (!pollResponse.ok) {
        const errorData = await pollResponse.json();
        console.error('Polling error:', errorData);
        throw new Error(`Error while polling: ${JSON.stringify(errorData)}`);
      }

      prediction = await pollResponse.json();
      console.log(`Status update for ${prediction.id}: ${prediction.status}`);
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
    }

    console.log('Prediction completed successfully:', prediction.id);
    return new Response(
      JSON.stringify(prediction),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
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
        },
      }
    );
  }
});