import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// QMETARAM Product IDs
const PRODUCT_IDS = {
  pro: "prod_TgjJUqSmKJ0pX4",
  business: "prod_TgjKZRirujxPCx",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      return new Response(JSON.stringify({
        subscribed: false,
        tier: "free",
        product_id: null,
        subscription_end: null,
        has_business: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscription (Pro Mode - monthly)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    let tier = "free";
    let productId = null;
    let subscriptionEnd = null;
    let hasProSubscription = false;

    if (subscriptions.data.length > 0) {
      for (const subscription of subscriptions.data) {
        const subProductId = subscription.items.data[0]?.price?.product as string;
        
        if (subProductId === PRODUCT_IDS.pro) {
          hasProSubscription = true;
          tier = "pro";
          productId = subProductId;
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          logStep("Pro subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
          break;
        }
      }
    }

    // Check for successful Business Mode payment (one-time)
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });

    let hasBusiness = false;
    
    // Check completed checkout sessions for business product
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });

    for (const session of sessions.data) {
      if (session.payment_status === "paid" && session.mode === "payment") {
        // Get line items to check product
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        for (const item of lineItems.data) {
          const itemProductId = item.price?.product as string;
          if (itemProductId === PRODUCT_IDS.business) {
            hasBusiness = true;
            logStep("Business purchase found", { sessionId: session.id });
            break;
          }
        }
        if (hasBusiness) break;
      }
    }

    // Determine final tier
    if (hasBusiness) {
      tier = "business";
      productId = PRODUCT_IDS.business;
    } else if (hasProSubscription) {
      tier = "pro";
    }

    logStep("Final subscription status", { tier, hasProSubscription, hasBusiness });

    return new Response(JSON.stringify({
      subscribed: tier !== "free",
      tier,
      product_id: productId,
      subscription_end: subscriptionEnd,
      has_business: hasBusiness,
      has_pro: hasProSubscription,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
