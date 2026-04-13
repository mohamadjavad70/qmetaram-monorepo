import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformAsset {
  id: string;
  symbol: string;
  name: string;
  asset_type: 'fiat' | 'crypto' | 'token';
  base_price_usd: number;
  current_price_usd: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  total_supply: number | null;
  circulating_supply: number | null;
  icon_emoji: string;
  is_platform_token: boolean;
  fee_discount_percent: number;
  is_active: boolean;
}

export interface PriceHistory {
  id: string;
  asset_id: string;
  price_usd: number;
  volume: number;
  high: number;
  low: number;
  open_price: number;
  close_price: number;
  timestamp: string;
}

export function useAssets() {
  return useQuery({
    queryKey: ['platform-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_assets')
        .select('*')
        .eq('is_active', true)
        .order('asset_type', { ascending: true });
      
      if (error) throw error;
      return data as PlatformAsset[];
    },
  });
}

export function usePlatformTokens() {
  return useQuery({
    queryKey: ['platform-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_assets')
        .select('*')
        .eq('is_platform_token', true)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as PlatformAsset[];
    },
  });
}

export function usePriceHistory(assetId: string | undefined, limit = 30) {
  return useQuery({
    queryKey: ['price-history', assetId, limit],
    queryFn: async () => {
      if (!assetId) return [];
      
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('asset_id', assetId)
        .order('timestamp', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data as PriceHistory[];
    },
    enabled: !!assetId,
  });
}

export function useAssetBySymbol(symbol: string) {
  return useQuery({
    queryKey: ['asset', symbol],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_assets')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();
      
      if (error) throw error;
      return data as PlatformAsset | null;
    },
  });
}
