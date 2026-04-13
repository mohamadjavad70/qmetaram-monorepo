import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authSupabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role using service role client
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    switch (action) {
      case 'list': {
        const timeWindow = url.searchParams.get('hours') || '24';
        const since = new Date(Date.now() - parseInt(timeWindow) * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('otp_rate_limits')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(500);

        if (error) throw error;

        return new Response(
          JSON.stringify({ data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_by_ip': {
        const body = await req.json();
        const { ip } = body;
        if (!ip) {
          return new Response(
            JSON.stringify({ error: 'IP address required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('otp_rate_limits')
          .delete()
          .eq('ip_address', ip);

        if (error) throw error;

        console.log(`Admin ${user.id} deleted rate limits for IP: ${ip}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_by_phone': {
        const body = await req.json();
        const { phone } = body;
        if (!phone) {
          return new Response(
            JSON.stringify({ error: 'Phone number required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('otp_rate_limits')
          .delete()
          .eq('phone_number', phone);

        if (error) throw error;

        console.log(`Admin ${user.id} deleted rate limits for phone: ${phone}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cleanup': {
        const { error } = await supabase
          .from('otp_rate_limits')
          .delete()
          .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        console.log(`Admin ${user.id} cleaned up old rate limit records`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Admin OTP rate limits error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
