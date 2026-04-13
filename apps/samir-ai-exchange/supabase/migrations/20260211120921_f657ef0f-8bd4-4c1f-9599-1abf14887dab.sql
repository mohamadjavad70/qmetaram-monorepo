
-- Create otp_verifications table for secure OTP storage
CREATE TABLE public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_otp_verifications_lookup ON public.otp_verifications(phone_number, purpose, is_used, expires_at);

-- Enable RLS - service role only (edge functions use service role)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for OTP verifications"
ON public.otp_verifications
FOR ALL
USING (false);

-- Auto-cleanup expired OTPs (extend existing cleanup function)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can cleanup rate limits';
    END IF;
    DELETE FROM public.otp_rate_limits WHERE created_at < now() - INTERVAL '24 hours';
    DELETE FROM public.otp_verifications WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;
