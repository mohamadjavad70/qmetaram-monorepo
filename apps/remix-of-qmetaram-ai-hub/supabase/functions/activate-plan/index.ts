import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-q-admin-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VALID_PLANS = ['starter', 'pro', 'business'] as const;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ─── Admin Secret Validation ───
    const adminSecret = req.headers.get('x-q-admin-secret');
    const expectedSecret = Deno.env.get('Q_ADMIN_SECRET');

    if (!expectedSecret) {
      console.error('Q_ADMIN_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!adminSecret || adminSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ─── End Admin Validation ───

    const { user_id, plan } = await req.json();

    // Validate inputs
    if (!user_id || typeof user_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid user_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!plan || !VALID_PLANS.includes(plan)) {
      return new Response(JSON.stringify({ error: `Invalid plan. Allowed: ${VALID_PLANS.join(', ')}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user_id)) {
      return new Response(JSON.stringify({ error: 'Invalid user_id format' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service_role to call the SECURITY DEFINER function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase.rpc('apply_plan_limits', {
      p_user: user_id,
      p_plan: plan,
    });

    if (error) {
      console.error('Error applying plan limits:', error);
      return new Response(JSON.stringify({ error: 'Failed to activate plan' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Plan activated: user=${user_id}, plan=${plan}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Plan '${plan}' activated for user`,
      plan,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Activate plan error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
