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
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      console.error('REPLICATE_API_TOKEN is not set');
      throw new Error('REPLICATE_API_TOKEN environment variable is not configured');
    }

    console.log('Making request to Replicate API...');
    console.log('Using token:', replicateApiToken.substring(0, 5) + '...');

    // Start prediction with retry mechanism
    let prediction;
    let retries = 3;
    
    while (retries > 0) {
      try {
        console.log(`Attempt ${4 - retries} to create prediction`);
        
        const response = await fetch('https://api.replicate.com/v1/predictions', {
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

        const responseData = await response.json();
        console.log('Replicate API Response:', JSON.stringify(responseData, null, 2));

        if (response.ok) {
          prediction = responseData;
          console.log('Successfully created prediction:', prediction.id);
          break;
        } else {
          console.error('Error response from Replicate:', responseData);
          throw new Error(`Replicate API error: ${JSON.stringify(responseData)}`);
        }
      } catch (error) {
        console.error(`Attempt ${4 - retries} failed:`, error);
        retries--;
        
        if (retries > 0) {
          console.log(`Retrying in 1 second... ${retries} attempts left`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }

    if (!prediction) {
      throw new Error('Failed to create prediction after all retries');
    }

    console.log('Starting to poll for prediction result...');

    // Poll for the prediction result with timeout
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes timeout

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - startTime > timeout) {
        throw new Error('Prediction timed out after 5 minutes');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Polling prediction ${prediction.id}...`);
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
        },
      });
      
      if (!pollResponse.ok) {
        const errorData = await pollResponse.json();
        console.error('Polling error:', errorData);
        throw new Error(`Polling error: ${JSON.stringify(errorData)}`);
      }
      
      prediction = await pollResponse.json();
      console.log('Current prediction status:', prediction.status);
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
    }

    console.log('Prediction completed successfully:', prediction);

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