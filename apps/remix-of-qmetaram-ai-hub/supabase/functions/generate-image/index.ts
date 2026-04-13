import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_PROMPT_LENGTH = 2000;
const ALLOWED_OPERATIONS = ['generate', 'edit', 'interpret'];

function validateRequest(body: unknown): { valid: boolean; error?: string; data?: { operation: string; prompt: string; imageData?: string } } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  const { operation, prompt, imageData } = body as Record<string, unknown>;
  if (typeof operation !== 'string' || !ALLOWED_OPERATIONS.includes(operation)) {
    return { valid: false, error: `Invalid operation. Allowed: ${ALLOWED_OPERATIONS.join(', ')}` };
  }
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` };
  }
  if (operation === 'edit' && (!imageData || typeof imageData !== 'string')) {
    return { valid: false, error: 'Image data is required for edit operation' };
  }
  return { valid: true, data: { operation, prompt: prompt.trim(), imageData: typeof imageData === 'string' ? imageData : undefined } };
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
    console.log(`Authenticated user for image gen: ${userId}`);
    // ─── End Authentication ───

    const body = await req.json();
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { operation, prompt, imageData } = validation.data!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI service not configured');
    }

    console.log(`User ${userId} - ${operation}: ${prompt.substring(0, 100)}...`);

    let messages: Array<{ role: string; content: unknown }>;

    if (operation === 'generate') {
      messages = [{ role: 'user', content: `Generate a high-quality, detailed image based on this description: ${prompt}. Make it visually stunning and artistic.` }];
    } else if (operation === 'edit') {
      messages = [{ role: 'user', content: [{ type: 'text', text: `Edit this image according to the following instructions: ${prompt}` }, { type: 'image_url', image_url: { url: imageData } }] }];
    } else if (operation === 'interpret') {
      if (imageData) {
        messages = [{ role: 'user', content: [{ type: 'text', text: `As Da Vinci, a master visual artist, analyze this image and provide artistic insights. ${prompt ? `Focus on: ${prompt}` : 'Describe the composition, color palette, style, and artistic elements.'}` }, { type: 'image_url', image_url: { url: imageData } }] }];
      } else {
        messages = [{ role: 'user', content: `As Da Vinci, a master visual artist, provide artistic analysis and creative insights about: ${prompt}` }];
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid operation' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const model = operation === 'generate' || operation === 'edit'
      ? 'google/gemini-2.5-flash-image-preview'
      : 'google/gemini-2.5-flash';

    const requestBody: Record<string, unknown> = { model, messages };
    if (operation === 'generate' || operation === 'edit') {
      requestBody.modalities = ['image', 'text'];
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'Usage limit reached.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    const result: { text?: string; images?: string[] } = {};
    if (choice?.content) result.text = choice.content;
    if (choice?.images && Array.isArray(choice.images)) {
      result.images = choice.images.map((img: { image_url?: { url?: string } }) => img.image_url?.url).filter(Boolean);
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
