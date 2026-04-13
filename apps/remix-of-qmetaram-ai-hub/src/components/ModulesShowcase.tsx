import { motion } from "framer-motion";
import { modules } from "@/data/modules";
import { ModuleCard } from "./ModuleCard";

export function ModulesShowcase() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Specialized Intelligence
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">8 Quantum Modules</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each module operates with an independent thinking framework, 
            continuously self-updating to deliver cutting-edge AI capabilities in its domain.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>

        {/* Fusion Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto border border-primary/20">
            <h3 className="font-orbitron text-xl font-bold text-primary mb-3">
              Module Fusion Technology
            </h3>
            <p className="text-muted-foreground mb-6">
              Combine multiple modules to create powerful AI responses that leverage 
              the specialized knowledge of different domains simultaneously.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {modules.slice(0, 4).map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                    border: `1px solid ${module.color}40`,
                  }}
                >
                  <module.icon className="w-6 h-6" style={{ color: module.color }} />
                </motion.div>
              ))}
              <span className="text-primary font-orbitron text-2xl">+</span>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40 animate-pulse">
                <span className="text-lg">🔮</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
