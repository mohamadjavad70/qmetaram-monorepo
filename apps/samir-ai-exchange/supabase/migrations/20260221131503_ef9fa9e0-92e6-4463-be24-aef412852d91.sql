
-- Create trading_intelligence table for AI agent decisions
CREATE TABLE public.trading_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold', 'alert')),
  confidence NUMERIC NOT NULL DEFAULT 0,
  indicators JSONB NOT NULL DEFAULT '{}',
  reasoning TEXT,
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  price_at_signal NUMERIC,
  target_price NUMERIC,
  stop_loss NUMERIC,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'executed', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  user_id UUID
);

-- Enable RLS
ALTER TABLE public.trading_intelligence ENABLE ROW LEVEL SECURITY;

-- Anyone can read AI signals (public market intelligence)
CREATE POLICY "Anyone can read trading intelligence"
ON public.trading_intelligence FOR SELECT
USING (true);

-- Only admins can manage signals
CREATE POLICY "Admins can manage trading intelligence"
ON public.trading_intelligence FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_trading_intelligence_agent ON public.trading_intelligence(agent_name);
CREATE INDEX idx_trading_intelligence_asset ON public.trading_intelligence(asset_symbol);
CREATE INDEX idx_trading_intelligence_created ON public.trading_intelligence(created_at DESC);
