import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RATE_LIMITS = {
  perIpPerHour: 10,
  perPhonePerHour: 5,
  perIpPerDay: 50,
  perPhonePerDay: 15,
};

const ALERT_THRESHOLDS = {
  suspiciousIpRequests: 15,
  suspiciousPhoneRequests: 8,
};

const BLOCKED_IP_PATTERNS: string[] = [];

function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

async function hashOTP(otp: string, phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${phone}:${otp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateIranianPhone(phone: string): string | null {
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

function isIPBlocked(ip: string): boolean {
  return BLOCKED_IP_PATTERNS.some(pattern => ip.startsWith(pattern));
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

    if (isIPBlocked(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'دسترسی مسدود شده است' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'احراز هویت الزامی است' }),
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
        JSON.stringify({ error: 'توکن نامعتبر است' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phoneNumber, purpose } = await req.json();

    const normalizedPhone = validateIranianPhone(phoneNumber);
    if (!normalizedPhone) {
      return new Response(
        JSON.stringify({ error: 'شماره موبایل نامعتبر است' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['card_linking', 'withdrawal'].includes(purpose)) {
      return new Response(
        JSON.stringify({ error: 'Invalid purpose' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for rate limit checks and OTP storage
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Check IP rate limit (hourly)
    const { count: ipHourlyCount } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIP)
      .eq('request_type', 'send')
      .gte('created_at', oneHourAgo);

    if ((ipHourlyCount || 0) >= RATE_LIMITS.perIpPerHour) {
      sendSecurityAlert({
        alert_type: 'rate_limit_exceeded',
        ip_address: clientIP,
        request_count: ipHourlyCount || 0,
        threshold: RATE_LIMITS.perIpPerHour,
        time_window: '1 hour',
        additional_info: `IP exceeded hourly OTP send limit`
      });
      return new Response(
        JSON.stringify({ error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً یک ساعت دیگر تلاش کنید.', retryAfter: 3600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check IP rate limit (daily)
    const { count: ipDailyCount } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIP)
      .eq('request_type', 'send')
      .gte('created_at', oneDayAgo);

    if ((ipDailyCount || 0) >= RATE_LIMITS.perIpPerDay) {
      sendSecurityAlert({
        alert_type: 'rate_limit_exceeded',
        ip_address: clientIP,
        request_count: ipDailyCount || 0,
        threshold: RATE_LIMITS.perIpPerDay,
        time_window: '24 hours',
        additional_info: `IP exceeded daily OTP send limit`
      });
      return new Response(
        JSON.stringify({ error: 'محدودیت روزانه درخواست. لطفاً فردا تلاش کنید.', retryAfter: 86400 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((ipDailyCount || 0) >= ALERT_THRESHOLDS.suspiciousIpRequests) {
      sendSecurityAlert({
        alert_type: 'suspicious_ip',
        ip_address: clientIP,
        request_count: ipDailyCount || 0,
        threshold: ALERT_THRESHOLDS.suspiciousIpRequests,
        time_window: '24 hours',
        additional_info: `IP showing suspicious OTP request patterns`
      });
    }

    // Check phone rate limit (hourly)
    const { count: phoneHourlyCount } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', normalizedPhone)
      .eq('request_type', 'send')
      .gte('created_at', oneHourAgo);

    if ((phoneHourlyCount || 0) >= RATE_LIMITS.perPhonePerHour) {
      return new Response(
        JSON.stringify({ error: 'تعداد درخواست‌ها برای این شماره بیش از حد است. لطفاً یک ساعت دیگر تلاش کنید.', retryAfter: 3600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check phone rate limit (daily)
    const { count: phoneDailyCount } = await supabase
      .from('otp_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', normalizedPhone)
      .eq('request_type', 'send')
      .gte('created_at', oneDayAgo);

    if ((phoneDailyCount || 0) >= RATE_LIMITS.perPhonePerDay) {
      return new Response(
        JSON.stringify({ error: 'محدودیت روزانه برای این شماره. لطفاً فردا تلاش کنید.', retryAfter: 86400 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((phoneDailyCount || 0) >= ALERT_THRESHOLDS.suspiciousPhoneRequests) {
      sendSecurityAlert({
        alert_type: 'suspicious_phone',
        phone_number: normalizedPhone,
        request_count: phoneDailyCount || 0,
        threshold: ALERT_THRESHOLDS.suspiciousPhoneRequests,
        time_window: '24 hours',
        additional_info: `Phone showing suspicious OTP request patterns`
      });
    }

    // Log the request for rate limiting
    await supabase.from('otp_rate_limits').insert({
      ip_address: clientIP,
      phone_number: normalizedPhone,
      request_type: 'send'
    });

    // Generate OTP using CSPRNG
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any existing unused OTPs for this phone+purpose
    await supabase
      .from('otp_verifications')
      .update({ is_used: true })
      .eq('phone_number', normalizedPhone)
      .eq('purpose', purpose)
      .eq('is_used', false);

    // Store OTP hash in database (never store plaintext)
    const otpHashValue = await hashOTP(otp, normalizedPhone);
    await supabase.from('otp_verifications').insert({
      phone_number: normalizedPhone,
      otp_hash: otpHashValue,
      purpose: purpose,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      is_used: false,
    });

    const smsApiKey = Deno.env.get('IRANIAN_SMS_API_KEY');
    const smsApiUrl = Deno.env.get('IRANIAN_SMS_API_URL');
    const smsSender = Deno.env.get('IRANIAN_SMS_SENDER');

    // Send SMS via Iranian SMS gateway
    if (smsApiKey && smsApiUrl) {
      try {
        const message = `سامیر اکسچنج\nکد تایید شما: ${otp}\nاین کد تا ۵ دقیقه معتبر است.`;
        const smsResponse = await fetch(smsApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receptor: normalizedPhone,
            message: message,
            sender: smsSender || '10004346',
          }),
        });
        if (!smsResponse.ok) {
          console.error('SMS API error:', await smsResponse.text());
        }
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    } else {
      console.log('SMS API not configured - OTP generated for testing');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'کد تایید ارسال شد',
        expiresAt: expiresAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'خطای سرور' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
