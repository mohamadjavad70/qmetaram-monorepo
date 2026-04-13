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

    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
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
    const action = url.searchParams.get('action') || 'get-signed-urls';
    
    if (action === 'get-signed-urls') {
      const body = await req.json();
      const { kyc_id } = body;
      
      if (!kyc_id) {
        return new Response(
          JSON.stringify({ error: 'kyc_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch KYC record using service role
      const { data: kyc, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('id, user_id, document_front_url, document_back_url, selfie_url, document_number_masked')
        .eq('id', kyc_id)
        .single();

      if (kycError || !kyc) {
        return new Response(
          JSON.stringify({ error: 'KYC record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate signed URLs for document paths (60 second TTL)
      const signedUrls: Record<string, string | null> = {
        document_front_url: null,
        document_back_url: null,
        selfie_url: null,
      };

      const TTL = 60; // seconds

      for (const field of ['document_front_url', 'document_back_url', 'selfie_url'] as const) {
        const path = kyc[field];
        if (path) {
          const storagePath = extractStoragePath(path);
          if (storagePath) {
            const { data: signedData, error: signError } = await supabase.storage
              .from('kyc-documents')
              .createSignedUrl(storagePath, TTL);
            
            if (!signError && signedData?.signedUrl) {
              signedUrls[field] = signedData.signedUrl;
            }
          } else {
            signedUrls[field] = null;
          }
        }
      }

      // Document number is already masked at the database level
      const maskedDocNumber = kyc.document_number_masked ?? null;

      console.log(`Admin ${user.id} accessed KYC documents for record ${kyc_id} (user: ${kyc.user_id})`);

      return new Response(
        JSON.stringify({ 
          signed_urls: signedUrls,
          masked_document_number: maskedDocNumber
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin KYC documents error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractStoragePath(urlOrPath: string): string | null {
  // If it's already a relative path, return as-is
  if (!urlOrPath.startsWith('http')) {
    return urlOrPath;
  }
  // Try to extract path from Supabase storage URL
  const match = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/kyc-documents\/(.+)/);
  if (match) {
    return match[1];
  }
  return null;
}
