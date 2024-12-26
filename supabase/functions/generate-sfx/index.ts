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

    console.log('Processing video:', videoUrl);
    console.log('With prompt:', prompt);

    // Get the API token and verify it exists
    const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiKey) {
      console.error('REPLICATE_API_TOKEN is not set');
      throw new Error('REPLICATE_API_TOKEN environment variable is not configured');
    }

    console.log('Making request to Replicate API...');

    // Start prediction with retry mechanism
    let response;
    let retries = 3;
    
    while (retries > 0) {
      try {
        response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${replicateApiKey}`,
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

        const responseText = await response.text();
        console.log('Raw API Response:', responseText);
        
        if (response.ok) {
          response = new Response(responseText, response);
          break;
        }
        
        retries--;
        if (retries > 0) {
          console.log(`Retrying... ${retries} attempts left`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Fetch error:', error);
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response?.ok) {
      throw new Error(`Replicate API error: ${await response?.text()}`);
    }

    let prediction = await response.json();
    console.log('Initial prediction:', prediction);

    // Poll for the prediction result with timeout
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes timeout

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - startTime > timeout) {
        throw new Error('Prediction timed out after 5 minutes');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });
      
      if (!pollResponse.ok) {
        const error = await pollResponse.text();
        console.error('Polling error:', error);
        throw new Error(`Polling error: ${error}`);
      }
      
      prediction = await pollResponse.json();
      console.log('Polling prediction status:', prediction.status);
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }

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