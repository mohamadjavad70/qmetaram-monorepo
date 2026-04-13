import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch recent market headlines from public RSS feeds
    const feeds = [
      'https://feeds.finance.yahoo.com/rss/2.0/headline?s=BTC-USD&region=US&lang=en-US',
      'https://feeds.finance.yahoo.com/rss/2.0/headline?s=ETH-USD&region=US&lang=en-US',
    ];

    let headlines: string[] = [];
    
    for (const feedUrl of feeds) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(feedUrl, { signal: controller.signal });
        clearTimeout(timeout);
        const text = await res.text();
        // Extract titles from RSS XML
        const titleMatches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || 
                             text.match(/<title>(.*?)<\/title>/g) || [];
        for (const match of titleMatches.slice(0, 5)) {
          const clean = match.replace(/<\/?title>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
          if (clean && clean !== 'Yahoo Finance') headlines.push(clean);
        }
      } catch {
        // Feed unavailable, continue
      }
    }

    if (headlines.length === 0) {
      headlines = [
        'Crypto markets consolidating amid macro uncertainty',
        'Bitcoin holds steady above key support levels',
        'Institutional interest in digital assets continues',
      ];
    }

    // Use Lovable AI for sentiment analysis
    let sentimentScore = 5; // neutral default
    let sentimentAnalysis = 'Neutral market conditions detected.';

    if (lovableApiKey) {
      try {
        const aiResponse = await fetch('https://ai.lovable.dev/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
              {
                role: 'system',
                content: 'You are Mowlana, a mystical market analyst. Analyze these headlines and respond with ONLY a JSON object: {"score": <1-10>, "analysis": "<one sentence in both English and Persian>", "phase": "<gathering|harmony|transcendence>"}. Score: 1=extreme fear, 5=neutral, 10=extreme greed.',
              },
              {
                role: 'user',
                content: `Analyze market sentiment from these headlines:\n${headlines.join('\n')}`,
              },
            ],
            max_tokens: 200,
            temperature: 0.3,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          // Try to parse JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            sentimentScore = Math.max(1, Math.min(10, parsed.score || 5));
            sentimentAnalysis = parsed.analysis || sentimentAnalysis;
          }
        }
      } catch (e) {
        console.error('AI sentiment analysis failed, using fallback:', e);
      }
    }

    // Store sentiment as trading intelligence for Mowlana
    const { data: mowlana } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('slug', 'molana')
      .single();

    if (mowlana) {
      await supabase.from('trading_intelligence').insert({
        agent_name: 'Mowlana',
        asset_symbol: 'MARKET',
        signal_type: sentimentScore >= 7 ? 'buy' : sentimentScore <= 3 ? 'sell' : 'hold',
        confidence: sentimentScore * 10,
        reasoning: `🌀 ${sentimentAnalysis}`,
        risk_level: sentimentScore >= 7 ? 'low' : sentimentScore <= 3 ? 'high' : 'medium',
        indicators: {
          vortex_phase: new Date().getUTCHours() % 9 < 3 ? 3 : new Date().getUTCHours() % 9 < 6 ? 6 : 9,
          sentiment_score: sentimentScore,
          headlines_analyzed: headlines.length,
          headlines: headlines.slice(0, 5),
          source: 'mowlana-news-sentiment',
          tesla_coefficient: 0.369,
        },
      });

      // Log lesson in learning vault
      await supabase.from('ai_learning_vault').insert({
        agent_id: mowlana.id,
        lesson: `📰 News sentiment cycle: Score ${sentimentScore}/10. ${sentimentAnalysis}`,
        confidence_before: Math.max(50, sentimentScore * 8),
        confidence_after: Math.max(55, sentimentScore * 9),
        indicators: {
          headlines,
          sentiment_score: sentimentScore,
          vortex_phase: new Date().getUTCHours() % 9 < 3 ? 3 : new Date().getUTCHours() % 9 < 6 ? 6 : 9,
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      sentiment: {
        score: sentimentScore,
        analysis: sentimentAnalysis,
        headlines_count: headlines.length,
        vortex_phase: new Date().getUTCHours() % 9 < 3 ? 3 : new Date().getUTCHours() % 9 < 6 ? 6 : 9,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Mowlana news sentiment error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
