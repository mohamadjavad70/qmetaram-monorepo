import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Coffee, CreditCard, Network, Shield, Sparkles } from "lucide-react";

const layers = [
  {
    title: "لایه عمومی",
    body: "برای اطلاعات و سرویس هایی که باید بدون اصطکاک و بدون احراز هویت پیچیده در دسترس باشند.",
  },
  {
    title: "لایه شخصی",
    body: "برای داده هایی که فقط با هویت و کلید اختصاصی کاربر باید قابل دسترسی باشند.",
  },
  {
    title: "لایه بانکی",
    body: "برای ایجنت های مالی که فقط به حساب بانکی متصل هستند و به کل شبکه دسترسی ندارند.",
  },
  {
    title: "لایه صنعتی",
    body: "برای سازمان ها، کارخانه ها و زیرساخت هایی که به اتوماسیون کنترل شده و رده بندی شده نیاز دارند.",
  },
];

export default function Vision() {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-16 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            Q-Network Vision
          </Badge>
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-gradient-hero">
            Q-Network: اینترنت خصوصی نسل آینده
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            چشم انداز Q-Network این است که هوشمند سازی اشیا، ایجنت های تخصصی و زیرساخت ارتباطی خصوصی را در یک معماری طبقه بندی شده و امن کنار هم قرار دهد.
          </p>
        </motion.header>

        <section className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
          <Card className="glass border-primary/20 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Network className="w-5 h-5" />
                <CardTitle className="text-2xl">اینترنت خصوصی برای دنیای متصل</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-8">
                هدف Q-Network ساختن لایه ای است که کاربران، ایجنت ها، سرویس های مالی و دستگاه های هوشمند بتوانند بدون وابستگی کامل به اینترنت عمومی و بدون آشفتگی دسترسی، با هم کار کنند.
              </p>
              <p className="text-muted-foreground leading-8">
                این شبکه به جای یک دسترسی بی ساختار، روی طبقه بندی، مرزبندی و نقش های دقیق بنا می شود؛ یعنی هر سرویس فقط همان بخشی از شبکه را می بیند که برای انجام کار لازم است.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Sparkles className="w-5 h-5" />
                <CardTitle className="text-2xl">جهت توسعه</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-8">
              <p>تمرکز راهبردی، دسترسی پایدار و باکیفیت برای بازارهای رو به رشد است.</p>
              <p>کشورهای آفریقایی بخشی از اولویت های توسعه زیرساخت Q-Network هستند.</p>
              <p>هدف، سرعت، استقلال و هماهنگی بهتر در اکوسیستم های کم دسترس و پرنیاز است.</p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Coffee className="w-5 h-5" />
                <CardTitle className="text-xl">هوشمند سازی اشیا</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                وقتی در ماشین می گویید ده دقیقه دیگر می رسم، Q-Network می تواند پیام را به قهوه ساز، نور خانه یا هر دستگاه متصل منتقل کند.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-xl">ایجنت تخصصی</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                Q-Agent فقط نقش خود را انجام می دهد؛ اگر برای پرداخت ساخته شده باشد، قرار نیست به تمام شبکه، داده ها و جریان های دیگر دسترسی داشته باشد.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <CreditCard className="w-5 h-5" />
                <CardTitle className="text-xl">ایجنت بانکی مستقل</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                ایجنت مالی می تواند فقط به حساب بانکی شما متصل باشد تا سفارش، پرداخت و تایید را انجام دهد، بدون اینکه کل شبکه Q را درگیر کند.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Shield className="w-5 h-5" />
                <CardTitle className="text-xl">مرزبندی و امنیت</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                ساختار شبکه با لایه های جداگانه طراحی می شود تا حریم خصوصی، سرعت پاسخ و کنترل دسترسی برای هر سناریو قابل مدیریت بماند.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-6xl mx-auto">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">معماری طبقه بندی شده Q-Network</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {layers.map((layer) => (
                <div key={layer.title} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <h3 className="font-semibold text-foreground mb-2">{layer.title}</h3>
                  <p className="text-sm text-muted-foreground leading-7">{layer.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}