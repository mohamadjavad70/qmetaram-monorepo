import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Module } from "@/data/modules";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
  module: Module;
  index: number;
}

export function ModuleCard({ module, index }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link to={`/modules/${module.id}`}>
        <div
          className={`relative glass rounded-xl p-6 h-full overflow-hidden transition-all duration-500 border border-transparent hover:border-${module.colorClass}/50`}
          style={{
            boxShadow: `0 0 0 1px ${module.color}20`,
          }}
        >
          {/* Glow effect on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${module.color}, transparent 70%)`,
            }}
          />

          {/* Icon Image */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
              border: `1px solid ${module.color}40`,
            }}
          >
            <img 
              src={module.iconImage} 
              alt={module.name} 
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className="font-orbitron font-bold text-lg"
                style={{ color: module.color }}
              >
                {module.name}
              </h3>
              <span className="text-xs text-muted-foreground">
                {module.namePersian}
              </span>
            </div>

            <p className="text-sm text-primary/80 font-medium mb-3">
              {module.specialty}
            </p>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {module.description}
            </p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1 mb-4">
              {module.capabilities.slice(0, 3).map((cap) => (
                <span
                  key={cap}
                  className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                >
                  {cap}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div
              className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: module.color }}
            >
              <span>Explore Module</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
