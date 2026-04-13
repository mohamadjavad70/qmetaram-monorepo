import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AVAILABLE_MODELS = {
  'gemini-pro': 'google/gemini-2.5-pro',
  'gemini-3-pro': 'google/gemini-3-pro-preview',
  'gpt-5': 'openai/gpt-5',
  'gemini-flash': 'google/gemini-2.5-flash',
  'gpt-5-mini': 'openai/gpt-5-mini',
  'gemini-flash-lite': 'google/gemini-2.5-flash-lite',
  'gpt-5-nano': 'openai/gpt-5-nano',
};

type ModelId = keyof typeof AVAILABLE_MODELS;

interface OrchestrationRequest {
  messages: Array<{ role: string; content: string }>;
  mode: 'single' | 'chain-of-thought' | 'multi-model-consensus' | 'sequential-refinement';
  primaryModel?: ModelId;
  secondaryModels?: ModelId[];
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) return { valid: false, error: 'Messages must be an array' };
  if (messages.length > 50) return { valid: false, error: 'Too many messages (max 50)' };
  const sanitized: Array<{ role: string; content: string }> = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') return { valid: false, error: 'Invalid message format' };
    const { role, content } = msg as { role?: unknown; content?: unknown };
    if (typeof role !== 'string' || !['user', 'assistant', 'system'].includes(role)) return { valid: false, error: 'Invalid message role' };
    if (typeof content !== 'string') return { valid: false, error: 'Message content must be a string' };
    if (content.length > 15000) return { valid: false, error: 'Message too long (max 15000 characters)' };
    sanitized.push({ role, content: content.trim() });
  }
  return { valid: true, sanitized };
}

async function callModel(apiKey: string, modelId: ModelId, messages: Array<{ role: string; content: string }>, systemPrompt: string, stream = false): Promise<Response | string> {
  const gatewayModel = AVAILABLE_MODELS[modelId] || AVAILABLE_MODELS['gemini-flash'];
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: gatewayModel, messages: [{ role: 'system', content: systemPrompt }, ...messages], stream }),
  });
  if (!response.ok) throw new Error(`Model ${modelId} failed with status ${response.status}`);
  if (stream) return response;
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function chainOfThought(apiKey: string, messages: Array<{ role: string; content: string }>, primaryModel: ModelId): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"## 🔍 Step 1: Problem Analysis\\n\\n"}}]}\n\n'));
        const analysisPrompt = `Analyze the following problem and break it down into key components.\n\nUser's request: ${messages[messages.length - 1]?.content || ''}\n\nProvide:\n1. Core problem identification\n2. Key constraints\n3. Relevant domain areas`;
        const analysis = await callModel(apiKey, primaryModel, [{ role: 'user', content: analysisPrompt }], 'You are an analytical AI assistant.') as string;
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${analysis.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}}]}\n\n`));

        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"\\n\\n## 💡 Step 2: Solution Generation\\n\\n"}}]}\n\n'));
        const solutionPrompt = `Based on this analysis:\n${analysis}\n\nOriginal request: ${messages[messages.length - 1]?.content || ''}\n\nGenerate a comprehensive solution.`;
        const solution = await callModel(apiKey, primaryModel, [{ role: 'user', content: solutionPrompt }], 'You are a solution architect.') as string;
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${solution.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}}]}\n\n`));

        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"\\n\\n## ✅ Step 3: Verification\\n\\n"}}]}\n\n'));
        const verificationPrompt = `Review this solution for accuracy:\n${solution}\n\nProvide verification and final recommendation.`;
        const verification = await callModel(apiKey, primaryModel, [{ role: 'user', content: verificationPrompt }], 'You are a QA expert.') as string;
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${verification.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}}]}\n\n`));

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"Error: ${error instanceof Error ? error.message : 'Unknown'}"}}]}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    }
  });
}

async function multiModelConsensus(apiKey: string, messages: Array<{ role: string; content: string }>, models: ModelId[]): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const selectedModels = models.length > 0 ? models : ['gemini-pro', 'gpt-5', 'gemini-flash'] as ModelId[];
  return new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"## 🤖 Multi-Model Consensus\\n\\n"}}]}\n\n'));
        const userQuery = messages[messages.length - 1]?.content || '';
        const responses: { model: string; response: string }[] = [];
        for (const modelId of selectedModels.slice(0, 3)) {
          const modelName = modelId.replace('-', ' ').toUpperCase();
          controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"### 📊 ${modelName}\\n\\n"}}]}\n\n`));
          try {
            const response = await callModel(apiKey, modelId, [{ role: 'user', content: userQuery }], 'Provide a clear, accurate, and helpful response.') as string;
            responses.push({ model: modelName, response });
            controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${response.replace(/\n/g, '\\n').replace(/"/g, '\\"')}\\n\\n"}}]}\n\n`));
          } catch { controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"*Model unavailable*\\n\\n"}}]}\n\n`)); }
        }
        if (responses.length > 1) {
          controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"### 🎯 Consensus Summary\\n\\n"}}]}\n\n'));
          const synthesisPrompt = `Synthesize these responses:\n\n${responses.map(r => `**${r.model}:**\n${r.response}`).join('\n\n---\n\n')}`;
          const consensus = await callModel(apiKey, 'gemini-pro', [{ role: 'user', content: synthesisPrompt }], 'You are an AI synthesis expert.') as string;
          controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${consensus.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}}]}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"Error: ${error instanceof Error ? error.message : 'Unknown'}"}}]}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    }
  });
}

async function sequentialRefinement(apiKey: string, messages: Array<{ role: string; content: string }>, models: ModelId[]): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const refinementChain = models.length > 0 ? models : ['gemini-flash', 'gemini-pro', 'gpt-5'] as ModelId[];
  return new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"## 🔄 Sequential Refinement\\n\\n"}}]}\n\n'));
        const userQuery = messages[messages.length - 1]?.content || '';
        let currentResponse = userQuery;
        for (let i = 0; i < refinementChain.length; i++) {
          const modelId = refinementChain[i];
          const modelName = modelId.replace('-', ' ').toUpperCase();
          const stage = i === 0 ? 'Initial' : i === refinementChain.length - 1 ? 'Final' : `Refinement ${i}`;
          controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"### Stage ${i + 1}: ${stage} (${modelName})\\n\\n"}}]}\n\n`));
          const prompt = i === 0 ? currentResponse : `Improve this response:\n\n${currentResponse}\n\nOriginal question: ${userQuery}`;
          try {
            const response = await callModel(apiKey, modelId, [{ role: 'user', content: prompt }], i === 0 ? 'Provide a helpful response.' : 'Improve this AI response for accuracy and clarity.') as string;
            currentResponse = response;
            controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"${response.replace(/\n/g, '\\n').replace(/"/g, '\\"')}\\n\\n"}}]}\n\n`));
          } catch { controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"*Stage skipped*\\n\\n"}}]}\n\n`)); }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":"Error: ${error instanceof Error ? error.message : 'Unknown'}"}}]}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    }
  });
}

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
        console.log('Proceeding with anonymous orchestration request');
      }
    } else {
      console.log('Proceeding with anonymous orchestration request');
    }

    console.log(`Orchestration request user: ${userId}`);

    const body: OrchestrationRequest = await req.json();
    const { messages, mode = 'single', primaryModel = 'gemini-flash', secondaryModels = [] } = body;
    
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const sanitizedMessages = validation.sanitized!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    console.log(`User ${userId} - Orchestration: ${mode}, Primary: ${primaryModel}`);

    let stream: ReadableStream;
    
    switch (mode) {
      case 'chain-of-thought':
        stream = await chainOfThought(LOVABLE_API_KEY, sanitizedMessages, primaryModel as ModelId);
        break;
      case 'multi-model-consensus':
        stream = await multiModelConsensus(LOVABLE_API_KEY, sanitizedMessages, [primaryModel, ...secondaryModels] as ModelId[]);
        break;
      case 'sequential-refinement':
        stream = await sequentialRefinement(LOVABLE_API_KEY, sanitizedMessages, [primaryModel, ...secondaryModels] as ModelId[]);
        break;
      default: {
        const response = await callModel(LOVABLE_API_KEY, primaryModel as ModelId, sanitizedMessages, 'You are QMETARAM Core, a highly intelligent AI assistant.', true) as Response;
        return new Response(response.body, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });
      }
    }

    return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });
    
  } catch (error) {
    console.error('Orchestration error:', error);
    if (error instanceof Error && error.message.includes('429')) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (error instanceof Error && error.message.includes('402')) {
      return new Response(JSON.stringify({ error: 'Usage limit reached.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Orchestration service error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
