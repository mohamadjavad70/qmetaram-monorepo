
-- Daily Missions table
CREATE TABLE public.daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mission_type text NOT NULL,
  title text NOT NULL,
  description text,
  reward_noor numeric NOT NULL DEFAULT 0.1,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions" ON public.daily_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON public.daily_missions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all missions" ON public.daily_missions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NOOR claim tracking table
CREATE TABLE public.noor_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  signup_claimed boolean NOT NULL DEFAULT false,
  total_referral_noor numeric NOT NULL DEFAULT 0,
  total_mission_noor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.noor_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON public.noor_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims" ON public.noor_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own claims" ON public.noor_claims
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON public.noor_claims
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add referral tier tracking to referral_codes
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS tier_level text DEFAULT 'basic';
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS agents_unlocked integer DEFAULT 0;

-- Web3 wallet addresses table
CREATE TABLE public.web3_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  chain_id integer NOT NULL DEFAULT 56,
  is_primary boolean NOT NULL DEFAULT true,
  connected_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);

ALTER TABLE public.web3_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets" ON public.web3_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON public.web3_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets" ON public.web3_wallets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wallets" ON public.web3_wallets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to calculate referral tier
CREATE OR REPLACE FUNCTION public.get_referral_tier(invite_count integer)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN invite_count >= 10000 THEN 'galaxy'
    WHEN invite_count >= 1000 THEN 'master'
    WHEN invite_count >= 100 THEN 'elite'
    WHEN invite_count >= 3 THEN 'power'
    ELSE 'basic'
  END;
$$;

-- Function to get agents unlocked count
CREATE OR REPLACE FUNCTION public.get_agents_unlocked(invite_count integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN invite_count >= 10000 THEN 9
    WHEN invite_count >= 1000 THEN 6
    WHEN invite_count >= 100 THEN 3
    ELSE 1
  END;
$$;
