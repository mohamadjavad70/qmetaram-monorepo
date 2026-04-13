
-- payments table for Zarinpal + Cryptomus gateway integration
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('IRR','USDT','USD')),
  method text NOT NULL CHECK (method IN ('zarinpal','cryptomus')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','expired')),
  payment_url text,
  gateway_authority text,
  gateway_ref_id text,
  fee_amount numeric(15,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.payments(created_at);

-- RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role (edge functions) can insert/update - no direct client inserts
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
