import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

export interface WalletBalance {
  id: string;
  asset_id: string | null;
  balance: number;
  locked_balance: number;
  is_demo: boolean;
  // joined from platform_assets
  symbol?: string;
  name?: string;
  asset_type?: string;
  current_price_usd?: number;
  icon_emoji?: string;
}

export function useWalletBalances() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['wallet-balances', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WalletBalance[]> => {
      const { data: wallets, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('is_demo', false);

      if (error) throw error;
      if (!wallets?.length) return [];

      // Fetch asset details
      const assetIds = wallets.map(w => w.asset_id).filter(Boolean) as string[];
      const { data: assets } = await supabase
        .from('platform_assets')
        .select('id, symbol, name, asset_type, current_price_usd, icon_emoji')
        .in('id', assetIds);

      type AssetRow = { id: string; symbol: string; name: string; asset_type: string; current_price_usd: number; icon_emoji: string | null };
      const assetMap = new Map<string, AssetRow>((assets as AssetRow[] | null)?.map(a => [a.id, a]) ?? []);

      return wallets.map(w => {
        const asset = w.asset_id ? assetMap.get(w.asset_id) : undefined;
        return {
          id: w.id,
          asset_id: w.asset_id,
          balance: Number(w.balance ?? 0),
          locked_balance: Number(w.locked_balance ?? 0),
          is_demo: w.is_demo ?? false,
          symbol: asset?.symbol,
          name: asset?.name,
          asset_type: asset?.asset_type,
          current_price_usd: asset ? Number(asset.current_price_usd) : undefined,
          icon_emoji: asset?.icon_emoji ?? undefined,
        };
      });
    },
  });
}

export function useTotalBalanceUSD() {
  const { data: wallets } = useWalletBalances();

  const total = wallets?.reduce((sum, w) => {
    return sum + w.balance * (w.current_price_usd ?? 0);
  }, 0) ?? 0;

  return total;
}
