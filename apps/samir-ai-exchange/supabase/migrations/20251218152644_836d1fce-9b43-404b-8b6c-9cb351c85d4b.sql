-- Create platform assets table (including SAMIR and METARAM tokens)
CREATE TABLE public.platform_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('fiat', 'crypto', 'token')),
    base_price_usd DECIMAL(20, 8) NOT NULL,
    current_price_usd DECIMAL(20, 8) NOT NULL,
    price_change_24h DECIMAL(10, 4) DEFAULT 0,
    volume_24h DECIMAL(20, 2) DEFAULT 0,
    market_cap DECIMAL(20, 2) DEFAULT 0,
    total_supply DECIMAL(30, 8),
    circulating_supply DECIMAL(30, 8),
    icon_emoji VARCHAR(10),
    is_platform_token BOOLEAN DEFAULT false,
    fee_discount_percent DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create price history for charts
CREATE TABLE public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.platform_assets(id) ON DELETE CASCADE,
    price_usd DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 2) DEFAULT 0,
    high DECIMAL(20, 8),
    low DECIMAL(20, 8),
    open_price DECIMAL(20, 8),
    close_price DECIMAL(20, 8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user wallets
CREATE TABLE public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    asset_id UUID REFERENCES public.platform_assets(id) ON DELETE CASCADE,
    balance DECIMAL(30, 8) DEFAULT 0,
    locked_balance DECIMAL(30, 8) DEFAULT 0,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, asset_id, is_demo)
);

-- Create trades/orders table
CREATE TABLE public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    from_asset_id UUID REFERENCES public.platform_assets(id),
    to_asset_id UUID REFERENCES public.platform_assets(id),
    from_amount DECIMAL(30, 8) NOT NULL,
    to_amount DECIMAL(30, 8) NOT NULL,
    exchange_rate DECIMAL(20, 8) NOT NULL,
    fee_amount DECIMAL(20, 8) DEFAULT 0,
    fee_asset_id UUID REFERENCES public.platform_assets(id),
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('buy', 'sell', 'swap')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert platform assets
INSERT INTO public.platform_assets (symbol, name, asset_type, base_price_usd, current_price_usd, icon_emoji, is_platform_token, fee_discount_percent, total_supply, circulating_supply, volume_24h, price_change_24h) VALUES
-- Platform Tokens
('SAMIR', 'Samir Token', 'token', 1.00, 1.00, '🪙', true, 10, 100000000, 25000000, 1250000, 0.15),
('METARAM', 'Metaram Token', 'token', 10.00, 10.00, '💎', true, 10, 10000000, 2500000, 850000, 0.28),
-- Cryptocurrencies
('BTC', 'Bitcoin', 'crypto', 42500.00, 42580.50, '₿', false, 0, 21000000, 19500000, 28500000000, 2.34),
('ETH', 'Ethereum', 'crypto', 2350.00, 2380.25, 'Ξ', false, 0, NULL, 120000000, 15200000000, 1.87),
('USDT', 'Tether', 'crypto', 1.00, 1.00, '💵', false, 0, NULL, 95000000000, 45000000000, 0.01),
-- Fiat Currencies
('USD', 'US Dollar', 'fiat', 1.00, 1.00, '🇺🇸', false, 0, NULL, NULL, NULL, 0),
('EUR', 'Euro', 'fiat', 1.09, 1.09, '🇪🇺', false, 0, NULL, NULL, NULL, 0),
('GBP', 'British Pound', 'fiat', 1.27, 1.27, '🇬🇧', false, 0, NULL, NULL, NULL, 0),
('TRY', 'Turkish Lira', 'fiat', 0.031, 0.031, '🇹🇷', false, 0, NULL, NULL, NULL, 0),
('IRR', 'Iranian Rial', 'fiat', 0.000024, 0.000024, '🇮🇷', false, 0, NULL, NULL, NULL, 0);

-- Generate price history for SAMIR token (last 30 days)
INSERT INTO public.price_history (asset_id, price_usd, volume, high, low, open_price, close_price, timestamp)
SELECT 
    (SELECT id FROM public.platform_assets WHERE symbol = 'SAMIR'),
    0.95 + (random() * 0.10),
    800000 + (random() * 500000),
    0.98 + (random() * 0.05),
    0.92 + (random() * 0.05),
    0.95 + (random() * 0.08),
    0.96 + (random() * 0.08),
    now() - (n || ' days')::interval
FROM generate_series(1, 30) AS n;

-- Generate price history for METARAM token (last 30 days)
INSERT INTO public.price_history (asset_id, price_usd, volume, high, low, open_price, close_price, timestamp)
SELECT 
    (SELECT id FROM public.platform_assets WHERE symbol = 'METARAM'),
    9.50 + (random() * 1.00),
    500000 + (random() * 400000),
    9.80 + (random() * 0.50),
    9.20 + (random() * 0.50),
    9.50 + (random() * 0.80),
    9.60 + (random() * 0.80),
    now() - (n || ' days')::interval
FROM generate_series(1, 30) AS n;

-- Enable RLS
ALTER TABLE public.platform_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Public read access for assets and price history
CREATE POLICY "Anyone can read platform assets" ON public.platform_assets FOR SELECT USING (true);
CREATE POLICY "Anyone can read price history" ON public.price_history FOR SELECT USING (true);

-- User wallets policies (users can only see their own wallets)
CREATE POLICY "Users can view own wallets" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON public.user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets" ON public.user_wallets FOR UPDATE USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_platform_assets_updated_at BEFORE UPDATE ON public.platform_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();