import { supabase } from '@/integrations/supabase/client';

interface WithdrawalRequest {
  amount_usd: number;
  payout_type: 'crypto' | 'card';
  wallet_address?: string;
  wallet_network?: string;
  cardholder_name?: string;
  card_number_masked?: string;
  card_expiry?: string;
}

const FEE_RATE = 0.005; // 0.5%

export async function requestWithdrawal(params: WithdrawalRequest) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Authentication required');

  if (params.amount_usd <= 0) throw new Error('Amount must be positive');

  // Check pending request limit (max 3)
  const { count } = await supabase
    .from('payout_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending');

  if ((count ?? 0) >= 3) throw new Error('Maximum 3 pending withdrawal requests allowed');

  const fee_usd = Math.round(params.amount_usd * FEE_RATE * 100) / 100;
  const net_amount_usd = Math.round((params.amount_usd - fee_usd) * 100) / 100;

  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      user_id: user.id,
      amount_usd: params.amount_usd,
      fee_usd,
      net_amount_usd,
      payout_type: params.payout_type,
      wallet_address: params.wallet_address ?? null,
      wallet_network: params.wallet_network ?? null,
      cardholder_name: params.cardholder_name ?? null,
      card_number_masked: params.card_number_masked ?? null,
      card_expiry: params.card_expiry ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPayoutRequests() {
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}
