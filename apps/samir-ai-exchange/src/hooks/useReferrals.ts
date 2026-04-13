import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  is_active: boolean;
}

interface Referral {
  id: string;
  referred_id: string;
  level: number;
  status: string;
  total_commission_earned: number;
  created_at: string;
  referred_user?: {
    email: string | null;
    full_name: string | null;
  };
}

interface Commission {
  id: string;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingCommissions: number;
}

export const useReferrals = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingCommissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralCode = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching referral code:', error);
      return;
    }

    if (data) {
      setReferralCode(data);
    } else {
      // Auto-create referral code for existing users who don't have one
      const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      const newCode = randomPart;
      const { data: newData, error: createError } = await supabase
        .from('referral_codes')
        .insert({ user_id: user.id, code: newCode })
        .select()
        .single();

      if (!createError && newData) {
        setReferralCode(newData);
      } else {
        console.error('Error creating referral code:', createError);
      }
    }
  }, [user]);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;

    const { data: referralsData, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return;
    }

    if (referralsData && referralsData.length > 0) {
      // Fetch referred users' profiles
      const referredIds = referralsData.map(r => r.referred_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', referredIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const enrichedReferrals = referralsData.map(r => ({
        ...r,
        referred_user: profilesMap.get(r.referred_id) || { email: null, full_name: null }
      }));

      setReferrals(enrichedReferrals);
    } else {
      setReferrals([]);
    }
  }, [user]);

  const fetchCommissions = useCallback(async () => {
    if (!user) return;

    // First get user's referral IDs
    const { data: userReferrals } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', user.id);

    if (!userReferrals || userReferrals.length === 0) {
      setCommissions([]);
      return;
    }

    const referralIds = userReferrals.map(r => r.id);

    const { data, error } = await supabase
      .from('referral_commissions')
      .select('*')
      .in('referral_id', referralIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching commissions:', error);
      return;
    }

    setCommissions(data || []);
  }, [user]);

  const calculateStats = useCallback(() => {
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const totalEarnings = referrals.reduce((sum, r) => sum + (r.total_commission_earned || 0), 0);
    const pendingCommissions = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commission_amount, 0);

    setStats({
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingCommissions,
    });
  }, [referrals, commissions]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      Promise.all([
        fetchReferralCode(),
        fetchReferrals(),
        fetchCommissions(),
      ]).finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, user, fetchReferralCode, fetchReferrals, fetchCommissions]);

  useEffect(() => {
    calculateStats();
  }, [referrals, commissions, calculateStats]);

  const getReferralLink = useCallback(() => {
    if (!referralCode) return '';
    return `${window.location.origin}/auth?ref=${referralCode.code}`;
  }, [referralCode]);

  return {
    referralCode,
    referrals,
    commissions,
    stats,
    isLoading,
    getReferralLink,
    refreshData: () => {
      fetchReferralCode();
      fetchReferrals();
      fetchCommissions();
    },
  };
};
