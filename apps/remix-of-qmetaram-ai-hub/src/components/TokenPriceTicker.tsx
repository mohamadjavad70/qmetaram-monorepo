import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Coins } from "lucide-react";
import { getApiUrl, ENDPOINTS } from "@/config/api";
import { modules } from "@/data/modules";
import { useState, useEffect } from "react";

interface TokenPrice {
  symbol: string;
  price: number;
  change_24h: number;
}

interface ModuleToken {
  id: string;
  symbol: string;
  price: number;
  change_24h: number;
  color: string;
}

const fetchTokenPrices = async (): Promise<{ main: TokenPrice; modules: ModuleToken[] }> => {
  try {
    const [mainRes, modulesRes] = await Promise.all([
      fetch(getApiUrl(ENDPOINTS.tokenPrice)),
      fetch(getApiUrl(ENDPOINTS.tokenModules))
    ]);
    
    if (!mainRes.ok || !modulesRes.ok) throw new Error("Failed to fetch");
    
    const main = await mainRes.json();
    const modulesData = await modulesRes.json();
    
    return { main, modules: modulesData };
  } catch {
    // Fallback data
    const moduleTokens: ModuleToken[] = modules.map((m, i) => ({
      id: m.id,
      symbol: m.id.toUpperCase().slice(0, 4),
      price: 20 + Math.random() * 30,
      change_24h: (Math.random() - 0.3) * 10,
      color: m.color
    }));
    
    return {
      main: { symbol: "QMET", price: 24.87, change_24h: 5.42 },
      modules: moduleTokens
    };
  }
};

export function TokenPriceTicker() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { data } = useQuery({
    queryKey: ["tokenPrices"],
    queryFn: fetchTokenPrices,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Auto-rotate through module tokens
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % (data?.modules.length || 8));
    }, 3000);
    return () => clearInterval(interval);
  }, [data?.modules.length]);

  const mainToken = data?.main ?? { symbol: "QMET", price: 24.87, change_24h: 5.42 };
  const moduleTokens = data?.modules ?? [];
  const activeModule = moduleTokens[activeIndex];
  const isMainPositive = mainToken.change_24h >= 0;

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border/50 backdrop-blur-sm overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-1.5 sm:py-2 gap-2">
          {/* Main QMET Token */}
          <motion.div
            className="flex items-center gap-2 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div
              className="relative"
              animate={{ 
                boxShadow: [
                  "0 0 8px hsl(var(--primary) / 0.3)",
                  "0 0 16px hsl(var(--primary) / 0.5)",
                  "0 0 8px hsl(var(--primary) / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
            </motion.div>
            
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-foreground">QMET</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={mainToken.price}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  ${mainToken.price.toFixed(2)}
                </motion.span>
              </AnimatePresence>
              <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${
                isMainPositive ? "text-green-500" : "text-red-500"
              }`}>
                {isMainPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {isMainPositive ? "+" : ""}{mainToken.change_24h.toFixed(1)}%
              </span>
            </div>
          </motion.div>

          {/* Separator */}
          <div className="h-4 w-px bg-border/50 hidden sm:block" />

          {/* Scrolling Module Tokens - Desktop */}
          <div className="hidden md:flex items-center gap-3 overflow-hidden flex-1 mx-4">
            <motion.div
              className="flex items-center gap-4"
              animate={{ x: [-10, 0] }}
              transition={{ duration: 0.3 }}
            >
              {moduleTokens.slice(0, 6).map((token, idx) => (
                <motion.div
                  key={token.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {token.symbol}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    ${token.price.toFixed(0)}
                  </span>
                  <span className={`text-[9px] ${token.change_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {token.change_24h >= 0 ? "+" : ""}{token.change_24h.toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile: Single rotating module token */}
          <div className="flex md:hidden items-center gap-2 flex-1 justify-center">
            <AnimatePresence mode="wait">
              {activeModule && (
                <motion.div
                  key={activeModule.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30"
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: activeModule.color }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {activeModule.symbol}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    ${activeModule.price.toFixed(0)}
                  </span>
                  <span className={`text-[9px] ${activeModule.change_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {activeModule.change_24h >= 0 ? "+" : ""}{activeModule.change_24h.toFixed(1)}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Indicator */}
          <motion.div
            className="flex items-center gap-1 shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Live</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
