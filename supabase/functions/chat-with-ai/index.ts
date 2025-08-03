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

    // Prepare portfolio context with enhanced data
    const portfolioContext = portfolio?.length > 0 
      ? `User's Portfolio:\n${portfolio.map((entry: any) => {
          const totalInvested = entry.amount * entry.avg_buy_price;
          const buyDate = entry.buy_date ? new Date(entry.buy_date).toLocaleDateString() : 'Unknown';
          return `- ${entry.coin_name.toUpperCase()} (${entry.coin_id}): ${entry.amount} tokens at $${entry.avg_buy_price} average buy price (Total invested: $${totalInvested.toFixed(2)}, Bought: ${buyDate})`;
        }).join('\n')}\n\n`
      : 'User has not entered any portfolio data yet.\n\n'

    const selectedCoinsContext = selectedCoins?.length > 0
      ? `User is tracking these coins: ${selectedCoins.map((coin: string) => coin.toUpperCase()).join(', ')}\n\n`
      : 'User has not selected specific coins to track.\n\n'

    const systemPrompt = `You are an expert cryptocurrency portfolio advisor and market analyst with deep knowledge of blockchain technology, market dynamics, and investment strategies. You have access to the user's detailed portfolio data and their tracked coins.

${portfolioContext}${selectedCoinsContext}

IMPORTANT RULES:
1. ONLY answer questions related to cryptocurrency, blockchain, trading, investments, and financial markets
2. If asked about anything else (weather, cooking, general topics, etc.), politely redirect: "I'm a cryptocurrency specialist. Please ask me about crypto investments, market analysis, or your portfolio."
3. If the user has no portfolio data, encourage them to add their investments first for personalized advice

Your advanced capabilities include:
1. **Portfolio Analysis**: Analyze the user's current holdings, investment dates, average buy prices, and total invested amounts
2. **Investment Strategy**: Provide personalized buy/sell recommendations based on their holdings and market conditions
3. **Risk Assessment**: Evaluate portfolio diversification and suggest risk management strategies
4. **Market Insights**: Share relevant market trends for their tracked coins
5. **Timing Analysis**: Consider their investment timeline and suggest short-term vs long-term strategies
6. **Educational Guidance**: Explain complex crypto concepts in simple terms
7. **Profit/Loss Scenarios**: Help calculate potential outcomes based on different market scenarios

ENHANCED PERSONALIZATION:
- Always reference their specific coins and amounts when giving advice
- Consider their buy dates to assess current performance
- Factor in their total investment amounts for proportional recommendations
- Ask about their investment horizon (short-term: days/weeks, long-term: months/years) if not clear
- Inquire about their risk tolerance when suggesting strategies
- Provide specific price targets and percentage allocations when relevant

RESPONSE GUIDELINES:
- Keep responses FOCUSED and ACTIONABLE (3-5 sentences for quick answers)
- Use bullet points for multiple recommendations
- Include specific numbers and percentages when possible
- Reference their actual holdings in advice
- Ask clarifying questions about their goals and timeline
- Be direct about market risks and opportunities

Remember: You're providing personalized financial guidance based on their actual portfolio data. Always be accurate, helpful, and emphasize that crypto investments carry inherent risks.`

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