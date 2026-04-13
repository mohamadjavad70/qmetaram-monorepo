-- Create OTP rate limiting table
CREATE TABLE public.otp_rate_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    phone_number TEXT,
    request_type TEXT NOT NULL DEFAULT 'send',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_otp_rate_limits_ip ON public.otp_rate_limits(ip_address, created_at);
CREATE INDEX idx_otp_rate_limits_phone ON public.otp_rate_limits(phone_number, created_at);

-- Enable RLS
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge functions use service role)
CREATE POLICY "Service role only" ON public.otp_rate_limits
    FOR ALL USING (false);

-- Auto-cleanup old records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    DELETE FROM public.otp_rate_limits WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;