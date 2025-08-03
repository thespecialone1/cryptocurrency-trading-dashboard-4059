import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, portfolio, selectedCoins, chatHistory } = await req.json()
    
    // Get the API key from environment variables
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Prepare portfolio context
    const portfolioContext = portfolio?.length > 0 
      ? `User's Portfolio:\n${portfolio.map((entry: any) => 
          `- ${entry.coin.toUpperCase()}: ${entry.amount} tokens at $${entry.avgBuyPrice} average buy price (Total invested: $${(entry.amount * entry.avgBuyPrice).toFixed(2)})`
        ).join('\n')}\n\n`
      : 'User has not entered any portfolio data yet.\n\n'

    const selectedCoinsContext = selectedCoins?.length > 0
      ? `User is tracking these coins: ${selectedCoins.map((coin: string) => coin.toUpperCase()).join(', ')}\n\n`
      : 'User has not selected specific coins to track.\n\n'

    const systemPrompt = `You are a cryptocurrency portfolio advisor and market analyst. You have access to the user's portfolio data and their selected coins for tracking.

${portfolioContext}${selectedCoinsContext}

IMPORTANT RULES:
1. ONLY answer questions related to cryptocurrency, blockchain, trading, investments, and financial markets
2. If asked about anything else (weather, cooking, general topics, etc.), politely redirect: "I'm a cryptocurrency specialist. Please ask me about crypto investments, market analysis, or your portfolio."
3. If the user has no portfolio data, encourage them to add their investments first for personalized advice

Your role is to:
1. Analyze the user's portfolio performance and provide insights
2. Suggest investment strategies based on their current holdings  
3. Provide market analysis and trends for their tracked coins
4. Help with risk management and portfolio diversification
5. Answer questions about cryptocurrency markets and investment strategies
6. Provide education about blockchain technology and crypto fundamentals

Always be helpful, accurate, and provide actionable advice. If you don't have real-time data, make that clear and provide general guidance based on historical trends and market principles. Keep responses concise but informative.`

    // Prepare conversation history
    const conversationHistory = chatHistory?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || []

    // Add current message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in chat-with-ai function:', error)
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