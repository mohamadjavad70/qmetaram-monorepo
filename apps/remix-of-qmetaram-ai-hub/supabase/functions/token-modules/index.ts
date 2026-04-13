import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Module data matching the frontend modules
const moduleData = [
  { id: "matrix", symbol: "MATR", basePrice: 42, color: "#00ff41" },
  { id: "tesla", symbol: "TESL", basePrice: 38, color: "#4169e1" },
  { id: "biruni", symbol: "BIRU", basePrice: 25, color: "#8b4513" },
  { id: "quantum-pulse", symbol: "QPLS", basePrice: 55, color: "#ff1493" },
  { id: "da-vinci", symbol: "DVNC", basePrice: 48, color: "#ffd700" },
  { id: "beethoven", symbol: "BETH", basePrice: 32, color: "#9370db" },
  { id: "mowlana", symbol: "MOWL", basePrice: 28, color: "#20b2aa" },
  { id: "qmetaram", symbol: "QMET", basePrice: 24, color: "#ff6347" },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Token modules endpoint called");
    
    // Generate module token prices with slight random variations
    const modulesWithPrices = moduleData.map(module => {
      const priceVariation = (Math.random() - 0.5) * 10; // ±5 variation
      const changeVariation = (Math.random() - 0.3) * 10; // Slightly positive bias
      
      return {
        id: module.id,
        symbol: module.symbol,
        price: parseFloat((module.basePrice + priceVariation).toFixed(2)),
        change_24h: parseFloat(changeVariation.toFixed(2)),
        color: module.color
      };
    });

    console.log("Returning module tokens:", modulesWithPrices.length);

    return new Response(JSON.stringify(modulesWithPrices), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in token-modules function:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
