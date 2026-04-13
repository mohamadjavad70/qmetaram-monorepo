
-- Fix 1: Add admin access control to cleanup_old_rate_limits
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
END;
$$;

-- Revoke public execution
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits() TO authenticated;

-- Fix 2: Replace MD5 with CSPRNG for referral code generation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    new_code TEXT;
BEGIN
    FOR i IN 1..10 LOOP
        new_code := upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
        BEGIN
            INSERT INTO public.referral_codes (user_id, code)
            VALUES (NEW.id, new_code);
            RETURN NEW;
        EXCEPTION WHEN unique_violation THEN
            IF i = 10 THEN
                RAISE EXCEPTION 'Could not generate unique referral code after 10 attempts';
            END IF;
        END;
    END LOOP;
    RETURN NEW;
END;
$$;
