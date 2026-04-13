import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Zap, 
  Brain, 
  Shield, 
  Sparkles, 
  Check, 
  ChevronDown,
  Cpu,
  Network,
  BarChart3,
  Users,
  Code,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import qmetaramLogo from "@/assets/qmetaram-logo.jpg";
import { useState } from "react";

const faqData = [
  {
    question: "What is q1?",
    answer: "q1 is the core intelligence engine powering Qmetaram Core. It's a quantum-modular AI system that combines multiple specialized modules to deliver context-aware, deeply analytical responses across various domains."
  },
  {
    question: "How does q1 differ from other AI solutions?",
    answer: "Unlike traditional AI models, q1 uses a modular architecture where 8 specialized modules work independently yet cohesively. Each module self-updates and can be combined for enhanced capabilities, providing superior accuracy and domain expertise."
  },
  {
    question: "Is q1 free to use?",
    answer: "Yes, Qmetaram offers a free trial that gives you full access to q1's capabilities. Premium plans unlock additional features like unlimited conversations, priority processing, and API access."
  },
  {
    question: "What domains does q1 support?",
    answer: "q1 covers 8 specialized domains: science and philosophy, creative arts, engineering and technology, mathematics and analytics, historical wisdom, quantum computing, linguistic intelligence, and systems optimization."
  },
  {
    question: "Can I integrate q1 into my applications?",
    answer: "Yes, Qmetaram Core provides API access for developers to integrate q1's capabilities into their own applications, workflows, and products."
  }
];

export default function Q1Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Introducing q1 - The Core AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gradient-hero">q1</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl mt-4 text-foreground">
                Quantum-Modular AI Core
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The intelligent core engine powering Qmetaram. 8 specialized modules. 
              Infinite possibilities. Self-updating intelligence that evolves with you.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/chat">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl hover:opacity-90 transition-all glow-primary group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-xl border-primary/30 hover:bg-primary/10"
                >
                  Explore AI Marketplace
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>10,000+ Users</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* What is q1? Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-8 text-center">
              <span className="text-gradient-primary">What is q1?</span>
            </h2>
            
            <div className="glass rounded-2xl p-8 md:p-12">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                <strong className="text-foreground">q1</strong> is the revolutionary quantum-modular 
                artificial intelligence core that powers Qmetaram. Unlike traditional AI models that 
                operate as monolithic systems, q1 employs a unique architecture of 8 specialized 
                modules—each with its own independent thinking framework.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                These modules continuously self-update, learning from interactions and evolving 
                their capabilities in real-time. When combined through our proprietary 
                <strong className="text-primary"> Module Fusion Technology</strong>, they create 
                responses of unprecedented depth, accuracy, and contextual awareness.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you need advanced data-driven insights, creative ideation, technical 
                problem-solving, or intelligent automation—q1 delivers with the precision and 
                reliability that modern businesses demand.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How q1 Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">How q1 Works Inside Qmetaram Core</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A sophisticated architecture designed for maximum intelligence and flexibility.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Brain,
                title: "1. Modular Processing",
                description: "Your query is analyzed and routed to the most relevant specialized modules for optimal processing."
              },
              {
                icon: Network,
                title: "2. Module Fusion",
                description: "Multiple modules collaborate, combining their expertise to generate comprehensive, multi-faceted responses."
              },
              {
                icon: Sparkles,
                title: "3. Self-Evolution",
                description: "Each interaction helps modules learn and improve, ensuring increasingly accurate and relevant outputs."
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-orbitron font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Key Features & Benefits</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for intelligent automation and advanced AI capabilities.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Cpu, title: "8 Specialized Modules", description: "Domain-specific intelligence for science, arts, tech, math, history, quantum, linguistics, and systems." },
              { icon: Zap, title: "Real-Time Processing", description: "Lightning-fast responses powered by optimized quantum-inspired algorithms." },
              { icon: Network, title: "Module Fusion", description: "Combine multiple modules for comprehensive, multi-domain analysis." },
              { icon: Brain, title: "Self-Updating AI", description: "Continuously learns and improves from every interaction." },
              { icon: Shield, title: "Enterprise Security", description: "Bank-grade encryption and privacy-first architecture." },
              { icon: Code, title: "API Access", description: "Integrate q1 into your applications with our developer-friendly API." },
              { icon: BarChart3, title: "Analytics Dashboard", description: "Track usage, performance, and insights in real-time." },
              { icon: Search, title: "SEO Optimization", description: "Built-in tools for content optimization and search ranking." },
              { icon: Users, title: "Team Collaboration", description: "Share workspaces and collaborate on AI-powered projects." }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is q1 For Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Who is q1 For?</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Developers",
                description: "Build AI-powered applications with our comprehensive API. Integrate intelligent automation into your products."
              },
              {
                title: "Founders & Startups",
                description: "Scale your business with AI-driven insights, content generation, and intelligent decision support."
              },
              {
                title: "SEO Specialists",
                description: "Optimize content, analyze competitors, and generate SEO-optimized copy with AI precision."
              }
            ].map((audience, index) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-8 text-center"
              >
                <h3 className="font-orbitron font-bold text-xl mb-4 text-primary">{audience.title}</h3>
                <p className="text-muted-foreground">{audience.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">q1 vs Alternative Solutions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how q1 compares to other leading AI platforms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl overflow-hidden max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-muted/30 border-b border-border/50 font-semibold">
              <div>Feature</div>
              <div className="text-center text-primary">q1</div>
              <div className="text-center">ChatGPT</div>
              <div className="text-center">Claude</div>
            </div>
            {comparisonData.map((row, index) => (
              <div key={row.feature} className={`grid grid-cols-4 gap-4 px-6 py-4 ${index % 2 === 0 ? "" : "bg-muted/10"}`}>
                <div className="text-muted-foreground">{row.feature}</div>
                <div className="text-center">
                  {row.q1 ? <Check className="w-5 h-5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}
                </div>
                <div className="text-center">
                  {row.chatgpt ? <Check className="w-5 h-5 text-muted-foreground mx-auto" /> : <span className="text-muted-foreground">—</span>}
                </div>
                <div className="text-center">
                  {row.claude ? <Check className="w-5 h-5 text-muted-foreground mx-auto" /> : <span className="text-muted-foreground">—</span>}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Secondary CTA */}
          <div className="text-center mt-12">
            <Link to="/chat">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl hover:opacity-90 transition-all glow-primary group"
              >
                Try q1 Free Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Frequently Asked Questions</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <h3 className="font-semibold">{faq.question}</h3>
                  <ChevronDown className={`w-5 h-5 text-primary transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src={qmetaramLogo} 
              alt="Qmetaram Logo" 
              className="w-20 h-20 mx-auto mb-8 rounded-full border-4 border-primary/50"
            />
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience <span className="text-gradient-primary">q1</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers, founders, and SEO specialists who trust 
              Qmetaram Core for their AI needs.
            </p>
            <Link to="/chat">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-xl px-12 py-8 rounded-xl hover:opacity-90 transition-all glow-primary group"
              >
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever tier available
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
