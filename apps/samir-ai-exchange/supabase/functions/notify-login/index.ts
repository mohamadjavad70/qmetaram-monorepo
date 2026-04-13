import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, timestamp, userAgent, ip } = await req.json();

    // Get admin phone from environment variable
    const adminPhone = Deno.env.get('ADMIN_ALERT_PHONE');
    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');

    // Format the message
    const message = `🔔 New Login Alert - Samir Exchange

User: ${email}
Time: ${new Date(timestamp).toLocaleString('en-US', { timeZone: 'Europe/Berlin' })}
Device: ${userAgent?.slice(0, 50) || 'Unknown'}
IP: ${ip || 'Unknown'}

This is an automated security notification.`;

    console.log("=== LOGIN NOTIFICATION ===");
    if (adminPhone) {
      console.log(`To: ${adminPhone}`);
    }
    console.log(message);
    console.log("========================");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Login notification processed",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
