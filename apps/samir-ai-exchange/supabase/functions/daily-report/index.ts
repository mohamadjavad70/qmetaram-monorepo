import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyStats {
  users: {
    total: number;
    newToday: number;
    activeToday: number;
  };
  transactions: {
    totalTrades: number;
    tradesToday: number;
    volumeToday: number;
    tomanDeposits: number;
    tomanWithdrawals: number;
  };
  security: {
    otpRequests24h: number;
    failedVerifications24h: number;
    suspiciousIPs: number;
    suspiciousPhones: number;
    blockedAttempts: number;
  };
  kyc: {
    pending: number;
    approvedToday: number;
    rejectedToday: number;
  };
  system: {
    status: string;
    databaseLatency: number;
    lastHealthCheck: string;
  };
}

async function fetchDailyStats(supabase: any): Promise<DailyStats> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayISO = yesterday.toISOString();

  // User stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: newUsersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterdayISO);

  // Trade stats
  const { count: totalTrades } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true });

  const { data: tradesTodayData } = await supabase
    .from('trades')
    .select('from_amount, to_amount')
    .gte('created_at', yesterdayISO);

  const tradesToday = tradesTodayData?.length || 0;
  const volumeToday = tradesTodayData?.reduce((sum: number, t: any) => sum + (t.from_amount || 0), 0) || 0;

  // Toman transactions
  const { count: tomanDeposits } = await supabase
    .from('toman_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', 'deposit')
    .gte('created_at', yesterdayISO);

  const { count: tomanWithdrawals } = await supabase
    .from('toman_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', 'withdrawal')
    .gte('created_at', yesterdayISO);

  // Security stats
  const { count: otpRequests24h } = await supabase
    .from('otp_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('request_type', 'send')
    .gte('created_at', yesterdayISO);

  const { count: failedVerifications24h } = await supabase
    .from('otp_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('request_type', 'verify_failed')
    .gte('created_at', yesterdayISO);

  // Suspicious activity
  const { data: ipActivity } = await supabase
    .from('otp_rate_limits')
    .select('ip_address')
    .gte('created_at', yesterdayISO);

  const ipCounts: Record<string, number> = {};
  ipActivity?.forEach((r: any) => {
    const ip = String(r.ip_address);
    ipCounts[ip] = (ipCounts[ip] || 0) + 1;
  });
  const suspiciousIPs = Object.values(ipCounts).filter(c => c >= 15).length;

  const { data: phoneActivity } = await supabase
    .from('otp_rate_limits')
    .select('phone_number')
    .not('phone_number', 'is', null)
    .gte('created_at', yesterdayISO);

  const phoneCounts: Record<string, number> = {};
  phoneActivity?.forEach((r: any) => {
    if (r.phone_number) {
      phoneCounts[r.phone_number] = (phoneCounts[r.phone_number] || 0) + 1;
    }
  });
  const suspiciousPhones = Object.values(phoneCounts).filter(c => c >= 8).length;

  // KYC stats
  const { count: pendingKYC } = await supabase
    .from('kyc_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: approvedToday } = await supabase
    .from('kyc_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('verified_at', yesterdayISO);

  const { count: rejectedToday } = await supabase
    .from('kyc_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')
    .gte('updated_at', yesterdayISO);

  return {
    users: {
      total: totalUsers || 0,
      newToday: newUsersToday || 0,
      activeToday: tradesToday,
    },
    transactions: {
      totalTrades: totalTrades || 0,
      tradesToday,
      volumeToday,
      tomanDeposits: tomanDeposits || 0,
      tomanWithdrawals: tomanWithdrawals || 0,
    },
    security: {
      otpRequests24h: otpRequests24h || 0,
      failedVerifications24h: failedVerifications24h || 0,
      suspiciousIPs,
      suspiciousPhones,
      blockedAttempts: failedVerifications24h || 0,
    },
    kyc: {
      pending: pendingKYC || 0,
      approvedToday: approvedToday || 0,
      rejectedToday: rejectedToday || 0,
    },
    system: {
      status: 'operational',
      databaseLatency: 0,
      lastHealthCheck: now.toISOString(),
    },
  };
}

function generateEmailHTML(stats: DailyStats, date: string): string {
  const securityStatus = stats.security.suspiciousIPs > 0 || stats.security.suspiciousPhones > 0 
    ? { text: 'نیاز به بررسی', color: '#f59e0b', icon: '⚠️' }
    : { text: 'امن', color: '#10b981', icon: '✅' };

  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <style>
        body { font-family: Tahoma, Arial, sans-serif; margin: 0; padding: 20px; background: #0f172a; color: #e2e8f0; direction: rtl; }
        .container { max-width: 700px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; }
        .header p { margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px; }
        .content { padding: 24px; }
        .section { background: #334155; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 18px; font-weight: bold; color: #f1f5f9; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat-card { background: #475569; border-radius: 8px; padding: 16px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #60a5fa; }
        .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
        .stat-change { font-size: 11px; margin-top: 4px; }
        .positive { color: #10b981; }
        .negative { color: #ef4444; }
        .warning { color: #f59e0b; }
        .security-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        .alert-box { background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; padding: 16px; margin-top: 12px; }
        .footer { padding: 20px 24px; background: #0f172a; text-align: center; color: #64748b; font-size: 12px; }
        .divider { height: 1px; background: #475569; margin: 16px 0; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #475569; }
        .summary-row:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 گزارش روزانه سمیر اکسچنج</h1>
          <p>${date}</p>
        </div>
        
        <div class="content">
          <!-- Users Section -->
          <div class="section">
            <div class="section-title">👥 کاربران</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.users.total.toLocaleString('fa-IR')}</div>
                <div class="stat-label">کل کاربران</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.users.newToday.toLocaleString('fa-IR')}</div>
                <div class="stat-label">کاربران جدید امروز</div>
                ${stats.users.newToday > 0 ? '<div class="stat-change positive">+' + stats.users.newToday + '</div>' : ''}
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.users.activeToday.toLocaleString('fa-IR')}</div>
                <div class="stat-label">کاربران فعال امروز</div>
              </div>
            </div>
          </div>

          <!-- Transactions Section -->
          <div class="section">
            <div class="section-title">💱 تراکنش‌ها</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.transactions.tradesToday.toLocaleString('fa-IR')}</div>
                <div class="stat-label">معاملات امروز</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.transactions.tomanDeposits.toLocaleString('fa-IR')}</div>
                <div class="stat-label">واریز تومانی</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.transactions.tomanWithdrawals.toLocaleString('fa-IR')}</div>
                <div class="stat-label">برداشت تومانی</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="summary-row">
              <span>کل معاملات</span>
              <span>${stats.transactions.totalTrades.toLocaleString('fa-IR')}</span>
            </div>
          </div>

          <!-- Security Section -->
          <div class="section">
            <div class="section-title">🛡️ امنیت</div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <span>وضعیت کلی:</span>
              <span class="security-badge" style="background: ${securityStatus.color}20; color: ${securityStatus.color};">
                ${securityStatus.icon} ${securityStatus.text}
              </span>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.security.otpRequests24h.toLocaleString('fa-IR')}</div>
                <div class="stat-label">درخواست OTP</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${stats.security.failedVerifications24h > 10 ? 'warning' : ''}">${stats.security.failedVerifications24h.toLocaleString('fa-IR')}</div>
                <div class="stat-label">تایید ناموفق</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${stats.security.suspiciousIPs > 0 ? 'negative' : ''}">${stats.security.suspiciousIPs.toLocaleString('fa-IR')}</div>
                <div class="stat-label">IP مشکوک</div>
              </div>
            </div>
            ${stats.security.suspiciousIPs > 0 || stats.security.suspiciousPhones > 0 ? `
            <div class="alert-box">
              <strong>⚠️ هشدار امنیتی:</strong>
              <ul style="margin: 8px 0 0 0; padding-right: 20px;">
                ${stats.security.suspiciousIPs > 0 ? `<li>${stats.security.suspiciousIPs} آدرس IP مشکوک شناسایی شده</li>` : ''}
                ${stats.security.suspiciousPhones > 0 ? `<li>${stats.security.suspiciousPhones} شماره تلفن مشکوک شناسایی شده</li>` : ''}
              </ul>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #fca5a5;">لطفاً پنل مدیریت را بررسی کنید.</p>
            </div>
            ` : ''}
          </div>

          <!-- KYC Section -->
          <div class="section">
            <div class="section-title">📋 احراز هویت (KYC)</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value ${stats.kyc.pending > 5 ? 'warning' : ''}">${stats.kyc.pending.toLocaleString('fa-IR')}</div>
                <div class="stat-label">در انتظار بررسی</div>
              </div>
              <div class="stat-card">
                <div class="stat-value positive">${stats.kyc.approvedToday.toLocaleString('fa-IR')}</div>
                <div class="stat-label">تایید شده امروز</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.kyc.rejectedToday.toLocaleString('fa-IR')}</div>
                <div class="stat-label">رد شده امروز</div>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="section">
            <div class="section-title">⚙️ وضعیت سیستم</div>
            <div class="summary-row">
              <span>وضعیت سرور</span>
              <span class="positive">✅ فعال</span>
            </div>
            <div class="summary-row">
              <span>آخرین بررسی سلامت</span>
              <span>${new Date(stats.system.lastHealthCheck).toLocaleString('fa-IR')}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          این گزارش به صورت خودکار هر ۲۴ ساعت ارسال می‌شود.<br>
          سمیر اکسچنج - پنل مدیریت
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Require cron secret or admin JWT to prevent unauthorized access
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");

    let isAuthorized = false;

    // Check cron secret first (for scheduled invocations)
    if (expectedSecret && cronSecret === expectedSecret) {
      isAuthorized = true;
    }

    // Fallback: check JWT for admin role
    if (!isAuthorized && authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await authClient.auth.getUser(token);
      if (!authError && user) {
        // Check admin role
        const { data: roleData } = await authClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleData) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_ALERT_EMAIL");

    if (!resendApiKey || !adminEmail) {
      console.error("Email configuration missing");
      return new Response(
        JSON.stringify({ error: "Email configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    console.log("Generating daily report...");

    // Fetch all stats
    const stats = await fetchDailyStats(supabase);
    console.log("Stats collected:", stats);

    // Generate email
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const html = generateEmailHTML(stats, dateStr);

    // Send email
    const emailResult = await resend.emails.send({
      from: "Daily Report <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `📊 گزارش روزانه سمیر اکسچنج - ${dateStr}`,
      html,
    });

    console.log("Daily report sent:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Daily report error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
