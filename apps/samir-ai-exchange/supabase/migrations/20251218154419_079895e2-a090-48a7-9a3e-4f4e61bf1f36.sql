-- Create referrals table for multi-level referral tracking
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    total_commission_earned NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (referred_id)
);

-- Create referral_commissions table for tracking earnings
CREATE TABLE public.referral_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE NOT NULL,
    trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
    commission_amount NUMERIC NOT NULL,
    commission_rate NUMERIC DEFAULT 0.1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_codes table 
CREATE TABLE public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add referral_code column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage referrals"
ON public.referrals FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_commissions
CREATE POLICY "Users can view own commissions"
ON public.referral_commissions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.referrals r 
        WHERE r.id = referral_id AND r.referrer_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all commissions"
ON public.referral_commissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage commissions"
ON public.referral_commissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_codes
CREATE POLICY "Users can view own referral code"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral code"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
ON public.referral_codes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage referral codes"
ON public.referral_codes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Generate a unique 8-character code
    new_code := upper(substring(md5(NEW.id::text || now()::text) from 1 for 8));
    
    INSERT INTO public.referral_codes (user_id, code)
    VALUES (NEW.id, new_code)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code for new profiles
CREATE TRIGGER generate_referral_code_on_profile
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();