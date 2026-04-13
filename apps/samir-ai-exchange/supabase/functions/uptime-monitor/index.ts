import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Track previous status to detect state changes
let previousStatus: "healthy" | "degraded" | "down" | null = null;

interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    edgeFunctions: boolean;
  };
  latency: {
    database: number;
    total: number;
  };
  details: string[];
}

async function sendUptimeAlert(
  status: string,
  previousStatus: string | null,
  healthData: HealthStatus,
  adminEmail: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey || !adminEmail) {
    console.log("Email not configured, skipping alert");
    return;
  }

  const resend = new Resend(resendApiKey);
  
  const isRecovery = previousStatus === "down" && status !== "down";
  const isNewIssue = previousStatus !== "down" && status === "down";
  const isDegraded = status === "degraded" && previousStatus === "healthy";

  let subject: string;
  let headerColor: string;
  let headerIcon: string;

  if (isRecovery) {
    subject = "✅ سایت بازیابی شد - Samir Exchange";
    headerColor = "#10b981";
    headerIcon = "✅";
  } else if (isNewIssue) {
    subject = "🚨 هشدار فوری: سایت از دسترس خارج شد!";
    headerColor = "#dc2626";
    headerIcon = "🚨";
  } else if (isDegraded) {
    subject = "⚠️ هشدار: عملکرد سایت کاهش یافته";
    headerColor = "#f59e0b";
    headerIcon = "⚠️";
  } else {
    return; // No significant state change
  }

  const failedChecks = Object.entries(healthData.checks)
    .filter(([_, passed]) => !passed)
    .map(([name]) => name);

  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <style>
        body { font-family: Tahoma, Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #eaeaea; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 12px; overflow: hidden; }
        .header { background: ${headerColor}; padding: 24px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 24px; }
        .content { padding: 24px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; background: ${headerColor}; color: white; margin-bottom: 16px; }
        .checks { background: #0f3460; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .check-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a4980; }
        .check-item:last-child { border-bottom: none; }
        .check-pass { color: #10b981; }
        .check-fail { color: #ef4444; }
        .latency { background: #0f3460; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .footer { padding: 16px 24px; background: #0f3460; text-align: center; color: #64748b; font-size: 12px; }
        .timestamp { color: #94a3b8; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${headerIcon} ${subject}</h1>
        </div>
        <div class="content">
          <div class="status-badge">
            وضعیت: ${status === "healthy" ? "سالم" : status === "degraded" ? "کاهش عملکرد" : "از دسترس خارج"}
          </div>
          
          <div class="checks">
            <h3 style="margin-top: 0; color: #94a3b8;">وضعیت سرویس‌ها:</h3>
            <div class="check-item">
              <span>دیتابیس</span>
              <span class="${healthData.checks.database ? 'check-pass' : 'check-fail'}">
                ${healthData.checks.database ? '✓ فعال' : '✗ غیرفعال'}
              </span>
            </div>
            <div class="check-item">
              <span>احراز هویت</span>
              <span class="${healthData.checks.auth ? 'check-pass' : 'check-fail'}">
                ${healthData.checks.auth ? '✓ فعال' : '✗ غیرفعال'}
              </span>
            </div>
            <div class="check-item">
              <span>فضای ذخیره‌سازی</span>
              <span class="${healthData.checks.storage ? 'check-pass' : 'check-fail'}">
                ${healthData.checks.storage ? '✓ فعال' : '✗ غیرفعال'}
              </span>
            </div>
            <div class="check-item">
              <span>Edge Functions</span>
              <span class="${healthData.checks.edgeFunctions ? 'check-pass' : 'check-fail'}">
                ${healthData.checks.edgeFunctions ? '✓ فعال' : '✗ غیرفعال'}
              </span>
            </div>
          </div>

          <div class="latency">
            <h3 style="margin-top: 0; color: #94a3b8;">تأخیر:</h3>
            <div class="check-item">
              <span>دیتابیس</span>
              <span>${healthData.latency.database}ms</span>
            </div>
            <div class="check-item">
              <span>کل</span>
              <span>${healthData.latency.total}ms</span>
            </div>
          </div>

          ${failedChecks.length > 0 ? `
          <div style="background: #7f1d1d; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <strong>سرویس‌های با مشکل:</strong>
            <ul style="margin: 8px 0; padding-right: 20px;">
              ${failedChecks.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${isRecovery ? `
          <div style="background: #064e3b; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <strong>✅ سایت با موفقیت بازیابی شد!</strong>
            <p style="margin: 8px 0 0 0;">تمام سرویس‌ها دوباره در دسترس هستند.</p>
          </div>
          ` : ''}

          <div class="timestamp">
            زمان بررسی: ${new Date(healthData.timestamp).toLocaleString('fa-IR')}
          </div>
        </div>
        <div class="footer">
          این پیام به صورت خودکار توسط سیستم مانیتورینگ سمیر اکسچنج ارسال شده است.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Uptime Monitor <onboarding@resend.dev>",
      to: [adminEmail],
      subject,
      html,
    });
    console.log("Uptime alert email sent:", subject);
  } catch (error) {
    console.error("Failed to send uptime alert:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_ALERT_EMAIL") || "";

    console.log("Running uptime check...");

    const monitorSecret = Deno.env.get("MONITOR_SECRET") || "";

    // Call health-check endpoint with monitor secret for full details
    const healthResponse = await fetch(`${supabaseUrl}/functions/v1/health-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "x-monitor-secret": monitorSecret,
      },
    });

    const healthData: HealthStatus = await healthResponse.json();
    console.log("Health check result:", healthData);

    // Detect status change and send alert
    if (previousStatus !== null && previousStatus !== healthData.status) {
      console.log(`Status changed from ${previousStatus} to ${healthData.status}`);
      await sendUptimeAlert(healthData.status, previousStatus, healthData, adminEmail);
    } else if (previousStatus === null && healthData.status !== "healthy") {
      // First check and site is not healthy
      await sendUptimeAlert(healthData.status, null, healthData, adminEmail);
    }

    // Update previous status
    previousStatus = healthData.status;

    return new Response(
      JSON.stringify({
        success: true,
        status: healthData.status,
        previousStatus,
        timestamp: new Date().toISOString(),
        healthData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Uptime monitor error:", error);
    
    // Send critical alert
    const adminEmail = Deno.env.get("ADMIN_ALERT_EMAIL") || "";
    if (adminEmail) {
      const criticalHealth: HealthStatus = {
        status: "down",
        timestamp: new Date().toISOString(),
        checks: {
          database: false,
          auth: false,
          storage: false,
          edgeFunctions: false,
        },
        latency: { database: 0, total: 0 },
        details: [`Critical error: ${error}`],
      };
      await sendUptimeAlert("down", previousStatus, criticalHealth, adminEmail);
    }

    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
