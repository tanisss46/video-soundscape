import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Replicate } from 'https://esm.sh/replicate@0.25.2';

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

    const replicate = new Replicate({
      auth: Deno.env.get('REPLICATE_API_TOKEN'),
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Start the prediction
    const prediction = await replicate.predictions.create({
      version: "4b9f801a167b1f6cc2db6ba7ffdeb307630bf411841d4e8300e63ca992de0be9",
      input: {
        video: videoUrl,
        prompt: prompt || "default sound"
      },
    });

    console.log('Prediction started:', prediction);

    // Save the initial prediction to the database
    const { error: dbError } = await supabaseClient
      .from('user_generations')
      .insert({
        prompt: prompt,
        status: prediction.status,
        video_url: videoUrl
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save prediction to database');
    }

    // Poll for the prediction result
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await replicate.predictions.get(prediction.id);
      console.log('Polling prediction:', result);
    }

    // Update the database with the final result
    const { error: updateError } = await supabaseClient
      .from('user_generations')
      .update({
        status: result.status,
        audio_url: result.output,
        error_message: result.error
      })
      .eq('prompt', prompt);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update prediction in database');
    }

    return new Response(
      JSON.stringify(result),
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