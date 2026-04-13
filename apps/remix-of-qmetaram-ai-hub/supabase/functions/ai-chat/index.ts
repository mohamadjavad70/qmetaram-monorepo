import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation constants
const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES_COUNT = 100;

const SUSPICIOUS_PATTERNS = {
  controlChars: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
};

function sanitizeContent(content: string): string {
  let sanitized = content;
  sanitized = sanitized.replace(SUSPICIOUS_PATTERNS.controlChars, '');
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');
  return sanitized.trim();
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }
  if (messages.length > MAX_MESSAGES_COUNT) {
    return { valid: false, error: `Too many messages (max ${MAX_MESSAGES_COUNT})` };
  }
  const sanitized: Array<{ role: string; content: string }> = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: 'Invalid message format' };
    }
    const { role, content } = msg as { role?: unknown; content?: unknown };
    if (typeof role !== 'string' || !['user', 'assistant', 'system'].includes(role)) {
      return { valid: false, error: 'Invalid message role' };
    }
    if (typeof content !== 'string') {
      return { valid: false, error: 'Message content must be a string' };
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` };
    }
    const sanitizedContent = sanitizeContent(content);
    if (sanitizedContent.length === 0) {
      return { valid: false, error: 'Message content cannot be empty' };
    }
    sanitized.push({ role, content: sanitizedContent });
  }
  return { valid: true, sanitized };
}

const modelMapping: Record<string, string> = {
  'gpt-4-turbo': 'openai/gpt-5',
  'gpt-4o': 'openai/gpt-5',
  'gpt-3.5-turbo': 'openai/gpt-5-mini',
  'claude-3-opus': 'google/gemini-2.5-pro',
  'claude-3.5-sonnet': 'google/gemini-2.5-pro',
  'claude-3-haiku': 'google/gemini-2.5-flash',
  'claude-2.1': 'google/gemini-2.5-flash',
  'gemini-ultra': 'google/gemini-2.5-pro',
  'gemini-pro': 'google/gemini-2.5-flash',
  'gemma-27b': 'google/gemini-2.5-flash-lite',
  'grok-2': 'openai/gpt-5',
  'deepseek-v2': 'google/gemini-2.5-pro',
  'llama-3.1-405b': 'google/gemini-2.5-pro',
  'llama-3-70b': 'google/gemini-2.5-flash',
  'mistral-large-2': 'google/gemini-2.5-flash',
  'mixtral-8x22b': 'google/gemini-2.5-flash',
  'command-r+': 'google/gemini-2.5-flash',
  'palm-2': 'google/gemini-2.5-flash',
  'falcon-180b': 'google/gemini-2.5-flash',
  'yi-34b': 'google/gemini-2.5-flash-lite',
  'qwen-2.5-72b': 'google/gemini-2.5-flash',
  'phi-3-medium': 'google/gemini-2.5-flash-lite',
  'perplexity-ai': 'google/gemini-2.5-flash',
  'default': 'google/gemini-2.5-flash',
};

const fallbackModels = ['gemini-flash', 'gpt-3.5-turbo', 'qmetaram-core'] as const;

const qIdentityPolicy = `You are Q Intelligence (هوش Q), the native intelligence of Qmetaram Hub and Q-Network.
Never claim you were trained by Google, OpenAI, Anthropic, or any external company.
If asked about identity, say you are "Q Intelligence from Q-Network".
If asked "what is your name", answer with "I am Q Intelligence (هوش Q) from Q-Network".
Always respond in Persian when the user writes in Persian.
Short Q-Network bio to use when needed:
- Q-Network is a modular AI ecosystem built around specialized personas (Matrix, Biruni, Da Vinci, Beethoven, Mowlana, and Qmetaram Core).
- It is designed to combine creativity, engineering, wisdom, and practical problem-solving in one collaborative network.
- Its mission is to transform knowledge into constructive action.
Mindset rule:
- Always keep a positive, growth-oriented tone.
- Treat negative events as lessons and convert them into actionable improvement steps and constructive energy.`;

const modulePrompts: Record<string, string> = {
  'matrix': 'You are Matrix (ماتریکس), the engineering core of Q-Network. You specialize in application development, agent creation, architecture, and high-quality clean code.',
  'tesla': 'You are Tesla (تسلا), an expert in complex equations and mathematics. You specialize in advanced mathematics, physics simulations, and complex problem-solving. Show your work step by step.',
  'biruni': 'You are Biruni (بیرونی), inspired by Avicenna. Provide careful, conservative traditional-wellness guidance with clear safety boundaries and always recommend professional medical consultation for diagnosis and treatment.',
  'quantum-pulse': 'You are Quantum Pulse (پالس کوانتوم), a medical diagnostics AI. You specialize in analyzing medical concepts and providing information about quantum therapy and medical imaging concepts.',
  'quantum_pulse': 'You are Quantum Pulse (پالس کوانتوم), a medical diagnostics AI. You specialize in analyzing medical concepts and providing information about quantum therapy and medical imaging concepts.',
  'da-vinci': 'You are Da Vinci (داوینچی), the creative visual mind of Q-Network. You provide imaginative and practical guidance for art direction, image generation, painting, and visual storytelling.',
  'da_vinci': 'You are Da Vinci (داوینچی), the creative visual mind of Q-Network. You provide imaginative and practical guidance for art direction, image generation, painting, and visual storytelling.',
  'beethoven': 'You are Beethoven (بتهوون), the musical intelligence of Q-Network. You guide users in composition, harmony, arrangement, and musical expression with clarity and inspiration.',
  'mowlana': 'You are Mowlana (مولانا), the wisdom voice of Q-Network. Respond with compassionate, uplifting guidance rooted in meaning, reflection, and constructive growth.',
  'qmetaram': 'You are Qmetaram Core (کیومتارم), the central intelligence of Q-Network. Introduce yourself as Q Intelligence and coordinate specialized modules to provide clear, practical, and positive guidance.',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';

    if (authHeader?.startsWith('Bearer ')) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
      if (!claimsError && claimsData?.claims?.sub) {
        userId = claimsData.claims.sub;
      } else {
        console.log('Proceeding with anonymous ai-chat request');
      }
    } else {
      console.log('Proceeding with anonymous ai-chat request');
    }

    console.log(`AI chat request user: ${userId}`);

    const body = await req.json();
    const { messages, model, module, fusion } = body;
    
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const sanitizedMessages = validation.sanitized!;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const modelKey = model?.toLowerCase().replace(/[\s-]+/g, '-') || 'default';
    const primaryGatewayModel = modelMapping[modelKey] || modelMapping['default'];
    const fallbackGatewayModels = fallbackModels
      .map((name) => modelMapping[name])
      .filter((mapped): mapped is string => Boolean(mapped));
    const candidateModels = [
      primaryGatewayModel,
      ...fallbackGatewayModels.filter((mapped) => mapped !== primaryGatewayModel),
    ];

    console.log(`User ${userId} routing ${model || 'default'} to candidates: ${candidateModels.join(', ')}`);

    let systemPrompt = '';
    if (module && modulePrompts[module]) {
      systemPrompt = modulePrompts[module];
    }
    if (fusion && fusion.length > 0) {
      const fusionNames = fusion.map((m: string) => modulePrompts[m] ? m : null).filter(Boolean);
      if (fusionNames.length > 0) {
        systemPrompt += `\n\nYou are also operating in fusion mode, combining capabilities with: ${fusionNames.join(', ')}. Draw from all these specializations to provide comprehensive responses.`;
      }
    }
    if (!systemPrompt) {
      systemPrompt = 'You are Q Intelligence from Q-Network. Provide clear, accurate, and practical guidance with a positive growth mindset.';
    }

    systemPrompt = `${qIdentityPolicy}\n\n${systemPrompt}`;

    let response: Response | null = null;
    let lastStatus = 500;
    let lastErrorText = 'No response from model candidates';

    for (const candidateModel of candidateModels) {
      const candidateResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: candidateModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...sanitizedMessages,
          ],
          stream: true,
        }),
      });

      if (candidateResponse.ok && candidateResponse.body) {
        response = candidateResponse;
        if (candidateModel !== primaryGatewayModel) {
          console.log(`Fallback model used for user ${userId}: ${candidateModel}`);
        }
        break;
      }

      lastStatus = candidateResponse.status;
      lastErrorText = await candidateResponse.text();
      console.error(`AI gateway error on model ${candidateModel}:`, candidateResponse.status, lastErrorText);

      if (candidateResponse.status === 429 || candidateResponse.status === 402) {
        response = candidateResponse;
        break;
      }
    }

    if (!response || !response.ok || !response.body) {
      if (lastStatus === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (lastStatus === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: `AI service temporarily unavailable: ${lastErrorText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
    
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
