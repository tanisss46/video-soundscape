import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoUrl } = await req.json()
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set')
    }

    console.log('Analyzing video:', videoUrl)

    // Create prediction
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
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
    console.log('Initial prediction:', prediction)

    // Poll for the result
    const maxAttempts = 60 // 5 minutes maximum
    let attempts = 0
    let result = null

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        },
      })
      
      const statusData = await statusResponse.json()
      console.log('Status check:', statusData.status)
      
      if (statusData.status === "succeeded") {
        result = statusData.output
        break
      } else if (statusData.status === "failed") {
        throw new Error("Video analysis failed")
      }
      
      attempts++
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds between checks
    }

    if (!result) {
      throw new Error("Timeout waiting for video analysis")
    }

    return new Response(JSON.stringify({ output: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})