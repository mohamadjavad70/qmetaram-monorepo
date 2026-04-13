import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatrixCapsules } from "@/components/MatrixCapsules";
import heroImage from "@/assets/hero-quantum-bg.jpg";
import qmetaramLogo from "@/assets/qmetaram-logo.jpg";

export function HeroSection() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background Image with lazy loading */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
        role="img"
        aria-label="Quantum AI background visualization"
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-0" />
      <div className="absolute inset-0 bg-radial-glow pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <header className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/50 shadow-2xl">
              <img 
                src={qmetaramLogo} 
                alt="Qmetaram - Quantum AI Platform" 
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <figcaption className="sr-only">QmetaRam AI Platform Logo</figcaption>
          </motion.figure>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-sm text-primary font-medium">QmetaRam 1.1 | Quantum Modular AI</span>
          </motion.div>

          {/* Main heading - SEO optimized for "QmetaRam" */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-orbitron text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="text-gradient-hero">QmetaRam</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4 font-light"
          >
            8 Specialized AI Modules. Infinite Possibilities.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base md:text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto"
          >
            A decentralized quantum-modular artificial intelligence with independent thinking frameworks 
            that continuously self-update. Experience the future of AI.
          </motion.p>

          {/* Matrix Capsules - The Choice */}
          <MatrixCapsules />

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { value: "8", label: "AI Modules", icon: Sparkles },
              { value: "∞", label: "Fusion Combinations", icon: Zap },
              { value: "99.9%", label: "Uptime", icon: Shield },
              { value: "24/7", label: "Self-Updating", icon: Sparkles },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-orbitron font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </header>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
