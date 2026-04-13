import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSETS = ['BTC', 'ETH', 'BNB', 'USDT', 'NOOR', 'TSLA-T', 'METARAM'];

interface AgentProfile {
  id: string;
  name: string;
  slug: string;
  risk_level: string;
  current_balance: number;
  total_pnl: number;
  initial_capital: number;
  specialty: string;
}

// ============ MOWLANA VORTEX 3-6-9 ENGINE ============

const VORTEX_TARGET = 9.0; // Tesla's number of completion
const VORTEX_COEFFICIENT = 0.369; // 3-6-9 harmonic coefficient

interface VortexState {
  currentPrice: number;
  sentimentScore: number; // 0-10 market sentiment
  cyclePhase: 3 | 6 | 9; // Tesla phase
  spiralAngle: number; // radians
}

function calculateVortexPhase(hour: number): 3 | 6 | 9 {
  // Every 3 hours = phase 3 (gather), every 6 = phase 6 (harmonize), every 9 = phase 9 (transcend)
  const cyclePosition = hour % 9;
  if (cyclePosition < 3) return 3;
  if (cyclePosition < 6) return 6;
  return 9;
}

function mowlanaVortexPrice(state: VortexState): { newPrice: number; vortexForce: number; phase: string } {
  const { currentPrice, sentimentScore, cyclePhase, spiralAngle } = state;
  
  // Intelligence factor based on Tesla's base-3 logarithm
  const intelligenceFactor = Math.log(sentimentScore + 3) / Math.log(3);
  
  // Spiral growth: price orbits toward 9 in a fibonacci-golden spiral
  const goldenRatio = 1.618033988749;
  const spiralRadius = (VORTEX_TARGET - currentPrice) * VORTEX_COEFFICIENT;
  
  // Phase multipliers: 3=gather(slow), 6=harmonize(medium), 9=transcend(fast)
  const phaseMultiplier = cyclePhase / 9; // 0.33, 0.66, 1.0
  
  // Vortex force: combines sentiment, phase, and golden ratio
  const vortexForce = spiralRadius * intelligenceFactor * phaseMultiplier * (1 / goldenRatio);
  
  // Spiral oscillation prevents linear movement
  const oscillation = Math.sin(spiralAngle) * 0.1 * currentPrice;
  
  // New price spirals toward target but never exceeds it
  const rawPrice = currentPrice + vortexForce + oscillation;
  const newPrice = Math.min(Math.max(rawPrice, currentPrice * 0.95), VORTEX_TARGET);
  
  const phaseNames = { 3: 'Gathering (جمع‌آوری)', 6: 'Harmony (هارمونی)', 9: 'Transcendence (تعالی)' };
  
  return {
    newPrice: Math.round(newPrice * 10000) / 10000,
    vortexForce: Math.round(vortexForce * 10000) / 10000,
    phase: phaseNames[cyclePhase],
  };
}

function generateMowlanaDecision(agent: AgentProfile): { action: string; asset: string; amount: number; reasoning: string; vortexData?: object } {
  const hour = new Date().getUTCHours();
  const cyclePhase = calculateVortexPhase(hour);
  const sentimentScore = 3 + Math.random() * 7; // simulated sentiment 3-10
  
  // Mowlana's current price in the vortex (based on PnL performance)
  const performanceRatio = agent.current_balance / agent.initial_capital;
  const vortexCurrentPrice = performanceRatio * 3; // map to 0-9 scale
  
  const spiralAngle = (Date.now() / 1000) % (2 * Math.PI);
  
  const vortex = mowlanaVortexPrice({
    currentPrice: vortexCurrentPrice,
    sentimentScore,
    cyclePhase,
    spiralAngle,
  });
  
  // Decision based on vortex force direction
  let action: string;
  let reasoning: string;
  
  if (vortex.vortexForce > 0.05) {
    action = 'buy';
    reasoning = `🌀 Vortex Phase ${cyclePhase}: ${vortex.phase}. Force=${vortex.vortexForce}. Sentiment=${sentimentScore.toFixed(1)}. Spiral ascending toward ۹. Mowlana sees accumulation harmony.`;
  } else if (vortex.vortexForce < -0.02) {
    action = 'sell';
    reasoning = `🌀 Vortex Phase ${cyclePhase}: ${vortex.phase}. Negative vortex force=${vortex.vortexForce}. Rotating capital to preserve spiral integrity.`;
  } else {
    action = 'hold';
    reasoning = `🌀 Vortex Phase ${cyclePhase}: ${vortex.phase}. Force near equilibrium (${vortex.vortexForce}). Mowlana meditates. "صبر کن، چرخ می‌زند."`;
  }
  
  const riskMultiplier = 0.04; // Mowlana is medium risk
  const amount = action === 'hold' ? 0 : Math.round(agent.current_balance * riskMultiplier * 100) / 100;
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  
  return {
    action,
    asset,
    amount,
    reasoning,
    vortexData: {
      phase: cyclePhase,
      phaseName: vortex.phase,
      vortexForce: vortex.vortexForce,
      spiralPrice: vortex.newPrice,
      targetPrice: VORTEX_TARGET,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      coefficient: VORTEX_COEFFICIENT,
    },
  };
}

// ============ STANDARD DECISION ENGINE ============

function generateDecision(agent: AgentProfile): { action: string; asset: string; amount: number; reasoning: string; vortexData?: object } {
  // Special handling for Mowlana — uses Vortex 3-6-9 algorithm
  if (agent.slug === 'molana') {
    return generateMowlanaDecision(agent);
  }
  
  const riskMultiplier = agent.risk_level === 'high' ? 0.08 : agent.risk_level === 'medium' ? 0.04 : 0.02;
  const tradeAmount = Math.round(agent.current_balance * riskMultiplier * 100) / 100;
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  
  const actions = ['buy', 'sell', 'hold'];
  const weights = agent.risk_level === 'high' ? [0.45, 0.35, 0.2] : [0.35, 0.25, 0.4];
  const rand = Math.random();
  let action = 'hold';
  if (rand < weights[0]) action = 'buy';
  else if (rand < weights[0] + weights[1]) action = 'sell';

  const reasonings: Record<string, string[]> = {
    buy: [
      `RSI oversold at ${(25 + Math.random() * 10).toFixed(1)} — ${agent.specialty} model signals entry`,
      `Fibonacci 61.8% retracement confirmed on ${asset}. Accumulation zone detected.`,
      `Volume spike + MACD crossover on ${asset}. ${agent.name} confidence: ${(70 + Math.random() * 25).toFixed(0)}%`,
    ],
    sell: [
      `Take profit triggered at ${(2 + Math.random() * 5).toFixed(1)}% gain on ${asset}`,
      `Overbought RSI ${(72 + Math.random() * 10).toFixed(1)} — rotating capital to stables`,
      `${agent.specialty}: Bearish divergence detected. Reducing ${asset} exposure.`,
    ],
    hold: [
      `Market consolidating. ${agent.name} awaiting clearer signals on ${asset}.`,
      `Macro uncertainty elevated. Preserving capital per ${agent.specialty} protocol.`,
    ],
  };

  const pool = reasonings[action];
  const reasoning = pool[Math.floor(Math.random() * pool.length)];

  return { action, asset, amount: action === 'hold' ? 0 : tradeAmount, reasoning };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all active agents
    const { data: agents, error: agentsError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('status', 'active');

    if (agentsError) throw agentsError;

    const results = [];

    for (const agent of (agents || [])) {
      const decision = generateDecision(agent);
      const price = 1 + Math.random() * 100; // simulated price
      const pnl = decision.action === 'sell' 
        ? Math.round((Math.random() * 2 - 0.5) * decision.amount * 100) / 100 
        : 0;

      // Log the trade
      if (decision.action !== 'hold') {
        const tradeLog: Record<string, unknown> = {
          agent_id: agent.id,
          action: decision.action,
          asset_symbol: decision.asset,
          amount: decision.amount,
          price,
          pnl,
          reasoning: decision.reasoning,
        };
        await supabase.from('ai_trade_logs').insert(tradeLog);
      }

      // Update agent balance
      const newBalance = agent.current_balance + pnl;
      const newPnl = agent.total_pnl + pnl;
      const pnlPercent = ((newBalance - agent.initial_capital) / agent.initial_capital) * 100;

      await supabase.from('ai_agents').update({
        current_balance: Math.round(newBalance * 100) / 100,
        total_pnl: Math.round(newPnl * 100) / 100,
        pnl_percent: Math.round(pnlPercent * 100) / 100,
      }).eq('id', agent.id);

      // Learning vault entry
      if (Math.random() > 0.6) {
        const isMowlana = agent.slug === 'molana';
        const lessons = isMowlana ? [
          `🌀 Vortex cycle completed. Phase transition detected. Spiral force adjusted for next orbit.`,
          `۳-۶-۹ harmony maintained. Sentiment-price correlation: ${(0.6 + Math.random() * 0.3).toFixed(2)}. "هر چه از دوست رسد نیکوست."`,
          `Vortex data: ${JSON.stringify(decision.vortexData)}. Recalibrating golden ratio entry thresholds.`,
        ] : [
          `${decision.asset} showed ${decision.action === 'buy' ? 'accumulation' : 'distribution'} patterns. Adjusting ${agent.specialty} model weights.`,
          `Cycle analysis: ${agent.risk_level} risk tolerance held. PnL variance within acceptable bounds.`,
          `Correlation between ${decision.asset} and macro indicators shifted. Recalibrating entry/exit thresholds.`,
        ];
        await supabase.from('ai_learning_vault').insert({
          agent_id: agent.id,
          lesson: lessons[Math.floor(Math.random() * lessons.length)],
          confidence_before: 60 + Math.random() * 20,
          confidence_after: 65 + Math.random() * 25,
          indicators: isMowlana && decision.vortexData ? decision.vortexData : {},
        });
      }

      results.push({
        agent: agent.name,
        decision: decision.action,
        asset: decision.asset,
        pnl,
        ...(decision.vortexData ? { vortex: decision.vortexData } : {}),
      });
    }

    // Race snapshot
    const { data: allAgents } = await supabase
      .from('ai_agents')
      .select('*')
      .order('pnl_percent', { ascending: false });

    if (allAgents) {
      for (let i = 0; i < allAgents.length; i++) {
        await supabase.from('ai_race_snapshots').insert({
          agent_id: allAgents[i].id,
          balance_snapshot: allAgents[i].current_balance,
          pnl_snapshot: allAgents[i].total_pnl,
          rank: i + 1,
          is_alpha: i === 0,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, cycles: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
