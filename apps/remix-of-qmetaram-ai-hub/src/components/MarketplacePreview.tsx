import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { aiMarketplaceData } from "@/data/modules";
import { TrendingUp, TrendingDown, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketplacePreview() {
  const topModels = aiMarketplaceData.slice(0, 4);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            AI Intelligence Hub
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">AI Marketplace</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover, compare, and test AI models. Track performance metrics like accuracy, 
            speed, and depth in real-time.
          </p>
        </motion.div>

        {/* Preview Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden border border-border/50 mb-8"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-3">AI Model</div>
            <div className="col-span-2 text-right">Accuracy</div>
            <div className="col-span-2 text-right">Speed</div>
            <div className="col-span-2 text-right">Rating</div>
            <div className="col-span-2 text-right">24h Change</div>
          </div>

          {/* Table Body */}
          {topModels.map((model, index) => {
            const Icon = model.icon;
            return (
              <motion.div
                key={model.token}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/30 hover:bg-muted/20 transition-colors items-center"
              >
                <div className="col-span-1 text-muted-foreground font-medium">
                  {model.rank}
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${model.color}30, ${model.color}10)`,
                      border: `1px solid ${model.color}40`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: model.color }} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.token}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="font-semibold" style={{ color: model.color }}>
                    {model.accuracy}%
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="font-semibold text-foreground">
                    {model.speed}%
                  </div>
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1">
                  <Star className="w-4 h-4 text-da-vinci fill-da-vinci" />
                  <span className="font-semibold">{model.userRating}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      model.change24h >= 0 ? "text-matrix" : "text-destructive"
                    }`}
                  >
                    {model.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {model.change24h >= 0 ? "+" : ""}{model.change24h}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/marketplace">
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 group"
            >
              View Full Marketplace
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
