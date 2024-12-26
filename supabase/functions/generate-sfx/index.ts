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
      throw new Error('REPLICATE_API_TOKEN is not configured in environment variables');
    }

    const { videoUrl, prompt, seed, duration, numSteps, cfgStrength, negativePrompt } = await req.json();

    // Create prediction
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
          seed: seed || -1,
          duration: duration || 8,
          num_steps: numSteps || 25,
          cfg_strength: cfgStrength || 4.5,
          negative_prompt: negativePrompt || "music"
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction);

    // Poll for completion
    const maxAttempts = 60;
    let attempts = 0;
    let result = prediction;

    while (attempts < maxAttempts && result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${replicateApiToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`Failed to check prediction status: ${pollResponse.statusText}`);
      }

      result = await pollResponse.json();
      console.log('Prediction status:', result.status);
      attempts++;
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Prediction failed");
    }

    if (result.status !== "succeeded") {
      throw new Error("Prediction timed out");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in generate-sfx function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});