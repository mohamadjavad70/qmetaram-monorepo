import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const FEE_PERCENT = 0.005 // 0.5%
const AUTO_APPROVE_LIMIT = 100
const MANUAL_APPROVE_LIMIT = 500
const MIN_WITHDRAW = 1
const MAX_WITHDRAW = 50000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Verify JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const body = await req.json()
    const { payout_type, amount_usd, wallet_address, cardholder_name, card_number, card_expiry } = body

    // === SERVER-SIDE VALIDATION ===

    // 1. Validate payout type
    if (!['crypto', 'fiat'].includes(payout_type)) {
      return new Response(JSON.stringify({ error: 'Invalid payout type' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Validate amount
    const numAmount = Number(amount_usd)
    if (isNaN(numAmount) || numAmount < MIN_WITHDRAW || numAmount > MAX_WITHDRAW) {
      return new Response(JSON.stringify({ error: `Amount must be between $${MIN_WITHDRAW} and $${MAX_WITHDRAW}` }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 3. Validate crypto fields
    if (payout_type === 'crypto') {
      if (!wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
        return new Response(JSON.stringify({ error: 'Invalid BSC/ERC20 wallet address' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
    }

    // 4. Validate fiat fields
    if (payout_type === 'fiat') {
      if (!cardholder_name || typeof cardholder_name !== 'string' || cardholder_name.trim().length < 2 || cardholder_name.trim().length > 100) {
        return new Response(JSON.stringify({ error: 'Invalid cardholder name' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      const cleanCard = (card_number || '').replace(/\D/g, '')
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        return new Response(JSON.stringify({ error: 'Invalid card number' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      if (!card_expiry || !/^\d{2}\/\d{2}$/.test(card_expiry)) {
        return new Response(JSON.stringify({ error: 'Invalid card expiry (MM/YY)' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      const [expMonth, expYear] = card_expiry.split('/').map(Number)
      if (expMonth < 1 || expMonth > 12) {
        return new Response(JSON.stringify({ error: 'Invalid expiry month' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      const expiryDate = new Date(2000 + expYear, expMonth, 0) // last day of expiry month
      if (expiryDate < new Date()) {
        return new Response(JSON.stringify({ error: 'Card has expired' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
    }

    // 5. Check for pending withdrawals (rate limit)
    const { count: pendingCount } = await supabaseAdmin
      .from('payout_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'waiting_approval', 'processing'])

    if ((pendingCount || 0) >= 3) {
      return new Response(JSON.stringify({ error: 'Too many pending withdrawals. Please wait for existing requests to complete.' }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // === SERVER-SIDE CALCULATIONS (cannot be manipulated) ===
    const fee = Math.round(numAmount * FEE_PERCENT * 100) / 100
    const netAmount = Math.round((numAmount - fee) * 100) / 100

    const status = numAmount > MANUAL_APPROVE_LIMIT 
      ? 'waiting_approval' 
      : numAmount <= AUTO_APPROVE_LIMIT 
        ? 'approved' 
        : 'pending'

    const riskFlag = numAmount > MANUAL_APPROVE_LIMIT 
      ? 'HIGH_VALUE' 
      : numAmount > AUTO_APPROVE_LIMIT 
        ? 'REVIEW' 
        : 'LOW_RISK'

    const sessionId = `PAY-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    // Mask card number server-side
    let cardNumberMasked: string | null = null
    if (payout_type === 'fiat' && card_number) {
      const clean = card_number.replace(/\D/g, '')
      cardNumberMasked = `${clean.slice(0, 4)}-****-****-${clean.slice(-4)}`
    }

    // === INSERT with service role (bypasses RLS, server-controlled data) ===
    const { data, error: insertError } = await supabaseAdmin.from('payout_requests').insert({
      user_id: user.id,
      payout_type,
      amount_usd: numAmount,
      fee_usd: fee,
      net_amount_usd: netAmount,
      wallet_address: payout_type === 'crypto' ? wallet_address : null,
      wallet_network: payout_type === 'crypto' ? 'BSC/ERC20' : null,
      cardholder_name: payout_type === 'fiat' ? cardholder_name.trim() : null,
      card_number_masked: cardNumberMasked,
      card_expiry: payout_type === 'fiat' ? card_expiry : null,
      payout_session_id: sessionId,
      status,
      risk_flag: riskFlag,
    }).select('id, status, payout_session_id, amount_usd, fee_usd, net_amount_usd, risk_flag').single()

    if (insertError) throw insertError

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      event_type: 'withdraw_request',
      target_id: user.id,
      target_email: user.email,
      metadata: {
        payout_id: data.id,
        amount_usd: numAmount,
        fee_usd: fee,
        payout_type,
        status,
        risk_flag: riskFlag,
        session_id: sessionId,
      }
    })

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        id: data.id,
        session_id: sessionId,
        status,
        amount_usd: numAmount,
        fee_usd: fee,
        net_amount_usd: netAmount,
        risk_flag: riskFlag,
        requires_approval: status === 'waiting_approval',
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error('Withdraw error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
