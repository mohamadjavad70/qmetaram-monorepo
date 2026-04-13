import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Globe, Shield, Sparkles } from "lucide-react";

const groups = [
  {
    title: "هسته توسعه و AI Engineering",
    body: "طراحی محصول، ساخت ماژول ها، orchestration مدل ها، ایجنت ها و تجربه های تعاملی Qmetaram.",
  },
  {
    title: "امنیت، رمزنگاری و کنترل دسترسی",
    body: "تعیین مرزهای دسترسی، طراحی لایه های امن و حفاظت از داده، نشست و ارتباطات شبکه.",
  },
  {
    title: "زیرساخت، نود و مخابرات",
    body: "توسعه مسیرهای ارتباطی، توپولوژی نودها، کیفیت اتصال و آماده سازی Q-Network برای رشد جهانی.",
  },
  {
    title: "عملیات، رشد و بازارهای جهانی",
    body: "هماهنگی بین تیم ها، توسعه بازار، اولویت بندی کشورها و تبدیل فناوری به سرویس واقعی برای کاربران.",
  },
];

export default function Team() {
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
            Global Expert Team
          </Badge>
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-gradient-hero">
            تیم ۱۲۰ نفره خبرگان جهان
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            Qmetaram حاصل یک تیم چندرشته ای است که از خبرگان حوزه های هوش مصنوعی، شبکه، زیرساخت، امنیت و عملیات جهانی تشکیل شده و با یک هدف واحد کار می کند: ساخت اکوسیستم Q در مقیاس واقعی.
          </p>
        </motion.header>

        <section className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">هسته رهبری</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
                <div className="flex items-center gap-3 mb-3 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">سام آرمان</h2>
                </div>
                <p className="text-muted-foreground leading-8">
                  بنیان گذار Qmetaram و معمار شبکه Q؛ با تمرکز بر هوش مصنوعی، بهینه سازی سیستم، معماری ماژولار و طراحی زیرساخت خصوصی برای نسل بعدی ایجنت ها و دستگاه های متصل.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4 text-center">
                  <div className="font-orbitron text-3xl text-primary mb-1">120</div>
                  <div className="text-sm text-muted-foreground">Expert Contributors</div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4 text-center">
                  <div className="font-orbitron text-3xl text-primary mb-1">Global</div>
                  <div className="text-sm text-muted-foreground">Cross-border Collaboration</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {groups.map((group, index) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full glass border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-8">{group.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Cpu className="w-5 h-5" />
                <CardTitle className="text-xl">فناوری عمیق</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                تمرکز تیم بر ساخت فناوری قابل اجرا است؛ نه فقط ایده های نمایشی. هر ماژول باید به یک خروجی واقعی در محصول یا زیرساخت ختم شود.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Shield className="w-5 h-5" />
                <CardTitle className="text-xl">قابلیت اتکا</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                امنیت، دسترس پذیری و کنترل دسترسی از پایه های اصلی تیم است تا Qmetaram فقط زیبا نباشد، بلکه قابل اعتماد هم بماند.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Globe className="w-5 h-5" />
                <CardTitle className="text-xl">هماهنگی جهانی</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-8">
                توزیع جغرافیایی تیم، Qmetaram را از ابتدا برای بازار و زیرساخت بین المللی آماده کرده است؛ از زبان و محتوا تا عملیات و نود.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}