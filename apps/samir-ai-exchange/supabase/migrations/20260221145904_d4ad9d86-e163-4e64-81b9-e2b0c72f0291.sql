
-- System reserves (Master Node balance tracking)
CREATE TABLE public.system_reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT 'Master Node',
  balance numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.system_reserves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reserves"
ON public.system_reserves FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_system_reserves_updated_at
BEFORE UPDATE ON public.system_reserves
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Master Node
INSERT INTO public.system_reserves (label, balance) VALUES ('Master Node', 101000000);

-- Login events audit table
CREATE TABLE public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address text,
  user_agent text,
  country text,
  city text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_suspicious boolean DEFAULT false,
  suspicious_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage login events"
ON public.login_events FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own login events"
ON public.login_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own login events"
ON public.login_events FOR INSERT
WITH CHECK (auth.uid() = user_id);
