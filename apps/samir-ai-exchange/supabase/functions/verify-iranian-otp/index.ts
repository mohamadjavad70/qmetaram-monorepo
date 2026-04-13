import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RATE_LIMITS = {
  perIpPerHour: 30,
  perPhonePerHour: 10,
  lockoutThreshold: 5,
  lockoutDuration: 15,
  maxAttemptsPerOtp: 3,
};

const ALERT_THRESHOLDS = {
  bruteForceAttempts: 5,
};

async function hashOTP(otp: string, phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${phone}:${otp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 11) return '98' + digits.slice(1);
  if (digits.startsWith('9') && digits.length === 10) return '98' + digits;
  return null;
}

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  return '0.0.0.0';
}

async function sendSecurityAlert(alertData: {
  alert_type: string;
  ip_address?: string;
  phone_number?: string;
  request_count: number;
  threshold: number;
  time_window: string;
  additional_info?: string;
}) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    await fetch(`${supabaseUrl}/functions/v1/security-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(alertData),
    });
  } catch (error) {
    console.error('Error sending security alert:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'احراز هویت الزامی است', verified: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authSupabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'توکن نامعتبر است', verified: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phoneNumber, otp, purpose } = await req.json();

    const normalizedPhone = normalizePhone(phoneNumber);
    if (!normalizedPhone) {
      return new Response(
        JSON.stringify({ error: 'شماره موبایل نامعتبر است', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const lockoutTime = new Date(Date.now() - RATE_LIMITS.lockoutDuration * 60 * 1000).toISOString();

    // Check for lockout
    const { count: recentFailedAttempts } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', normalizedPhone)
      .eq('request_type', 'verify_failed')
      .gte('created_at', lockoutTime);

    if ((recentFailedAttempts || 0) >= RATE_LIMITS.lockoutThreshold) {
      sendSecurityAlert({
        alert_type: 'brute_force_attempt',
        ip_address: clientIP,
        phone_number: normalizedPhone,
        request_count: recentFailedAttempts || 0,
        threshold: RATE_LIMITS.lockoutThreshold,
        time_window: `${RATE_LIMITS.lockoutDuration} minutes`,
        additional_info: `Multiple failed OTP verification attempts detected`
      });
      return new Response(
        JSON.stringify({ 
          error: 'حساب شما موقتاً مسدود شده است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.',
          verified: false,
          lockedUntil: new Date(Date.now() + RATE_LIMITS.lockoutDuration * 60 * 1000).toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check IP rate limit (hourly)
    const { count: ipHourlyCount } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIP)
      .in('request_type', ['verify', 'verify_failed'])
      .gte('created_at', oneHourAgo);

    if ((ipHourlyCount || 0) >= RATE_LIMITS.perIpPerHour) {
      return new Response(
        JSON.stringify({ error: 'تعداد تلاش‌ها بیش از حد مجاز است.', verified: false, retryAfter: 3600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check phone rate limit (hourly)
    const { count: phoneHourlyCount } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', normalizedPhone)
      .in('request_type', ['verify', 'verify_failed'])
      .gte('created_at', oneHourAgo);

    if ((phoneHourlyCount || 0) >= RATE_LIMITS.perPhonePerHour) {
      return new Response(
        JSON.stringify({ error: 'تعداد تلاش‌ها برای این شماره بیش از حد است.', verified: false, retryAfter: 3600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      await supabase.from('otp_rate_limits').insert({
        ip_address: clientIP,
        phone_number: normalizedPhone,
        request_type: 'verify_failed'
      });
      return new Response(
        JSON.stringify({ error: 'فرمت کد نامعتبر است', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Demo mode check
    const DEMO_MODE = Deno.env.get('DEMO_MODE') === 'true';
    const testCodes = ['123456', '111111', '000000'];
    
    if (DEMO_MODE && testCodes.includes(otp)) {
      await supabase.from('otp_rate_limits').insert({
        ip_address: clientIP,
        phone_number: normalizedPhone,
        request_type: 'verify'
      });
      return new Response(
        JSON.stringify({ verified: true, message: 'شماره موبایل تایید شد (حالت آزمایشی)', phone: normalizedPhone }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up the latest unused OTP record for this phone+purpose from database
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .eq('purpose', purpose)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      await supabase.from('otp_rate_limits').insert({
        ip_address: clientIP,
        phone_number: normalizedPhone,
        request_type: 'verify_failed'
      });
      return new Response(
        JSON.stringify({ error: 'کد منقضی شده یا وجود ندارد. لطفاً کد جدید درخواست کنید.', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max attempts per OTP
    if (otpRecord.attempts >= RATE_LIMITS.maxAttemptsPerOtp) {
      // Mark OTP as used (exhausted)
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('id', otpRecord.id);

      await supabase.from('otp_rate_limits').insert({
        ip_address: clientIP,
        phone_number: normalizedPhone,
        request_type: 'verify_failed'
      });
      return new Response(
        JSON.stringify({ error: 'تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کد جدید درخواست کنید.', verified: false }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the submitted OTP and compare with stored hash
    const submittedHash = await hashOTP(otp, normalizedPhone);

    if (submittedHash === otpRecord.otp_hash) {
      // OTP matches - mark as used
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('id', otpRecord.id);

      await supabase.from('otp_rate_limits').insert({
        ip_address: clientIP,
        phone_number: normalizedPhone,
        request_type: 'verify'
      });
      return new Response(
        JSON.stringify({ verified: true, message: 'شماره موبایل تایید شد' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // OTP doesn't match - increment attempts
    await supabase
      .from('otp_verifications')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    // Log failed attempt
    await supabase.from('otp_rate_limits').insert({
      ip_address: clientIP,
      phone_number: normalizedPhone,
      request_type: 'verify_failed'
    });

    return new Response(
      JSON.stringify({ verified: false, error: 'کد تایید نامعتبر است' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'خطای سرور', verified: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
