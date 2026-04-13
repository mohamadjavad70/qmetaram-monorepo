
-- Payout requests table for the Global Payout Engine
CREATE TABLE public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payout_type TEXT NOT NULL CHECK (payout_type IN ('crypto', 'fiat')),
  amount_usd NUMERIC NOT NULL,
  fee_usd NUMERIC NOT NULL DEFAULT 0,
  net_amount_usd NUMERIC NOT NULL DEFAULT 0,
  -- crypto fields
  wallet_address TEXT,
  wallet_network TEXT,
  -- fiat fields
  cardholder_name TEXT,
  card_number_masked TEXT,
  card_expiry TEXT,
  -- tracking
  payout_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'waiting_approval', 'approved', 'completed', 'rejected', 'failed')),
  risk_flag TEXT,
  admin_note TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests
CREATE POLICY "Users can view own payout requests"
  ON public.payout_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create payout requests"
  ON public.payout_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "Admins can view all payout requests"
  ON public.payout_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update (approve/reject)
CREATE POLICY "Admins can update payout requests"
  ON public.payout_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for admin monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_requests;
