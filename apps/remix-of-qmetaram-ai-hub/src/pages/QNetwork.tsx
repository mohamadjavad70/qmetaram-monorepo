import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Globe, Cpu, Music, Palette, Code, Shield, Brain, Sparkles, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

import matrixIcon from "@/assets/icons/matrix-icon.png";
import beethovenIcon from "@/assets/icons/beethoven-icon.png";
import davinciIcon from "@/assets/icons/davinci-icon.png";
import biruniIcon from "@/assets/icons/biruni-icon.png";
import teslaIcon from "@/assets/icons/tesla-icon.png";
import quantumPulseIcon from "@/assets/icons/quantum-pulse-icon.png";
import mowlanaIcon from "@/assets/icons/mowlana-icon.png";
import coreIcon from "@/assets/icons/qmetaram-core-icon.png";

const planets = [
  { name: "QMETARAM Core", subtitle: "The Sun — Command Center", icon: coreIcon, color: "from-yellow-500 to-orange-500", size: "w-28 h-28 sm:w-36 sm:h-36", path: "/core", orbitSize: "", description: "مرکز فرماندهی — ارکستراسیون تمام ماژول‌ها" },
  { name: "Matrix", subtitle: "Code Planet", icon: matrixIcon, color: "from-green-500 to-emerald-600", size: "w-16 h-16 sm:w-20 sm:h-20", path: "/matrix", orbitSize: "w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]", description: "ساخت اپلیکیشن و ایجنت" },
  { name: "Beethoven", subtitle: "Music Planet", icon: beethovenIcon, color: "from-purple-500 to-violet-600", size: "w-16 h-16 sm:w-20 sm:h-20", path: "/beethoven", orbitSize: "w-[380px] h-[380px] sm:w-[460px] sm:h-[460px]", description: "موسیقی و هنر صوتی" },
  { name: "Da Vinci", subtitle: "Art Planet", icon: davinciIcon, color: "from-amber-500 to-yellow-600", size: "w-16 h-16 sm:w-20 sm:h-20", path: "/davinci", orbitSize: "w-[480px] h-[480px] sm:w-[580px] sm:h-[580px]", description: "هنر بصری و تصویرسازی" },
  { name: "Biruni", subtitle: "Health Planet", icon: biruniIcon, color: "from-teal-500 to-cyan-600", size: "w-14 h-14 sm:w-18 sm:h-18", path: "/biruni", orbitSize: "w-[560px] h-[560px] sm:w-[680px] sm:h-[680px]", description: "طب و سلامت" },
  { name: "Tesla", subtitle: "Science Planet", icon: teslaIcon, color: "from-blue-500 to-indigo-600", size: "w-14 h-14 sm:w-18 sm:h-18", path: "/chat?module=tesla", orbitSize: "w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]", description: "ریاضیات و فیزیک" },
  { name: "Quantum Pulse", subtitle: "Medical Planet", icon: quantumPulseIcon, color: "from-cyan-400 to-blue-500", size: "w-14 h-14 sm:w-16 sm:h-16", path: "/chat?module=quantum-pulse", orbitSize: "w-[380px] h-[380px] sm:w-[460px] sm:h-[460px]", description: "تشخیص پزشکی" },
  { name: "Mowlana", subtitle: "Wisdom Planet", icon: mowlanaIcon, color: "from-rose-400 to-pink-500", size: "w-14 h-14 sm:w-16 sm:h-16", path: "/chat?module=mowlana", orbitSize: "w-[480px] h-[480px] sm:w-[580px] sm:h-[580px]", description: "معنویت و روانشناسی" },
];

const QNetwork = () => {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      {/* Star field background */}
      <div className="fixed inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        {/* Nebula glow */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        {/* Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                بازگشت
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Q-Network Galaxy
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              به کهکشان کوانتومی خوش آمدید. هر سیاره یک ماژول هوش مصنوعی تخصصی است.
            </p>
          </motion.div>
        </div>

        {/* Planets Grid */}
        <div className="container mx-auto px-4">
          {/* Sun - Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-16"
          >
            <Link to={planets[0].path} className="group">
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 40px 10px rgba(251, 191, 36, 0.3)",
                      "0 0 60px 20px rgba(251, 191, 36, 0.5)",
                      "0 0 40px 10px rgba(251, 191, 36, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`${planets[0].size} rounded-full bg-gradient-to-br ${planets[0].color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <img src={planets[0].icon} alt={planets[0].name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                </motion.div>
                <p className="text-center mt-4 font-orbitron text-yellow-400 text-sm font-bold">{planets[0].name}</p>
                <p className="text-center text-white/40 text-xs">{planets[0].subtitle}</p>
                <p className="text-center text-white/30 text-xs mt-1">{planets[0].description}</p>
              </div>
            </Link>
          </motion.div>

          {/* Orbiting Planets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {planets.slice(1).map((planet, i) => (
              <motion.div
                key={planet.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link to={planet.path} className="group block text-center">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`${planet.size} mx-auto rounded-full bg-gradient-to-br ${planet.color} flex items-center justify-center shadow-lg`}
                    style={{
                      boxShadow: `0 0 20px 5px ${planet.color.includes("green") ? "rgba(34,197,94,0.2)" : planet.color.includes("purple") ? "rgba(168,85,247,0.2)" : planet.color.includes("amber") ? "rgba(245,158,11,0.2)" : planet.color.includes("teal") ? "rgba(20,184,166,0.2)" : planet.color.includes("blue") ? "rgba(59,130,246,0.2)" : planet.color.includes("cyan") ? "rgba(34,211,238,0.2)" : "rgba(244,114,182,0.2)"}`,
                    }}
                  >
                    <img src={planet.icon} alt={planet.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                  </motion.div>
                  <p className="mt-3 font-orbitron text-xs sm:text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                    {planet.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/40">{planet.subtitle}</p>
                  <p className="text-[10px] text-white/30 mt-1">{planet.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Samer Exchange Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/nodes">
              <Button variant="outline" className="border-white/20 bg-white/5 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10">
                <Network className="w-5 h-5 mr-2" />
                نقشه نودهای مخابراتی
              </Button>
            </Link>
            <Link to="/samer">
              <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-8 py-4 rounded-xl hover:opacity-90">
                <Globe className="w-5 h-5 mr-2" />
                ایستگاه فضایی سمیر — Samer Exchange
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QNetwork;
