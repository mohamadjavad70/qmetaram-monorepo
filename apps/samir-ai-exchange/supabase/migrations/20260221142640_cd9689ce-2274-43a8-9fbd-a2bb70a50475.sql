
-- International card linking table for Visa/Mastercard
CREATE TABLE public.international_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_last_four TEXT NOT NULL,
  card_hash TEXT NOT NULL,
  card_brand TEXT NOT NULL DEFAULT 'visa',
  cardholder_name TEXT NOT NULL,
  expiry_masked TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  admin_note TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.international_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.international_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.international_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cards" ON public.international_cards
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
