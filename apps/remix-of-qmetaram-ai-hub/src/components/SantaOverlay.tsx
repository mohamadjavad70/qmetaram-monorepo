import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";

/**
 * 🎅 Santa Christmas Overlay - Festive animation for QmetaRam
 * Non-intrusive floating Santa with festive greeting
 * Easily removable after holiday period
 */
export function SantaOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("santa-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("santa-dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 sm:bottom-8 sm:right-8"
        >
          <div className="relative">
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
              aria-label="Dismiss holiday greeting"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Santa Container */}
            <motion.div
              className="glass border border-primary/30 rounded-2xl p-4 max-w-[280px] sm:max-w-xs shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              {/* Santa Animation */}
              <div className="flex items-start gap-3">
                {/* Animated Santa */}
                <motion.div
                  className="text-5xl select-none"
                  animate={{
                    rotate: [0, -5, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  🎅
                </motion.div>

                <div className="flex-1">
                  {/* Greeting */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-orbitron text-sm font-bold text-primary mb-1">
                      Merry Christmas! 🎄
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A festive gift from{" "}
                      <span className="text-primary font-semibold">QmetaRam</span>
                    </p>
                  </motion.div>

                  {/* Snowflakes decoration */}
                  <div className="flex gap-1 mt-2 text-xs opacity-60">
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    >
                      ❄️
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    >
                      ⭐
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    >
                      🎁
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
                    >
                      🌟
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Gift indicator */}
              <motion.div
                className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Gift className="w-3 h-3 text-primary" />
                <span>Happy New Year 2025! 🎉</span>
              </motion.div>
            </motion.div>

            {/* Floating snowflakes background effect */}
            <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white/20 text-lg"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `-10%`,
                  }}
                  animate={{
                    y: [0, 150],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "linear",
                  }}
                >
                  ❄
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
