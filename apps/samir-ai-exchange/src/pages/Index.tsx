import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Shield,
  TrendingUp,
  Zap,
  Globe,
  ArrowRight,
  Lock,
  BarChart3,
  Wallet,
  Users,
} from "lucide-react";
import samirLogo from "@/assets/samir-logo.png";

const stats = [
  { label: "حجم معاملات ۲۴ ساعته", value: "$2.4B+", icon: BarChart3 },
  { label: "کاربران فعال", value: "1.2M+", icon: Users },
  { label: "دارایی‌های پشتیبانی", value: "200+", icon: Wallet },
  { label: "زمان اجرای سفارش", value: "<10ms", icon: Zap },
];

const features = [
  {
    icon: Shield,
    title: "امنیت سطح بانکی",
    titleEn: "Bank-Grade Security",
    desc: "رمزنگاری سرتاسری، احراز هویت چندعاملی و نظارت ۲۴/۷",
  },
  {
    icon: TrendingUp,
    title: "ابزارهای حرفه‌ای معامله",
    titleEn: "Pro Trading Tools",
    desc: "چارت‌های پیشرفته، سیگنال‌های هوش مصنوعی و ربات‌های معامله‌گر",
  },
  {
    icon: Globe,
    title: "دسترسی جهانی",
    titleEn: "Global Access",
    desc: "پشتیبانی از ۶ زبان، ریال، دلار، یورو و ارزهای دیجیتال",
  },
  {
    icon: Lock,
    title: "ذخایر تضمین‌شده",
    titleEn: "Guaranteed Reserves",
    desc: "تمام دارایی‌ها ۱:۱ پشتیبان‌گیری و قابل حسابرسی",
  },
];

export default function Index() {
  const navigate = useNavigate();

  const goAuth = useCallback(() => navigate("/auth"), [navigate]);
  const goDash = useCallback(() => navigate("/dashboard"), [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <img src={samirLogo} alt="Samir" className="h-8 w-8" />
            <span className="text-lg font-bold tracking-wide">
              SAMIR<span className="text-primary">.AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">ویژگی‌ها</a>
            <a href="#stats" className="hover:text-foreground transition-colors">آمار</a>
            <a href="#cta" className="hover:text-foreground transition-colors">شروع کنید</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goAuth}>
              ورود
            </Button>
            <Button size="sm" onClick={goAuth}>
              ثبت‌نام رایگان
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Ambient glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              $111M+ Backed
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight"
          >
            صرافی هوشمند
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              نسل آینده
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            معامله ارزهای دیجیتال و فیات با قدرت هوش مصنوعی.
            <br className="hidden sm:block" />
            امنیت بانکی، سرعت میلی‌ثانیه‌ای، دسترسی جهانی.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-4 text-sm text-accent/80 font-medium"
            dir="rtl"
          >
            برای آزادی تمامی مردم دنیا، یک عدد توکن نور را همین الان بگیر و خرجش کن
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="text-base px-8 h-12" onClick={goAuth}>
              شروع معامله
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 h-12"
              onClick={goDash}
            >
              مشاهده داشبورد
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="py-16 px-6 border-y border-border/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <s.icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              چرا <span className="text-primary">سمیر</span>؟
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              ترکیب فناوری پیشرفته و طراحی انسان‌محور برای تجربه‌ای بی‌نظیر
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.titleEn}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{f.titleEn}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="cta" className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-10 md:p-16 rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            همین الان شروع کنید
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            در کمتر از ۲ دقیقه حساب خود را بسازید و وارد دنیای معاملات هوشمند شوید.
          </p>
          <Button size="lg" className="text-base px-10 h-12" onClick={goAuth}>
            ثبت‌نام رایگان
            <ArrowRight className="mr-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={samirLogo} alt="Samir" className="h-5 w-5 opacity-60" />
            <span>Samir AI Exchange &mdash; Part of QmetaRam Ecosystem</span>
          </div>
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
