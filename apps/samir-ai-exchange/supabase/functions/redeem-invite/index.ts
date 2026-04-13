import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT = 5; // max attempts
const RATE_WINDOW_MINUTES = 5;

async function isRateLimited(supabase: any, ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('otp_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('request_type', 'invite_redeem')
    .gte('created_at', windowStart);

  if (error) {
    console.error('Rate limit check error:', error);
    return false; // fail open but log
  }

  return (count ?? 0) >= RATE_LIMIT;
}

async function recordAttempt(supabase: any, ip: string): Promise<void> {
  await supabase
    .from('otp_rate_limits')
    .insert({ ip_address: ip, request_type: 'invite_redeem' });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Database-backed rate limit by IP
    if (await isRateLimited(supabase, clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record this attempt
    await recordAttempt(supabase, clientIP);

    const { token, password, action = 'validate' } = await req.json();

    if (!token || typeof token !== 'string' || token.length < 32) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the provided token to compare with stored hash
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(token));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Look up token
    const { data: invite, error: lookupError } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (lookupError || !invite) {
      // Audit failed attempt
      await supabase.from('audit_logs').insert({
        event_type: 'invite_invalid_attempt',
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent') || 'unknown',
        metadata: { token_prefix: token.substring(0, 8) },
      });

      return new Response(
        JSON.stringify({ error: 'Invalid or expired invite link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already used
    if (invite.is_used) {
      return new Response(
        JSON.stringify({ error: 'This invite has already been used. Please log in with your email and password.' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if revoked
    if (invite.is_revoked) {
      return new Response(
        JSON.stringify({ error: 'This invite has been revoked.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invite link has expired.' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: validate (just check if token is valid)
    if (action === 'validate') {
      return new Response(
        JSON.stringify({ valid: true, email: invite.email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: redeem (create account + set password)
    if (action === 'redeem') {
      if (!password || typeof password !== 'string' || password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create user account with auto-confirm (invited by admin)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: invite.email,
        password,
        email_confirm: true,
        user_metadata: {
          invited_by: invite.created_by,
          invite_id: invite.id,
        },
      });

      if (createError) {
        // If user already exists, return helpful message
        if (createError.message?.includes('already been registered')) {
          return new Response(
            JSON.stringify({ error: 'An account with this email already exists. Please log in instead.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('Create user error:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark token as used
      await supabase
        .from('invite_tokens')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          assigned_user_id: newUser.user.id,
        })
        .eq('id', invite.id);

      // Create referral link (admin -> new user)
      const { data: adminCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', invite.created_by)
        .single();

      if (adminCode) {
        await supabase.from('referrals').insert({
          referrer_id: invite.created_by,
          referred_id: newUser.user.id,
          referral_code: adminCode.code,
          status: 'active',
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        event_type: 'invite_redeemed',
        actor_id: newUser.user.id,
        target_email: invite.email,
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent') || 'unknown',
        metadata: { invite_id: invite.id, created_by: invite.created_by },
      });

      console.log(`Invite redeemed: ${invite.email} by admin ${invite.created_by}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account created. You can now log in.',
          email: invite.email,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Redeem invite error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
