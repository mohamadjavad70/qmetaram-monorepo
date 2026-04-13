import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface NoorClaim {
  id: string;
  user_id: string;
  signup_claimed: boolean;
  total_referral_noor: number;
  total_mission_noor: number;
}

export const useNoorClaims = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [claim, setClaim] = useState<NoorClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClaim = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('noor_claims')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setClaim(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) fetchClaim();
  }, [isAuthenticated, user, fetchClaim]);

  const claimSignupNoor = useCallback(async () => {
    if (!user || claim?.signup_claimed) return false;
    
    try {
      // Step 1: Mark claim as done
      if (!claim) {
        const { error } = await supabase
          .from('noor_claims')
          .insert({ user_id: user.id, signup_claimed: true, total_referral_noor: 0, total_mission_noor: 0 });
        if (error) return false;
      } else {
        const { error } = await supabase
          .from('noor_claims')
          .update({ signup_claimed: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        if (error) return false;
      }

      // Step 2: Find NOOR asset
      const { data: noorAsset } = await supabase
        .from('platform_assets')
        .select('id')
        .eq('symbol', 'NOOR')
        .maybeSingle();

      if (noorAsset) {
        // Step 3: Check if user already has a NOOR wallet
        const { data: existingWallet } = await supabase
          .from('user_wallets')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('asset_id', noorAsset.id)
          .maybeSingle();

        if (existingWallet) {
          // Update existing wallet balance
          await supabase
            .from('user_wallets')
            .update({ balance: (existingWallet.balance || 0) + 1, updated_at: new Date().toISOString() })
            .eq('id', existingWallet.id);
        } else {
          // Create new wallet with 1 NOOR
          await supabase
            .from('user_wallets')
            .insert({ user_id: user.id, asset_id: noorAsset.id, balance: 1, is_demo: false });
        }
      }

      await fetchClaim();
      return true;
    } catch {
      return false;
    }
  }, [user, claim, fetchClaim]);

  const totalNoor = claim 
    ? (claim.signup_claimed ? 1 : 0) + claim.total_referral_noor + claim.total_mission_noor 
    : 0;

  return { claim, totalNoor, isLoading, claimSignupNoor, refresh: fetchClaim };
};
