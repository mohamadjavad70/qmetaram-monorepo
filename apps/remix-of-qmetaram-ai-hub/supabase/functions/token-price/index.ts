import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Token price endpoint called");
    
    // Mock QMET token price data
    // In production, this would fetch from a real price API
    const basePrice = 24.87;
    const randomVariation = (Math.random() - 0.5) * 2; // ±1 variation
    const price = basePrice + randomVariation;
    
    const baseChange = 5.42;
    const changeVariation = (Math.random() - 0.5) * 4; // ±2 variation
    const change24h = baseChange + changeVariation;

    const tokenData = {
      symbol: "QMET",
      price: parseFloat(price.toFixed(2)),
      change_24h: parseFloat(change24h.toFixed(2))
    };

    console.log("Returning token price:", tokenData);

    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in token-price function:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
