import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoUrl } = await req.json()

    if (!videoUrl) {
      throw new Error('No video URL provided')
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "9da7e9a554d36bb7b5fec36b43b00e4616dc1e819bc963ded8e053d8d8196cb5",
        input: {
          prompt: "Please describe this video in detail",
          input_video: videoUrl
        }
      })
    })

    const prediction = await response.json()

    // Poll for the result
    const predictionId = prediction.id
    let result = prediction

    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('REPLICATE_API_TOKEN')}`,
          },
        }
      )
      result = await pollResponse.json()
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})