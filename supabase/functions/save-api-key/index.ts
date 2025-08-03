import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { apiKey } = await req.json()
    
    if (!apiKey || !apiKey.trim()) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // For now, we'll just validate the key format
    // In a real app, you might want to test the API key with Google's API
    if (!apiKey.startsWith('AIza')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Gemini API key format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // In this example, we're just returning success
    // The actual API key should be set as an environment variable in Supabase
    // You would need to manually add GEMINI_API_KEY to your Supabase project secrets
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Please add GEMINI_API_KEY to your Supabase project secrets with the value: ' + apiKey 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in save-api-key function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})