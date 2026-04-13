import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap, Star, ArrowRight, Shield, CreditCard, Building2, Copy, ExternalLink, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/context/SubscriptionContext";
import wiseQrCode from "@/assets/wise-qr-code.png";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  stripeMode: "subscription" | "payment";
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    period: "3 weeks",
    description: "Experience all QMETARAM modules with full access for 21 days",
    icon: Sparkles,
    gradient: "from-muted to-muted/50",
    stripeMode: "payment",
    features: [
      "Access to all 8 QMETARAM modules",
      "Basic AI conversations",
      "Community access",
      "Standard response speed",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro Mode",
    price: 20,
    period: "month",
    description: "Full access with AI Fusion, Multimodal Command Center & Export features",
    icon: Zap,
    gradient: "from-primary/80 to-accent/80",
    highlight: true,
    badge: "POPULAR",
    stripeMode: "subscription",
    features: [
      "Everything in Free",
      "AI Fusion Mode (combine modules)",
      "Multimodal Command Center",
      "Voice commands & file uploads",
      "Export & Deliver Mode",
      "GitHub repos & Docker builds",
      "Brand kits & video export",
      "Audio stems export",
      "Priority support"
    ]
  },
  {
    id: "business",
    name: "Business Mode",
    price: 69,
    period: "one-time",
    description: "Startup consulting tools with lifetime access",
    icon: Crown,
    gradient: "from-da-vinci via-qmetaram to-quantum-pulse",
    badge: "LIFETIME",
    stripeMode: "payment",
    features: [
      "Everything in Pro Mode",
      "Idea validation system",
      "Revenue modeling tools",
      "Pitch deck generation",
      "Go-to-market strategy",
      "Monetization roadmaps",
      "Business language mode",
      "Dedicated support",
      "One-time payment"
    ]
  }
];

// Payment details for Wise
const PAYMENT_INFO = {
  wise: {
    iban: "GB92 TRWI 2314 7062 3496 60",
    swift: "TRWIGB2LXXX",
    accountHolder: "Sam Arman",
    paymentLink: "https://wise.com/pay/me/sama880",
    bank: "Wise Payments Limited, London, UK"
  }
};

export default function Subscriptions() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier, isProUser, isBusinessUser, isAdmin, refreshSubscription, subscriptionEnd } = useSubscription();

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const plan = searchParams.get("plan");

    if (success === "true") {
      toast({
        title: "Payment Successful!",
        description: `Your ${plan === "pro" ? "Pro Mode" : "Business Mode"} is now active.`,
      });
      refreshSubscription();
      // Clean URL
      navigate("/subscriptions", { replace: true });
    } else if (canceled === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        variant: "destructive",
      });
      navigate("/subscriptions", { replace: true });
    }
  }, [searchParams, navigate, toast, refreshSubscription]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      toast({
        title: "Free Trial",
        description: "Sign up to start your free trial!",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe.",
        });
        navigate("/auth", { state: { from: "/subscriptions", plan: planId } });
        setIsLoading(false);
        return;
      }

      // Call create-checkout edge function
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate checkout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your subscription.",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlanBadge = (planId: string) => {
    if (isAdmin) return planId === "business" ? "ADMIN ACCESS" : null;
    if (tier === planId) return "YOUR PLAN";
    return null;
  };

  return (
    <div className="min-h-screen-safe bg-background">
      <Navbar />
      
      <main className="pt-20 sm:pt-24 pb-12">
        {/* Hero Section */}
        <section className="container-safe py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-responsive-2xl font-bold mb-4">
              <span className="text-gradient-primary">Choose Your Plan</span>
            </h1>
            <p className="text-muted-foreground text-responsive-base max-w-2xl mx-auto mb-4">
              Unlock the full power of QMETARAM AI platform
            </p>
            
            {/* Current subscription status */}
            {(isProUser || isBusinessUser || isAdmin) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
              >
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {isAdmin ? "Admin Access" : isBusinessUser ? "Business Mode Active" : "Pro Mode Active"}
                  {subscriptionEnd && ` (renews ${new Date(subscriptionEnd).toLocaleDateString()})`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage
                </Button>
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Shield className="w-4 h-4" />
                <span>30-day money-back guarantee</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshSubscription()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh Status
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="container-safe">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const currentPlanBadge = getCurrentPlanBadge(plan.id);
              const isCurrentPlan = tier === plan.id || (isAdmin && plan.id === "business");
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {(plan.badge || currentPlanBadge) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold z-10 ${
                        currentPlanBadge 
                          ? "bg-green-500 text-white"
                          : plan.badge === "POPULAR" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-gradient-to-r from-da-vinci to-qmetaram text-foreground"
                      }`}
                    >
                      {currentPlanBadge || plan.badge}
                    </motion.div>
                  )}
                  
                  <Card
                    className={`relative overflow-hidden h-full flex flex-col transition-all duration-300 ${
                      isCurrentPlan
                        ? "border-2 border-green-500 shadow-lg shadow-green-500/20"
                        : plan.highlight 
                        ? "border-2 border-primary shadow-lg shadow-primary/20" 
                        : "border border-border hover:border-primary/50"
                    } ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
                  >
                    {/* Gradient Background */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`}
                    />
                    
                    <div className="relative p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="text-center mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}
                        >
                          <plan.icon className="w-6 h-6 text-foreground" />
                        </motion.div>
                        
                        <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-foreground">
                            {plan.price === 0 ? "Free" : `$${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-muted-foreground">/{plan.period}</span>
                          )}
                        </div>
                        {plan.price === 0 && (
                          <span className="text-sm text-muted-foreground">for {plan.period}</span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground text-center mb-6">
                        {plan.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={(isLoading && selectedPlan === plan.id) || isCurrentPlan}
                        className={`w-full group ${
                          isCurrentPlan
                            ? "bg-green-500 text-white cursor-default"
                            : plan.highlight
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                            : plan.id === "business"
                            ? "bg-gradient-to-r from-da-vinci via-qmetaram to-quantum-pulse text-foreground"
                            : ""
                        }`}
                        variant={plan.highlight || plan.id === "business" || isCurrentPlan ? "default" : "outline"}
                      >
                        {isLoading && selectedPlan === plan.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                          />
                        ) : isCurrentPlan ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </>
                        ) : (
                          <>
                            {plan.price === 0 ? "Start Free Trial" : "Get Started"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Payment Methods Section */}
        <section className="container-safe mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-2">
              <span className="text-gradient-primary">Payment Methods</span>
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Secure payment processing
            </p>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="stripe" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card Payment (Stripe)
                </TabsTrigger>
                <TabsTrigger value="wise" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Transfer (Wise)
                </TabsTrigger>
              </TabsList>

              {/* Stripe Payment */}
              <TabsContent value="stripe">
                <Card className="p-6 border border-primary/20">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pay with Card</h3>
                    <p className="text-muted-foreground mb-6">
                      Secure payment via Stripe - Credit/Debit cards, Apple Pay, Google Pay
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a plan above to proceed with Stripe checkout
                    </p>
                  </div>
                </Card>
              </TabsContent>

              {/* Wise Payment */}
              <TabsContent value="wise">
                <Card className="p-6 border border-primary/20">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Bank Details */}
                    <div>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#00B9FF]" />
                        Bank Transfer Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Account Holder</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{PAYMENT_INFO.wise.accountHolder}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(PAYMENT_INFO.wise.accountHolder, "Account holder")}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                          <div className="flex items-center justify-between">
                            <p className="font-mono font-medium text-sm">{PAYMENT_INFO.wise.iban}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(PAYMENT_INFO.wise.iban.replace(/\s/g, ""), "IBAN")}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Swift/BIC</p>
                          <div className="flex items-center justify-between">
                            <p className="font-mono font-medium">{PAYMENT_INFO.wise.swift}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(PAYMENT_INFO.wise.swift, "Swift/BIC")}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Bank</p>
                          <p className="text-sm">{PAYMENT_INFO.wise.bank}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Pay with Wise */}
                    <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
                      <h3 className="text-lg font-bold mb-2">Quick Pay with Wise</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Scan QR code or click the link for instant payment
                      </p>
                      
                      <a 
                        href={PAYMENT_INFO.wise.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-4 hover:opacity-90 transition-opacity"
                      >
                        <img 
                          src={wiseQrCode}
                          alt="Wise Payment QR Code"
                          className="w-40 h-40 object-contain"
                        />
                      </a>

                      <Button
                        className="bg-[#00B9FF] hover:bg-[#00A3E0] text-white"
                        onClick={() => window.open(PAYMENT_INFO.wise.paymentLink, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Pay with Wise
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </section>

        {/* Trust Badges */}
        <section className="container-safe mt-16">
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
