
-- User investment ledger for tracking individual investments in AI agents
CREATE TABLE public.user_investment_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id),
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  entry_price NUMERIC NOT NULL DEFAULT 1,
  current_value NUMERIC NOT NULL DEFAULT 0,
  pnl NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  invested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_investment_ledger ENABLE ROW LEVEL SECURITY;

-- Users can only see and create their own investments
CREATE POLICY "Users can view own investments" ON public.user_investment_ledger
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON public.user_investment_ledger
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON public.user_investment_ledger
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all investments" ON public.user_investment_ledger
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_investment_ledger;

-- Trigger for updated_at
CREATE TRIGGER update_user_investment_ledger_updated_at
  BEFORE UPDATE ON public.user_investment_ledger
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
