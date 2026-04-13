
-- bot_tokens: stores per-user per-bot token state with reserve ledger
CREATE TABLE public.bot_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bot_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  genetic_hash text,
  value_usd numeric NOT NULL DEFAULT 0,
  reserve_usd numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  minted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bot_id)
);

ALTER TABLE public.bot_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens" ON public.bot_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON public.bot_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON public.bot_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tokens" ON public.bot_tokens
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- fees: reserve ledger for controlled allocation (fee -> reserve -> allocation)
CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  fee_usd numeric NOT NULL DEFAULT 0,
  token_share_usd numeric NOT NULL DEFAULT 0,
  distributed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fees" ON public.fees
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can manage all fees" ON public.fees
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger for bot_tokens
CREATE TRIGGER update_bot_tokens_updated_at
  BEFORE UPDATE ON public.bot_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
