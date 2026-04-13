import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { aiMarketplaceData, AIModel } from "@/data/modules";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Search,
  ArrowUpDown,
  Activity,
  Zap,
  Target,
  Cpu,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

type SortField = "rank" | "accuracy" | "speed" | "depth" | "algorithmQuality" | "userRating" | "change24h";
type SortDirection = "asc" | "desc";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  const categories = ["all", ...new Set(aiMarketplaceData.map((m) => m.category))];
  const providers = ["all", ...new Set(aiMarketplaceData.map((m) => m.provider))];

  const filteredAndSortedData = aiMarketplaceData
    .filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || model.category === categoryFilter;
      const matchesProvider = providerFilter === "all" || model.provider === providerFilter;
      return matchesSearch && matchesCategory && matchesProvider;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const stats = {
    totalModels: aiMarketplaceData.length,
    avgAccuracy: Math.round(aiMarketplaceData.reduce((acc, m) => acc + m.accuracy, 0) / aiMarketplaceData.length),
    avgSpeed: Math.round(aiMarketplaceData.reduce((acc, m) => acc + m.speed, 0) / aiMarketplaceData.length),
    activeModels: aiMarketplaceData.filter((m) => m.status === "active").length,
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              Intelligence Hub
            </span>
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-primary">AI Marketplace</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover, compare, and test the top 50 AI models worldwide. Track performance metrics in real-time.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total AI Models", value: stats.totalModels, icon: Cpu, color: "primary" },
              { label: "Avg Accuracy", value: `${stats.avgAccuracy}%`, icon: Target, color: "matrix" },
              { label: "Avg Speed", value: `${stats.avgSpeed}%`, icon: Zap, color: "tesla" },
              { label: "Active Models", value: stats.activeModels, icon: Activity, color: "quantum-pulse" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-orbitron font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI models, providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
              <Link to="/compare">
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Compare Models
                </Button>
              </Link>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground flex items-center mr-2">
                <Target className="w-4 h-4 mr-1" /> Category:
              </span>
              {categories.slice(0, 10).map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className={categoryFilter === cat ? "bg-primary text-primary-foreground" : "border-border/50"}
                >
                  {cat === "all" ? "All" : cat}
                </Button>
              ))}
            </div>

            {/* Provider Filter */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground flex items-center mr-2">
                <Building2 className="w-4 h-4 mr-1" /> Provider:
              </span>
              {providers.slice(0, 12).map((provider) => (
                <Button
                  key={provider}
                  variant={providerFilter === provider ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProviderFilter(provider)}
                  className={providerFilter === provider ? "bg-primary text-primary-foreground" : "border-border/50"}
                >
                  {provider === "all" ? "All" : provider}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredAndSortedData.length} of {aiMarketplaceData.length} models
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl overflow-hidden border border-border/50"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-4 bg-muted/30 border-b border-border/50 text-sm font-medium text-muted-foreground">
              <button
                className="col-span-1 flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => handleSort("rank")}
              >
                # <ArrowUpDown className="w-3 h-3" />
              </button>
              <div className="col-span-4 md:col-span-3">AI Model</div>
              <div className="hidden md:block col-span-2">Provider</div>
              <button
                className="col-span-2 flex items-center justify-end gap-1 hover:text-foreground transition-colors"
                onClick={() => handleSort("accuracy")}
              >
                Acc <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                className="col-span-2 md:col-span-1 flex items-center justify-end gap-1 hover:text-foreground transition-colors"
                onClick={() => handleSort("speed")}
              >
                Spd <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                className="hidden md:flex col-span-1 items-center justify-end gap-1 hover:text-foreground transition-colors"
                onClick={() => handleSort("userRating")}
              >
                <Star className="w-3 h-3" />
              </button>
              <button
                className="col-span-3 md:col-span-2 flex items-center justify-end gap-1 hover:text-foreground transition-colors"
                onClick={() => handleSort("change24h")}
              >
                24h <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>

            {/* Table Body */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredAndSortedData.map((model, index) => (
                <ModelRow key={model.token} model={model} index={index} />
              ))}
            </div>
          </motion.div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No models found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

function ModelRow({ model, index }: { model: AIModel; index: number }) {
  const Icon = model.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
    >
      <Link
        to={`/ai/${model.token.toLowerCase()}`}
        className="grid grid-cols-12 gap-2 px-4 md:px-6 py-4 border-b border-border/30 hover:bg-muted/20 transition-colors items-center group"
      >
        <div className="col-span-1 text-muted-foreground font-medium text-sm">{model.rank}</div>
        <div className="col-span-4 md:col-span-3 flex items-center gap-2 md:gap-3">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${model.color}30, ${model.color}10)`,
              border: `1px solid ${model.color}40`,
            }}
          >
            {model.iconImage ? (
              <img src={model.iconImage} alt={model.name} className="w-8 h-8 object-contain" />
            ) : (
              <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: model.color }} />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm md:text-base truncate">
              {model.name}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-xs text-muted-foreground">{model.token}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full hidden md:inline ${
                  model.status === "active"
                    ? "bg-matrix/20 text-matrix"
                    : model.status === "updating"
                    ? "bg-da-vinci/20 text-da-vinci"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {model.status}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:block col-span-2">
          <span className="text-sm text-muted-foreground">{model.provider}</span>
        </div>
        <div className="col-span-2">
          <div className="flex items-center gap-1 md:gap-2 justify-end">
            <Progress value={model.accuracy} className="w-10 md:w-16 h-2" />
            <span className="font-semibold text-xs md:text-sm w-8 text-right" style={{ color: model.color }}>
              {model.accuracy}%
            </span>
          </div>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-1 justify-end">
            <span className="font-semibold text-xs md:text-sm">{model.speed}%</span>
          </div>
        </div>
        <div className="hidden md:flex col-span-1 items-center justify-end gap-1">
          <Star className="w-3 h-3 text-da-vinci fill-da-vinci" />
          <span className="font-semibold text-sm">{model.userRating}</span>
        </div>
        <div className="col-span-3 md:col-span-2 text-right">
          <span
            className={`inline-flex items-center gap-1 font-semibold text-xs md:text-sm ${
              model.change24h >= 0 ? "text-matrix" : "text-destructive"
            }`}
          >
            {model.change24h >= 0 ? (
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
            )}
            {model.change24h >= 0 ? "+" : ""}
            {model.change24h}%
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default Marketplace;
