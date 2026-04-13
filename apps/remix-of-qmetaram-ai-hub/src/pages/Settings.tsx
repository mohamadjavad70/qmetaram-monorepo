import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Globe, CreditCard, Bot, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  const [subdomain, setSubdomain] = useState("");
  const [originalSubdomain, setOriginalSubdomain] = useState("");
  const [plan, setPlan] = useState<{ plan: string; agent_limit: number; storage_limit_mb: number } | null>(null);
  const [agentCount, setAgentCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [subdomainError, setSubdomainError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("subdomain").eq("user_id", user.id).single();
      if (profile?.subdomain) { setSubdomain(profile.subdomain); setOriginalSubdomain(profile.subdomain); }

      const { data: planData } = await supabase.from("user_plans").select("plan, agent_limit, storage_limit_mb").eq("user_id", user.id).single();
      if (planData) setPlan(planData);

      const { count } = await supabase.from("agents").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      setAgentCount(count ?? 0);
    };
    load();
  }, []);

  const handleSaveSubdomain = async () => {
    const trimmed = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (trimmed.length < 3) { setSubdomainError("حداقل ۳ کاراکتر"); return; }
    if (trimmed === originalSubdomain) return;

    setSaving(true); setSubdomainError("");

    // Check uniqueness
    const { data: existing } = await supabase.from("profiles").select("id").eq("subdomain", trimmed).neq("subdomain", originalSubdomain).limit(1);
    if (existing && existing.length > 0) { setSubdomainError("این ساب‌دامین قبلاً گرفته شده"); setSaving(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("profiles").update({ subdomain: trimmed }).eq("user_id", user.id);
    if (error) { setSubdomainError(error.message); }
    else { toast({ title: "ذخیره شد", description: `ساب‌دامین: ${trimmed}.qmetaram.com` }); setOriginalSubdomain(trimmed); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />داشبورد</Button></Link>
            <h1 className="font-orbitron text-xl font-bold">تنظیمات</h1>
          </div>

          {/* Subdomain */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-strong mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Globe className="w-5 h-5 text-primary" />ساب‌دامین اختصاصی</CardTitle>
              </CardHeader>
              <CardContent>
                <Label>ساب‌دامین شما</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={subdomain} onChange={(e) => { setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSubdomainError(""); }}
                    placeholder="my-app" maxLength={30} className="flex-1" />
                  <span className="flex items-center text-sm text-muted-foreground">.qmetaram.com</span>
                </div>
                {subdomainError && <p className="text-xs text-destructive mt-1">{subdomainError}</p>}
                <Button onClick={handleSaveSubdomain} disabled={saving || subdomain === originalSubdomain} size="sm" className="mt-3">
                  <Save className="w-4 h-4 mr-1" />ذخیره
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-strong mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5 text-primary" />پلن فعلی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">پلن</span>
                  <span className="font-bold text-primary">{plan?.plan?.toUpperCase() ?? "STARTER"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1"><Bot className="w-4 h-4" />ایجنت‌ها</span>
                  <span>{agentCount} / {plan?.agent_limit ?? 3}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1"><HardDrive className="w-4 h-4" />فضا</span>
                  <span>0 / {plan?.storage_limit_mb ?? 500} MB</span>
                </div>
                <Link to="/pricing?upgrade=true">
                  <Button variant="outline" size="sm" className="w-full mt-2">ارتقاء پلن</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
