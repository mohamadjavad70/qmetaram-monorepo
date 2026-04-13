import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Settings, CreditCard, Plus, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [agentCount, setAgentCount] = useState(0);
  const [plan, setPlan] = useState<{ plan: string; agent_limit: number; storage_limit_mb: number } | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      if (profile) setDisplayName(profile.display_name ?? "");

      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan, agent_limit, storage_limit_mb")
        .eq("user_id", user.id)
        .single();
      if (planData) setPlan(planData);

      const { count } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setAgentCount(count ?? 0);
    };
    load();
  }, []);

  const stats = [
    { label: "ایجنت‌ها", value: `${agentCount}/${plan?.agent_limit ?? 3}`, icon: Bot, link: "/dashboard/agents" },
    { label: "فضای مصرفی", value: `0 / ${plan?.storage_limit_mb ?? 500} MB`, icon: BarChart3 },
    { label: "پلن فعلی", value: plan?.plan?.toUpperCase() ?? "STARTER", icon: CreditCard, link: "/pricing" },
    { label: "تنظیمات", value: "مشاهده", icon: Settings, link: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-orbitron text-responsive-xl font-bold">
              سلام، <span className="text-gradient-primary">{displayName || "کاربر"}</span>
            </h1>
            <p className="text-muted-foreground mt-2">خوش آمدید به داشبورد QMETARAM</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-strong hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                    <s.icon className="w-5 h-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{s.value}</p>
                    {s.link && (
                      <Link to={s.link}>
                        <Button variant="link" size="sm" className="px-0 mt-1 text-primary">مشاهده →</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="font-orbitron text-xl font-bold mb-4">دسترسی سریع</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/dashboard/agents">
                <Card className="glass p-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Plus className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-bold">مدیریت ایجنت‌ها</p>
                      <p className="text-xs text-muted-foreground">ساخت و ویرایش ایجنت‌ها</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/modules/biruni/chat">
                <Card className="glass p-4 hover:border-biruni/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔭</span>
                    <div>
                      <p className="font-bold">بیرونی</p>
                      <p className="text-xs text-muted-foreground">ترمینال هوشمند</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/modules/beethoven/chat">
                <Card className="glass p-4 hover:border-beethoven/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="font-bold">بتهوون</p>
                      <p className="text-xs text-muted-foreground">استودیو موسیقی</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
