import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  checks?: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    edgeFunctions: boolean;
  };
  latency?: {
    database: number;
    total: number;
  };
  details?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const details: string[] = [];
  const checks = {
    database: false,
    auth: false,
    storage: false,
    edgeFunctions: true,
  };
  let dbLatency = 0;

  // Only expose full details if caller provides the monitor secret
  const monitorSecret = Deno.env.get("MONITOR_SECRET");
  const callerSecret = req.headers.get("x-monitor-secret");
  const withDetails = !!monitorSecret && callerSecret === monitorSecret;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check database
    const dbStart = Date.now();
    try {
      const { error } = await supabase.from("platform_assets").select("id").limit(1);
      if (error) {
        details.push(`Database error: ${error.message}`);
      } else {
        checks.database = true;
        dbLatency = Date.now() - dbStart;
        details.push(`Database responding (${dbLatency}ms)`);
      }
    } catch (dbError) {
      details.push(`Database connection failed: ${dbError}`);
    }

    // Check auth
    try {
      const { error: authError } = await supabase.auth.getSession();
      if (authError && !authError.message.includes("session")) {
        details.push(`Auth service error: ${authError.message}`);
      } else {
        checks.auth = true;
        details.push("Auth service responding");
      }
    } catch (authError) {
      details.push(`Auth service failed: ${authError}`);
    }

    // Check storage
    try {
      const { error: storageError } = await supabase.storage.listBuckets();
      if (storageError) {
        details.push(`Storage error: ${storageError.message}`);
      } else {
        checks.storage = true;
        details.push("Storage service responding");
      }
    } catch (storageError) {
      details.push(`Storage check failed: ${storageError}`);
    }

    const allChecks = Object.values(checks);
    const passedChecks = allChecks.filter(Boolean).length;
    let status: "healthy" | "degraded" | "down";

    if (passedChecks === allChecks.length) {
      status = "healthy";
    } else if (passedChecks >= 2) {
      status = "degraded";
    } else {
      status = "down";
    }

    const totalLatency = Date.now() - startTime;

    // Always log full details server-side
    console.log("Health check completed:", { status, checks, latency: { database: dbLatency, total: totalLatency }, details });

    // Public response: only status + timestamp. Full details require secret.
    const response: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      ...(withDetails ? { checks, latency: { database: dbLatency, total: totalLatency }, details } : {}),
    };

    return new Response(JSON.stringify(response), {
      status: status === "down" ? 503 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Health check failed:", error);

    const response: HealthStatus = {
      status: "down",
      timestamp: new Date().toISOString(),
      ...(withDetails ? { checks, latency: { database: dbLatency, total: Date.now() - startTime }, details: [...details, `Critical error: ${(error as Error).message}`] } : {}),
    };

    return new Response(JSON.stringify(response), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
