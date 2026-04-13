-- Fix generate_referral_code to use NEW.user_id (profiles table column), not NEW.id
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_code TEXT;
BEGIN
    FOR i IN 1..10 LOOP
        new_code := upper(substring(encode(extensions.gen_random_bytes(6), 'hex') from 1 for 8));
        BEGIN
            INSERT INTO public.referral_codes (user_id, code)
            VALUES (NEW.user_id, new_code);
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