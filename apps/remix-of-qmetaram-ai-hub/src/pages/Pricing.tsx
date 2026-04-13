import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, Zap, Crown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 1,
    icon: Zap,
    color: "from-green-400 to-emerald-500",
    borderColor: "border-green-500/30",
    glowColor: "shadow-green-500/20",
    features: ["۱ ایجنت هوشمند", "۱ گیگابایت فضا", "۱ ساب‌دامین", "دسترسی به ماژول‌های پایه", "پشتیبانی ایمیل"],
    badge: "رایگان برای تست",
  },
  {
    id: "pro",
    name: "PRO",
    price: 5,
    icon: Crown,
    color: "from-primary to-accent",
    borderColor: "border-primary/50",
    glowColor: "shadow-primary/30",
    features: ["۳ ایجنت هوشمند", "۵ گیگابایت فضا", "۱ ساب‌دامین", "دسترسی به همه ماژول‌ها", "Fusion Mode", "پشتیبانی اولویت‌دار"],
    badge: "پیشنهادی",
    recommended: true,
  },
  {
    id: "business",
    name: "Business",
    price: 19,
    icon: Building,
    color: "from-secondary to-purple-600",
    borderColor: "border-secondary/50",
    glowColor: "shadow-secondary/30",
    features: ["۱۰ ایجنت هوشمند", "۲۰ گیگابایت فضا", "۳ ساب‌دامین", "همه قابلیت‌های PRO", "API اختصاصی", "پشتیبانی ۲۴/۷"],
    badge: "سازمانی",
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUpgrade = searchParams.get("upgrade") === "true";

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="font-orbitron text-responsive-2xl font-bold mb-4">
              <span className="text-gradient-primary">
                {isUpgrade ? "ارتقاء پلن" : "قیمت‌گذاری"}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              پلن مناسب خود را انتخاب کنید و قدرت هوش مصنوعی کوانتومی را تجربه کنید
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={plan.recommended ? "md:-mt-4 md:mb-4" : ""}
              >
                <Card className={`glass-strong p-6 relative overflow-hidden ${plan.borderColor} hover:shadow-lg ${plan.glowColor} transition-all duration-300 h-full flex flex-col`}>
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-accent text-primary-foreground text-xs px-4 py-1 rounded-bl-lg font-bold">
                      پیشنهادی ⭐
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <plan.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <span className="text-xs px-3 py-1 rounded-full glass border border-border/50 text-muted-foreground">
                      {plan.badge}
                    </span>
                    <h2 className="font-orbitron text-2xl font-bold mt-3">{plan.name}</h2>
                    <div className="mt-2">
                      <span className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/ماه</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate(`/samer?plan=${plan.id}`)}
                    className={`w-full bg-gradient-to-r ${plan.color} text-primary-foreground font-bold`}
                    size="lg"
                  >
                    شروع کن
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
