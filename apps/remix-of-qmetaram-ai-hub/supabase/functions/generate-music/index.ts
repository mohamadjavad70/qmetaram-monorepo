import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MusicRequest {
  prompt: string;
  duration?: number;
  mode: 'generate' | 'sfx';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ─── JWT Authentication ───
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user for music gen: ${userId}`);
    // ─── End Authentication ───

    const { prompt, duration = 30, mode = 'generate' } = await req.json() as MusicRequest;
    
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: 'Music generation service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'A valid prompt is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanPrompt = prompt.trim().slice(0, 500);
    const safeDuration = Math.min(Math.max(mode === 'sfx' ? 0.5 : 5, duration), mode === 'sfx' ? 22 : 120);

    console.log(`User ${userId} generating ${mode === 'sfx' ? 'SFX' : 'music'}: "${cleanPrompt.slice(0, 50)}..." (${safeDuration}s)`);

    const endpoint = mode === 'sfx'
      ? 'https://api.elevenlabs.io/v1/sound-generation'
      : 'https://api.elevenlabs.io/v1/music';

    const requestBody = mode === 'sfx'
      ? { text: cleanPrompt, duration_seconds: safeDuration, prompt_influence: 0.3 }
      : { prompt: cleanPrompt, duration_seconds: safeDuration };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to generate audio' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${mode === 'sfx' ? 'sfx' : 'music'}-${Date.now()}.mp3"`,
      },
    });

  } catch (error) {
    console.error('Music generation error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
