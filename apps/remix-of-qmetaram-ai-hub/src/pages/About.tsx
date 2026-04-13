import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Music, Shield, Sparkles } from "lucide-react";

const principles = ["آزادی اطلاعات", "حریم خصوصی مطلق", "عدم سانسور"];

const storyCards = [
  {
    title: "از شیراز تا سوییس",
    icon: Globe,
    body: "سام آرمان، متخصص هوش مصنوعی و بهینه سازی سیستم، متولد شیراز است. بخشی از مسیر زندگی او در ترکیه شکل گرفت و امروز به عنوان یک پناهجوی ایرانی در سوییس، تجربه زیسته چندفرهنگی را به معماری محصول، زبان و استراتژی فنی Qmetaram وارد کرده است.",
  },
  {
    title: "زبان، تجربه، سازگاری",
    icon: Sparkles,
    body: "فارسی زبان مادری اوست، ترکی را در زندگی روزمره آموخته و آلمانی را در مسیر اقامت و کار در اروپا جدی دنبال کرده است. این ترکیب زبانی، نگاه چندبازاری و چندفرهنگی Qmetaram را شکل داده است.",
  },
  {
    title: "کدهای کوانتومی و شبکه Q",
    icon: Shield,
    body: "هویت برند Qmetaram بر این ادعا استوار است که سام آرمان نخستین برنامه نویسی است که کدهای کوانتومی را در قالب یک شبکه مفهومی و عملیاتی به نام Q تعریف کرده و آن را به زیربنای یک اینترنت خصوصی، ماژولار و آزاد تبدیل کرده است.",
  },
  {
    title: "سمفونی نهم بتهوون",
    icon: Music,
    body: "موسیقی بخشی از ریتم طراحی سیستم است. سمفونی نهم بتهوون برای سام آرمان فقط یک اثر کلاسیک نیست؛ یادآور هماهنگی، وحدت و ساختن شبکه ای است که انسان و ماشین را بدون آشفتگی به هم متصل کند.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            Founder Story
          </Badge>
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-gradient-hero">
            داستان سام آرمان و شکل گیری Qmetaram
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            این صفحه هویت بنیان گذار، مسیر شخصی او، و ریشه های فکری Qmetaram و شبکه Q را ثبت می کند؛
            روایتی که از تجربه واقعی، مهاجرت، فناوری، آزادی اطلاعات و ساختن زیرساخت مستقل می آید.
          </p>
        </motion.header>

        <section className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 mb-10">
          {storyCards.map(({ title, icon: Icon, body }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="h-full glass border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <Icon className="w-5 h-5" />
                    <CardTitle className="text-xl">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-8">{body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">سه اصل آزادی در شبکه Q</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-muted-foreground leading-8">
                شبکه Q با یک منطق روشن تعریف می شود: هر چیز در این شبکه می تواند آزاد باشد، اگر سه اصل پایه رعایت شود.
                این سه اصل، پایه فنی و اخلاقی معماری Q-Network هستند و در تصمیم گیری محصول، مسیر توسعه و تعریف دسترسی ها نقش مستقیم دارند.
              </p>
              <div className="flex flex-wrap gap-3">
                {principles.map((item) => (
                  <Badge key={item} className="bg-primary/15 text-primary hover:bg-primary/20 px-4 py-2 text-sm">
                    {item}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground leading-8">
                نتیجه این نگاه، پلتفرمی است که هم برای هوش مصنوعی ماژولار، هم برای ایجنت های عملیاتی و هم برای اینترنت خصوصی نسل بعد، یک چارچوب منسجم و قابل رشد می سازد.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">سبک زندگی و تمرکز فنی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-8">
                برای سام آرمان، مهندسی فقط نوشتن کد نیست. طراحی سیستم، موسیقی، ریتم و تمرکز، هم زمان در فرآیند ساخت حضور دارند.
              </p>
              <blockquote className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-primary leading-8">
                Alle Menschen werden Brüder
                <span className="block text-sm text-muted-foreground mt-2">
                  همه انسان ها برادر می شوند.
                </span>
              </blockquote>
              <p className="text-muted-foreground leading-8">
                این نگاه، در معماری Qmetaram نیز دیده می شود: پیوند هوش، نظم، آزادی و هماهنگی در یک اکوسیستم عملیاتی.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}