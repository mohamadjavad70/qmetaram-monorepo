import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fail-closed: HASH_SALT must be configured
// HASH_SALT is validated per-request, not at module level

/**
 * Create HMAC for secure hashing
 */
async function createHMAC(data: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(salt);
  const dataBytes = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, dataBytes);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read HASH_SALT at request time so new secrets are picked up
    const HASH_SALT = Deno.env.get('HASH_SALT');
    console.log('HASH_SALT length:', HASH_SALT?.length ?? 0);
    
    // Fail-closed: refuse to operate without proper salt (min 16 chars)
    if (!HASH_SALT || HASH_SALT.length < 16) {
      return new Response(
        JSON.stringify({ error: 'خطای پیکربندی سرور - HASH_SALT not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'توکن نامعتبر است' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { cardNumber, nationalId } = await req.json();

    if (!cardNumber || !nationalId) {
      return new Response(
        JSON.stringify({ error: 'شماره کارت و کد ملی الزامی است' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the input data
    const cleanCardNumber = cardNumber.replace(/\D/g, '');
    const cleanNationalId = nationalId.replace(/\D/g, '');

    // Validate card number format (16 digits)
    if (cleanCardNumber.length !== 16) {
      return new Response(
        JSON.stringify({ error: 'شماره کارت باید 16 رقم باشد' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate national ID format (10 digits)
    if (cleanNationalId.length !== 10) {
      return new Response(
        JSON.stringify({ error: 'کد ملی باید 10 رقم باشد' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create secure hashes using HMAC
    const cardHash = await createHMAC(cleanCardNumber, HASH_SALT);
    const nationalIdHash = await createHMAC(cleanNationalId, HASH_SALT);

    // Create masked card number for display
    const maskedCard = `${cleanCardNumber.substring(0, 4)}-****-****-${cleanCardNumber.substring(12)}`;

    return new Response(
      JSON.stringify({
        success: true,
        cardHash,
        nationalIdHash,
        maskedCard
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Hash error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'خطای سرور' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
