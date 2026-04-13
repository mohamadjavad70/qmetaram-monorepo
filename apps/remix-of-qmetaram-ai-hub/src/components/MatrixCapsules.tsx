import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function MatrixCapsules() {
  const navigate = useNavigate();
  const [hoveredCapsule, setHoveredCapsule] = useState<"blue" | "red" | null>(null);

  return (
    <div className="relative py-16">
      {/* Matrix Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-center mb-12"
      >
        <p className="font-mono text-sm md:text-base text-muted-foreground/70 italic max-w-2xl mx-auto leading-relaxed">
          "You take the <span className="text-blue-400 font-semibold">blue pill</span>, the story ends, you wake up and believe whatever you want to believe.{" "}
          You take the <span className="text-red-400 font-semibold">red pill</span>, you stay in Wonderland, and I show you how deep the rabbit hole goes."
        </p>
        <p className="text-xs text-muted-foreground/40 mt-2 font-mono">— Morpheus</p>
      </motion.div>

      {/* Capsules Container */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {/* Blue Capsule - QMETARAM Modules */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          onHoverStart={() => setHoveredCapsule("blue")}
          onHoverEnd={() => setHoveredCapsule(null)}
          onClick={() => navigate("/chat")}
          className="group relative cursor-pointer focus:outline-none"
          aria-label="Enter QMETARAM AI modules"
        >
          {/* Outer glow */}
          <motion.div
            animate={{
              boxShadow: hoveredCapsule === "blue"
                ? "0 0 60px 20px rgba(59, 130, 246, 0.4), 0 0 120px 40px rgba(59, 130, 246, 0.15)"
                : "0 0 30px 10px rgba(59, 130, 246, 0.2), 0 0 60px 20px rgba(59, 130, 246, 0.05)",
              scale: hoveredCapsule === "blue" ? 1.1 : 1,
              rotateY: hoveredCapsule === "blue" ? 15 : 0,
            }}
            transition={{ duration: 0.4 }}
            className="w-28 h-44 sm:w-32 sm:h-52 rounded-full relative overflow-hidden"
            style={{ perspective: "800px" }}
          >
            {/* Glass capsule */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-400/20 via-blue-500/10 to-blue-600/20 backdrop-blur-sm border border-blue-400/30" />
            
            {/* Inner neurons */}
            <div className="absolute inset-2 rounded-full overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/80"
                  animate={{
                    x: [
                      Math.random() * 80 + 10,
                      Math.random() * 80 + 10,
                      Math.random() * 80 + 10,
                    ],
                    y: [
                      Math.random() * 160 + 10,
                      Math.random() * 160 + 10,
                      Math.random() * 160 + 10,
                    ],
                    opacity: [0.3, 0.9, 0.3],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
              {/* Neural connections */}
              <svg className="absolute inset-0 w-full h-full opacity-30">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.line
                    key={i}
                    x1={`${20 + Math.random() * 60}%`}
                    y1={`${10 + Math.random() * 80}%`}
                    x2={`${20 + Math.random() * 60}%`}
                    y2={`${10 + Math.random() * 80}%`}
                    stroke="rgba(96, 165, 250, 0.6)"
                    strokeWidth="0.5"
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </svg>
            </div>

            {/* Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </motion.div>

          {/* Label */}
          <motion.p
            animate={{ opacity: hoveredCapsule === "blue" ? 1 : 0.6 }}
            className="text-center mt-4 text-sm font-mono text-blue-400"
          >
            {hoveredCapsule === "blue" ? "Enter the Known World" : "Blue Pill"}
          </motion.p>
        </motion.button>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="text-2xl font-mono text-muted-foreground/30 hidden sm:block"
        >
          ⟐
        </motion.div>

        {/* Red Capsule - Galaxy Q-Network */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          onHoverStart={() => setHoveredCapsule("red")}
          onHoverEnd={() => setHoveredCapsule(null)}
          onClick={() => navigate("/q-network")}
          className="group relative cursor-pointer focus:outline-none"
          aria-label="Enter Q-Network Galaxy"
        >
          {/* Outer glow */}
          <motion.div
            animate={{
              boxShadow: hoveredCapsule === "red"
                ? "0 0 60px 20px rgba(239, 68, 68, 0.4), 0 0 120px 40px rgba(239, 68, 68, 0.15)"
                : "0 0 30px 10px rgba(239, 68, 68, 0.2), 0 0 60px 20px rgba(239, 68, 68, 0.05)",
              scale: hoveredCapsule === "red" ? 1.1 : 1,
              rotateY: hoveredCapsule === "red" ? -15 : 0,
            }}
            transition={{ duration: 0.4 }}
            className="w-28 h-44 sm:w-32 sm:h-52 rounded-full relative overflow-hidden"
            style={{ perspective: "800px" }}
          >
            {/* Glass capsule */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-400/20 via-red-500/10 to-red-600/20 backdrop-blur-sm border border-red-400/30" />
            
            {/* Inner neurons */}
            <div className="absolute inset-2 rounded-full overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-red-400/80"
                  animate={{
                    x: [
                      Math.random() * 80 + 10,
                      Math.random() * 80 + 10,
                      Math.random() * 80 + 10,
                    ],
                    y: [
                      Math.random() * 160 + 10,
                      Math.random() * 160 + 10,
                      Math.random() * 160 + 10,
                    ],
                    opacity: [0.3, 0.9, 0.3],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
              <svg className="absolute inset-0 w-full h-full opacity-30">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.line
                    key={i}
                    x1={`${20 + Math.random() * 60}%`}
                    y1={`${10 + Math.random() * 80}%`}
                    x2={`${20 + Math.random() * 60}%`}
                    y2={`${10 + Math.random() * 80}%`}
                    stroke="rgba(248, 113, 113, 0.6)"
                    strokeWidth="0.5"
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </svg>
            </div>

            {/* Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </motion.div>

          {/* Label */}
          <motion.p
            animate={{ opacity: hoveredCapsule === "red" ? 1 : 0.6 }}
            className="text-center mt-4 text-sm font-mono text-red-400"
          >
            {hoveredCapsule === "red" ? "How deep the rabbit hole goes..." : "Red Pill"}
          </motion.p>
        </motion.button>
      </div>
    </div>
  );
}
