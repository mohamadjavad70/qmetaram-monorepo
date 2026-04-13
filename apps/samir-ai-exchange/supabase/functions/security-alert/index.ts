import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const adminEmail = Deno.env.get("ADMIN_ALERT_EMAIL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertRequest {
  alert_type: "suspicious_ip" | "suspicious_phone" | "rate_limit_exceeded" | "brute_force_attempt";
  ip_address?: string;
  phone_number?: string;
  request_count: number;
  threshold: number;
  time_window: string;
  additional_info?: string;
}

const getAlertSubject = (alertType: string): string => {
  switch (alertType) {
    case "suspicious_ip":
      return "🚨 Suspicious IP Activity Detected";
    case "suspicious_phone":
      return "⚠️ Suspicious Phone Number Activity";
    case "rate_limit_exceeded":
      return "🔒 Rate Limit Exceeded Alert";
    case "brute_force_attempt":
      return "🛑 Potential Brute Force Attack Detected";
    default:
      return "Security Alert";
  }
};

const getAlertSeverity = (alertType: string): string => {
  switch (alertType) {
    case "brute_force_attempt":
      return "CRITICAL";
    case "suspicious_ip":
      return "HIGH";
    case "rate_limit_exceeded":
      return "MEDIUM";
    case "suspicious_phone":
      return "MEDIUM";
    default:
      return "LOW";
  }
};

const formatAlertEmail = (data: AlertRequest): string => {
  const severity = getAlertSeverity(data.alert_type);
  const timestamp = new Date().toISOString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #eaeaea; }
        .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 12px; overflow: hidden; }
        .header { background: ${severity === 'CRITICAL' ? '#dc2626' : severity === 'HIGH' ? '#ea580c' : '#ca8a04'}; padding: 20px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 24px; }
        .content { padding: 24px; }
        .severity { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; background: ${severity === 'CRITICAL' ? '#dc2626' : severity === 'HIGH' ? '#ea580c' : '#ca8a04'}; color: white; margin-bottom: 16px; }
        .detail { background: #0f3460; padding: 16px; border-radius: 8px; margin: 12px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a4980; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #94a3b8; }
        .value { color: #f1f5f9; font-weight: 500; font-family: monospace; }
        .footer { padding: 16px 24px; background: #0f3460; text-align: center; color: #64748b; font-size: 12px; }
        .action-required { background: #7c3aed20; border: 1px solid #7c3aed; padding: 16px; border-radius: 8px; margin-top: 16px; }
        .action-title { color: #a78bfa; font-weight: bold; margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${getAlertSubject(data.alert_type)}</h1>
        </div>
        <div class="content">
          <span class="severity">${severity} SEVERITY</span>
          
          <div class="detail">
            <div class="detail-row">
              <span class="label">Alert Type</span>
              <span class="value">${data.alert_type.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
            ${data.ip_address ? `
            <div class="detail-row">
              <span class="label">IP Address</span>
              <span class="value">${data.ip_address}</span>
            </div>
            ` : ''}
            ${data.phone_number ? `
            <div class="detail-row">
              <span class="label">Phone Number</span>
              <span class="value">${data.phone_number}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Request Count</span>
              <span class="value">${data.request_count}</span>
            </div>
            <div class="detail-row">
              <span class="label">Threshold</span>
              <span class="value">${data.threshold}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time Window</span>
              <span class="value">${data.time_window}</span>
            </div>
            <div class="detail-row">
              <span class="label">Timestamp</span>
              <span class="value">${timestamp}</span>
            </div>
          </div>

          ${data.additional_info ? `
          <div class="detail">
            <div class="label" style="margin-bottom: 8px;">Additional Information</div>
            <div class="value">${data.additional_info}</div>
          </div>
          ` : ''}

          <div class="action-required">
            <div class="action-title">⚡ Recommended Actions</div>
            <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
              ${data.alert_type === 'brute_force_attempt' ? `
                <li>Consider blocking this IP immediately</li>
                <li>Review all recent OTP requests from this source</li>
                <li>Check for compromised accounts</li>
              ` : data.alert_type === 'suspicious_ip' ? `
                <li>Monitor this IP for continued suspicious activity</li>
                <li>Consider temporary rate limiting</li>
              ` : `
                <li>Review the activity logs in admin panel</li>
                <li>Monitor for escalating patterns</li>
              `}
            </ul>
          </div>
        </div>
        <div class="footer">
          This is an automated security alert from your OTP system.<br>
          Do not reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This function should only be called internally by other edge functions
    // Validate that the caller is using service role key or is an authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Allow service role key (internal calls from other edge functions)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const token = authHeader.replace('Bearer ', '');
    
    // Accept calls from other edge functions using anon key or service role key
    // Also accept authenticated admin users
    const isInternalCall = token === serviceRoleKey || token === anonKey;
    
    if (!isInternalCall) {
      // Validate as authenticated admin user
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const serviceSupabase = createClient(supabaseUrl, serviceRoleKey!);
      const { data: hasAdmin } = await serviceSupabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      if (!hasAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const data: AlertRequest = await req.json();
    
    console.log("Security alert triggered:", {
      type: data.alert_type,
      ip: data.ip_address,
      phone: data.phone_number,
      count: data.request_count,
    });

    if (!adminEmail) {
      console.warn("ADMIN_ALERT_EMAIL not configured, skipping email alert");
      return new Response(
        JSON.stringify({ success: true, message: "Alert logged but email not sent (no admin email configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: true, message: "Alert logged but email not sent (no Resend key)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "Security Alerts <onboarding@resend.dev>",
      to: [adminEmail],
      subject: getAlertSubject(data.alert_type),
      html: formatAlertEmail(data),
    });

    console.log("Alert email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending security alert:", errorMessage);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
