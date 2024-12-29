import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured in environment variables');
    }

    const { videoUrl, prompt, seed, duration, num_steps, cfg_strength, negative_prompt } = await req.json();
    console.log('Received request with parameters:', { videoUrl, prompt, seed, duration, num_steps, cfg_strength, negative_prompt });

    // Set default values if parameters are null or undefined
    const defaultSettings = {
      num_steps: 25, // Changed from 50 to 25
      cfg_strength: 4.5, // Changed from 7 to 4.5
      seed: -1,
      duration: 10,
    };

    // Create prediction with exact values from frontend or defaults
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
        input: {
          video: videoUrl,
          prompt: prompt,
          seed: seed ?? defaultSettings.seed,
          duration: duration ?? defaultSettings.duration,
          num_steps: num_steps ?? defaultSettings.num_steps,
          cfg_strength: cfg_strength ?? defaultSettings.cfg_strength,
          negative_prompt: negative_prompt || ""
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Replicate API error:', error);
      throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction);

    // Poll for completion with increased timeout and better error handling
    const maxAttempts = 180; // 3 minutes
    const pollInterval = 2000; // 2 seconds
    let attempts = 0;
    let result = prediction;

    while (attempts < maxAttempts && result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${replicateApiToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!pollResponse.ok) {
        console.error(`Poll request failed with status ${pollResponse.status}`);
        throw new Error(`Failed to check prediction status: ${pollResponse.statusText}`);
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

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error('Error in generate-sfx function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "An error occurred during sound effect generation. Please try again."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});