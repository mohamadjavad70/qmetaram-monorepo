import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Network, Shield, Sparkles } from "lucide-react";

const nodeMap = [
  { label: "Zurich", status: "Coordination", top: "30%", left: "48%" },
  { label: "Istanbul", status: "Routing", top: "36%", left: "57%" },
  { label: "Shiraz", status: "Origin", top: "42%", left: "63%" },
  { label: "Frankfurt", status: "Backbone", top: "28%", left: "44%" },
  { label: "Nairobi", status: "Expansion", top: "56%", left: "56%" },
  { label: "Cape Town", status: "Expansion", top: "78%", left: "55%" },
  { label: "Lagos", status: "Expansion", top: "52%", left: "47%" },
  { label: "Singapore", status: "Relay", top: "56%", left: "75%" },
];

const regions = [
  {
    title: "اروپا",
    body: "لایه هماهنگی، پایداری و مدیریت مسیرها با تمرکز بر کیفیت سرویس، کنترل دسترسی و عملیات بین منطقه ای.",
  },
  {
    title: "ترکیه و غرب آسیا",
    body: "کریدورهای اتصال و پل ارتباطی میان تجربه های کاربری، بازار منطقه و ریشه های عملیاتی شبکه Q.",
  },
  {
    title: "آفریقا",
    body: "اولویت توسعه برای ساخت اتصال پایدار، سریع و مقرون به صرفه در مناطقی که زیرساخت قابل اتکا مزیت رقابتی واقعی ایجاد می کند.",
  },
  {
    title: "نودهای جهانی",
    body: "Q-Network روی معماری توزیع شده کار می کند تا مسیرهای توسعه و relay points بتوانند در مقیاس جهانی گسترش یابند.",
  },
];

export default function Nodes() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(249,115,22,0.1),_transparent_40%)]" />
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-16 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge variant="outline" className="mb-4 border-cyan-400/40 text-cyan-300">
            Node Topology
          </Badge>
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-sky-300 to-orange-300 bg-clip-text text-transparent">
            نقشه نودهای مخابراتی Q-Network
          </h1>
          <p className="text-lg text-white/70 leading-8">
            این صفحه نمایی از توپولوژی عملیاتی و مسیرهای توسعه Q-Network را نشان می دهد؛ از نقطه های هماهنگی و relay تا کریدورهای رشد در بازارهای آفریقا و فراتر از آن.
          </p>
        </motion.header>

        <section className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3 text-cyan-300 mb-2">
                <Network className="w-5 h-5" />
                <CardTitle className="text-2xl text-white">Network Topology Board</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-[420px] rounded-3xl border border-white/10 bg-slate-950/60 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
                {nodeMap.map((node, index) => (
                  <motion.div
                    key={node.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: node.top, left: node.left }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl" />
                      <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-cyan-300 shadow-[0_0_0_6px_rgba(34,211,238,0.12)]" />
                    </div>
                    <div className="mt-3 min-w-[110px] rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-center backdrop-blur">
                      <div className="text-sm font-semibold text-white">{node.label}</div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">{node.status}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3 text-orange-300 mb-2">
                <Sparkles className="w-5 h-5" />
                <CardTitle className="text-2xl text-white">Operational Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-white/70 leading-8">
              <p>
                این نقشه، منطق توزیع و جهت حرکت شبکه را نمایش می دهد؛ نه انتشار داده های حساس عملیاتی. هدف، نشان دادن ساختار، تمرکز مناطق و آمادگی اکوسیستم برای رشد است.
              </p>
              <p>
                Q-Network می خواهد زیرساختی بسازد که برای ایجنت ها، دستگاه های هوشمند، سرویس های پرداخت و عملیات طبقه بندی شده، مسیرهای امن و کم اصطکاک فراهم کند.
              </p>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <div className="flex items-center gap-2 text-cyan-300 font-medium mb-2">
                  <Shield className="w-4 h-4" />
                  Privacy by design
                </div>
                <p className="text-sm text-white/65 leading-7">
                  اطلاعات عمومی شبکه نمایش داده می شوند، اما جزئیات فنی حساس، مسیرهای داخلی و داده های عملیاتی خصوصی در این صفحه افشا نمی شوند.
                </p>
              </div>
              <Link to="/vision">
                <Button className="w-full bg-gradient-to-r from-cyan-400 to-orange-400 text-slate-950 font-semibold hover:opacity-90">
                  ادامه در صفحه Vision
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {regions.map((region) => (
            <Card key={region.title} className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3 text-cyan-300 mb-2">
                  <Globe className="w-5 h-5" />
                  <CardTitle className="text-xl text-white">{region.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-8">{region.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}