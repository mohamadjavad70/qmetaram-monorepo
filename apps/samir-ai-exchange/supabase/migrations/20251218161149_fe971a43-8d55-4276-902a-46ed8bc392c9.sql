-- Add Iranian Toman (IRT) to platform_assets
INSERT INTO public.platform_assets (symbol, name, asset_type, base_price_usd, current_price_usd, price_change_24h, volume_24h, market_cap, icon_emoji, is_active)
VALUES ('IRT', 'Iranian Toman', 'fiat', 0.000024, 0.000024, 0.5, 50000000, NULL, '🇮🇷', true)
ON CONFLICT (symbol) DO NOTHING;

-- Create Iranian bank cards table for card linking
CREATE TABLE IF NOT EXISTS public.iranian_bank_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_number_masked VARCHAR(19) NOT NULL, -- Store masked: 6037-****-****-1234
    card_hash VARCHAR(64) NOT NULL, -- Hashed full card number for verification
    bank_name VARCHAR(100) NOT NULL,
    cardholder_name VARCHAR(200) NOT NULL,
    national_id_hash VARCHAR(64) NOT NULL, -- Hashed national ID
    shaba_number VARCHAR(26), -- IBAN for Iran: IR + 24 digits
    is_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50), -- 'micro_transaction', 'manual', 'otp'
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    status VARCHAR(20) DEFAULT 'pending' -- pending, verified, rejected, suspended
);

-- Create Toman transactions table for deposits/withdrawals
CREATE TABLE IF NOT EXISTS public.toman_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.iranian_bank_cards(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal'
    amount_irt DECIMAL(20,0) NOT NULL, -- Toman amount (no decimals)
    amount_usd DECIMAL(20,8), -- Equivalent USD at time of transaction
    fee_irt DECIMAL(20,0) DEFAULT 0,
    reference_number VARCHAR(50), -- Payment gateway reference
    tracking_code VARCHAR(50), -- Internal tracking
    bank_tracking_code VARCHAR(50), -- Bank's tracking code
    shaba_destination VARCHAR(26), -- For withdrawals
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    failure_reason TEXT,
    psp_response JSONB, -- Store full PSP response
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create internal liquidity pool for instant trades
CREATE TABLE IF NOT EXISTS public.liquidity_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_asset_id UUID REFERENCES public.platform_assets(id),
    quote_asset_id UUID REFERENCES public.platform_assets(id),
    base_balance DECIMAL(30,8) DEFAULT 0, -- Platform's reserve
    quote_balance DECIMAL(30,8) DEFAULT 0,
    spread_percent DECIMAL(5,4) DEFAULT 0.5, -- 0.5% spread
    min_trade DECIMAL(20,8) DEFAULT 0,
    max_trade DECIMAL(20,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(base_asset_id, quote_asset_id)
);

-- Enable RLS
ALTER TABLE public.iranian_bank_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toman_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_pools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iranian_bank_cards
CREATE POLICY "Users can view own cards" ON public.iranian_bank_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.iranian_bank_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.iranian_bank_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cards" ON public.iranian_bank_cards
    FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for toman_transactions
CREATE POLICY "Users can view own transactions" ON public.toman_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.toman_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" ON public.toman_transactions
    FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for liquidity_pools (public read, admin write)
CREATE POLICY "Anyone can view pools" ON public.liquidity_pools
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage pools" ON public.liquidity_pools
    FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_iranian_bank_cards_updated_at
    BEFORE UPDATE ON public.iranian_bank_cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liquidity_pools_updated_at
    BEFORE UPDATE ON public.liquidity_pools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();