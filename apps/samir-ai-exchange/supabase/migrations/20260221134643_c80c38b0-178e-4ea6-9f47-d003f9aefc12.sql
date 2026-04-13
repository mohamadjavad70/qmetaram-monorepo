
-- AI Agents registry
CREATE TABLE public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  specialty text NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  icon_emoji text DEFAULT '🤖',
  token_symbol text,
  initial_capital numeric NOT NULL DEFAULT 30000,
  current_balance numeric NOT NULL DEFAULT 30000,
  total_pnl numeric NOT NULL DEFAULT 0,
  pnl_percent numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  strategy_prompt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agents" ON public.ai_agents FOR SELECT USING (true);
CREATE POLICY "Admins can manage agents" ON public.ai_agents FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- AI Trade Logs
CREATE TABLE public.ai_trade_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  action text NOT NULL,
  asset_symbol text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  pnl numeric DEFAULT 0,
  reasoning text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_trade_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trade logs" ON public.ai_trade_logs FOR SELECT USING (true);
CREATE POLICY "Admins can manage trade logs" ON public.ai_trade_logs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- AI Learning Vault
CREATE TABLE public.ai_learning_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  lesson text NOT NULL,
  indicators jsonb DEFAULT '{}'::jsonb,
  confidence_before numeric DEFAULT 0,
  confidence_after numeric DEFAULT 0,
  cycle_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_learning_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning vault" ON public.ai_learning_vault FOR SELECT USING (true);
CREATE POLICY "Admins can manage learning vault" ON public.ai_learning_vault FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Quantum Race snapshots (hourly leaderboard)
CREATE TABLE public.ai_race_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  balance_snapshot numeric NOT NULL DEFAULT 30000,
  pnl_snapshot numeric NOT NULL DEFAULT 0,
  token_price_growth numeric DEFAULT 0,
  rank integer DEFAULT 0,
  is_alpha boolean DEFAULT false,
  snapshot_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_race_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view race snapshots" ON public.ai_race_snapshots FOR SELECT USING (true);
CREATE POLICY "Admins can manage race snapshots" ON public.ai_race_snapshots FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_trade_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_race_snapshots;

-- Seed the 9 AI Agents
INSERT INTO public.ai_agents (name, slug, specialty, risk_level, icon_emoji, token_symbol, strategy_prompt) VALUES
('NOOR', 'noor', 'Arbitrage & Security', 'low', '🛡️', 'NOOR', 'Safe arbitrage between internal pools. Never risk more than 2% per trade. Focus on guaranteed spreads.'),
('TESLA', 'tesla', 'Momentum & Scalping', 'high', '⚡', 'TSLA', 'Aggressive momentum trades every 5 min. Use RSI/MACD for entries. Target 0.5-2% per scalp.'),
('DA VINCI', 'davinci', 'Chart Patterns & Geometry', 'medium', '🎨', 'DVNC', 'Identify classic chart patterns (Head & Shoulders, Triangles). Trade breakouts with 1:3 risk/reward.'),
('BEETHOVEN', 'beethoven', 'Harmonic & Grid Trading', 'medium', '🎵', 'BTHV', 'Grid trading on harmonic patterns. Place buy/sell orders at Fibonacci levels. Capture range-bound profits.'),
('MOLANA', 'molana', 'Sentiment & Psychology', 'medium', '📿', 'MOLN', 'Deep sentiment analysis of market psychology and news flow. Trade fear/greed extremes.'),
('BIRUNI', 'biruni', 'Fibonacci & Mathematics', 'low', '📐', 'BRNI', 'Precise Fibonacci retracement and extension calculations. Enter at golden ratio levels.'),
('QUANTUM', 'quantum', 'Probability & Quantum Analysis', 'high', '🔮', 'QNTM', 'Quantum probability modeling. Calculate multiple outcome scenarios. Trade highest probability setups.'),
('METARIX', 'metarix', 'Cross-Market Correlation', 'medium', '🌐', 'MTRX', 'Cross-chain and cross-market correlation analysis. Trade divergences between correlated assets.'),
('GUARDIAN', 'guardian', 'Risk Management & Liquidity', 'low', '🏛️', 'GRDN', 'Monitor portfolio risk. Inject liquidity when prices drop 2%. Protect treasury value.');
