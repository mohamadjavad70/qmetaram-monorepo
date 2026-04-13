import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ExternalLink, Coins, TrendingUp, Shield, Wallet, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const planNames: Record<string, string> = {
  starter: "Starter — ۱ دلار/ماه",
  pro: "PRO — ۵ دلار/ماه",
  business: "Business — ۱۹ دلار/ماه",
};

const SamerExchange = () => {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleActivate = async () => {
    if (!planParam || !["starter", "pro", "business"].includes(planParam)) return;

    setActivating(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      // Simulate payment gateway delay
      await new Promise((r) => setTimeout(r, 2000));

      const { data, error } = await supabase.functions.invoke("activate-plan", {
        body: { user_id: user.id, plan: planParam },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult("success");
      toast({ title: "پلن فعال شد!", description: `پلن ${planParam.toUpperCase()} با موفقیت فعال شد.` });
    } catch (err) {
      setResult("error");
      toast({ title: "خطا", description: err instanceof Error ? err.message : "خطا در فعال‌سازی پلن", variant: "destructive" });
    } finally {
      setActivating(false);
    }
  };

  // If plan param exists, show activation flow
  if (planParam && ["starter", "pro", "business"].includes(planParam)) {
    return (
      <div className="min-h-screen bg-background relative">
        <Navbar />
        <main className="relative z-10 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-md">
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="mb-6"><ArrowLeft className="w-4 h-4 mr-2" />بازگشت به قیمت‌گذاری</Button>
            </Link>

            <Card className="glass-strong p-8 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="font-orbitron text-xl font-bold mb-2">صرافی سمیر</h2>
              <p className="text-muted-foreground mb-6">فعال‌سازی پلن {planNames[planParam] ?? planParam}</p>

              {!result && !activating && (
                <Button onClick={handleActivate} size="lg" className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-foreground font-bold">
                  اتصال به درگاه و فعال‌سازی
                </Button>
              )}

              {activating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">در حال اتصال به درگاه پرداخت...</p>
                </motion.div>
              )}

              {result === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <p className="font-bold text-green-500">پلن با موفقیت فعال شد!</p>
                  <Button onClick={() => navigate("/dashboard")} className="mt-2">رفتن به داشبورد</Button>
                </motion.div>
              )}

              {result === "error" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
                  <XCircle className="w-12 h-12 text-destructive" />
                  <p className="text-destructive font-bold">خطا در فعال‌سازی</p>
                  <Button onClick={() => setResult(null)} variant="outline" className="mt-2">تلاش مجدد</Button>
                </motion.div>
              )}
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Default Samer Exchange page (no plan param)
  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />بازگشت به کیومتارم</Button></Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 mb-6">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500 font-medium">Samer Exchange — Part of QMETARAM Ecosystem</span>
            </div>
            <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">Samer Exchange</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">صرافی هوشمند سمیر — ترید ارزهای دیجیتال با پشتیبانی هوش مصنوعی کیومتارم</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[
              { icon: TrendingUp, title: "ترید هوشمند", desc: "تحلیل بازار با هوش مصنوعی", color: "text-green-400" },
              { icon: Shield, title: "امنیت کوانتومی", desc: "رمزنگاری پیشرفته تراکنش‌ها", color: "text-blue-400" },
              { icon: Wallet, title: "کیف پول یکپارچه", desc: "مدیریت دارایی‌ها در یک محل", color: "text-purple-400" },
              { icon: Coins, title: "ارزهای متنوع", desc: "پشتیبانی از صدها ارز دیجیتال", color: "text-yellow-400" },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <Card className="glass border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="pb-2">
                    <feature.icon className={`w-8 h-8 ${feature.color} mb-2`} />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{feature.desc}</p></CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center space-y-4">
            <a href="https://samer-exchange.lovable.app" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-amber-600 text-foreground font-bold px-8 py-6 rounded-xl hover:opacity-90">
                <ExternalLink className="w-5 h-5 mr-2" />ورود به صرافی سمیر
              </Button>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-3">تحلیل هوشمند بازار با هوش مصنوعی کیومتارم</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/core"><Button variant="outline" size="sm" className="border-primary/20">🧠 QMETARAM Core</Button></Link>
              <Link to="/matrix"><Button variant="outline" size="sm" className="border-primary/20">💻 Matrix Studio</Button></Link>
              <Link to="/q-network"><Button variant="outline" size="sm" className="border-primary/20">🌌 Q-Network Galaxy</Button></Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SamerExchange;
