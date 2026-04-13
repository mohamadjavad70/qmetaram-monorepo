import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { aiMarketplaceData, AIModel } from "@/data/modules";
import {
  X,
  Plus,
  Target,
  Zap,
  Brain,
  Cpu,
  Star,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METRICS = [
  { key: "accuracy", label: "Accuracy", icon: Target, description: "Response correctness and reliability" },
  { key: "speed", label: "Speed", icon: Zap, description: "Processing efficiency and response time" },
  { key: "depth", label: "Depth", icon: Brain, description: "Complexity and comprehensiveness" },
  { key: "algorithmQuality", label: "Algorithm Quality", icon: Cpu, description: "Sophistication of underlying model" },
] as const;

const Compare = () => {
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);

  const addModel = (token: string) => {
    if (selectedModels.length >= 3) return;
    const model = aiMarketplaceData.find((m) => m.token === token);
    if (model && !selectedModels.find((m) => m.token === token)) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const removeModel = (token: string) => {
    setSelectedModels(selectedModels.filter((m) => m.token !== token));
  };

  const availableModels = aiMarketplaceData.filter(
    (m) => !selectedModels.find((s) => s.token === m.token)
  );

  const getWinner = (metricKey: keyof AIModel) => {
    if (selectedModels.length < 2) return null;
    const max = Math.max(...selectedModels.map((m) => m[metricKey] as number));
    return selectedModels.find((m) => m[metricKey] === max)?.token;
  };

  const getOverallScores = () => {
    return selectedModels.map((model) => ({
      ...model,
      overall:
        (model.accuracy + model.speed + model.depth + model.algorithmQuality) / 4,
    }));
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
              Intelligence Analysis
            </span>
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-primary">AI Model Comparison</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select 2-3 AI models to compare their performance metrics side by side
            </p>
          </motion.div>

          {/* Model Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="font-orbitron text-lg font-semibold">Select Models to Compare</h2>
                <span className="text-sm text-muted-foreground">
                  ({selectedModels.length}/3 selected)
                </span>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* Selected Models */}
                <AnimatePresence mode="popLayout">
                  {selectedModels.map((model) => {
                    const Icon = model.icon;
                    return (
                      <motion.div
                        key={model.token}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{
                          background: `linear-gradient(135deg, ${model.color}15, ${model.color}05)`,
                          borderColor: `${model.color}40`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                          style={{ background: `${model.color}20` }}
                        >
                          {model.iconImage ? (
                            <img src={model.iconImage} alt={model.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <Icon className="w-5 h-5" style={{ color: model.color }} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: model.color }}>
                            {model.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{model.provider}</div>
                        </div>
                        <button
                          onClick={() => removeModel(model.token)}
                          className="ml-2 p-1 rounded-full hover:bg-destructive/20 transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add Model Selector */}
                {selectedModels.length < 3 && (
                  <Select onValueChange={addModel}>
                    <SelectTrigger className="w-[200px] bg-muted/50 border-border/50">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <SelectValue placeholder="Add model..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => {
                        const Icon = model.icon;
                        return (
                          <SelectItem key={model.token} value={model.token}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" style={{ color: model.color }} />
                              <span>{model.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </motion.div>

          {/* Comparison Content */}
          {selectedModels.length >= 2 ? (
            <div className="space-y-8">
              {/* Overall Score Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${selectedModels.length}, minmax(0, 1fr))`,
                }}
              >
                {getOverallScores()
                  .sort((a, b) => b.overall - a.overall)
                  .map((model, index) => {
                    const Icon = model.icon;
                    const isWinner = index === 0;
                    return (
                      <div
                        key={model.token}
                        className={`glass rounded-2xl p-6 border relative ${
                          isWinner ? "ring-2 ring-primary" : "border-border/50"
                        }`}
                      >
                        {isWinner && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-xs font-semibold text-primary-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Best Overall
                          </div>
                        )}
                        <div className="text-center">
                          <div
                            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${model.color}30, ${model.color}10)`,
                              border: `2px solid ${model.color}50`,
                            }}
                          >
                            {model.iconImage ? (
                              <img src={model.iconImage} alt={model.name} className="w-12 h-12 object-contain" />
                            ) : (
                              <Icon className="w-8 h-8" style={{ color: model.color }} />
                            )}
                          </div>
                          <h3 className="font-orbitron text-xl font-bold" style={{ color: model.color }}>
                            {model.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">{model.provider}</p>
                          <p className="text-sm text-muted-foreground mb-4">{model.category}</p>
                          <div
                            className="text-4xl font-orbitron font-bold mb-2"
                            style={{ color: model.color }}
                          >
                            {model.overall.toFixed(1)}
                          </div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>

                          <div className="mt-4 flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 text-da-vinci fill-da-vinci" />
                            <span className="font-semibold">{model.userRating}</span>
                            <span
                              className={`inline-flex items-center gap-1 ml-2 text-sm ${
                                model.change24h >= 0 ? "text-matrix" : "text-destructive"
                              }`}
                            >
                              {model.change24h >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {model.change24h >= 0 ? "+" : ""}
                              {model.change24h}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </motion.div>

              {/* Detailed Metrics Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 border border-border/50"
              >
                <h2 className="font-orbitron text-xl font-semibold mb-6 flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  Detailed Metrics Breakdown
                </h2>

                <div className="space-y-8">
                  {METRICS.map((metric) => {
                    const winner = getWinner(metric.key);
                    const MetricIcon = metric.icon;
                    return (
                      <div key={metric.key}>
                        <div className="flex items-center gap-3 mb-4">
                          <MetricIcon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{metric.label}</h3>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {selectedModels
                            .sort((a, b) => (b[metric.key] as number) - (a[metric.key] as number))
                            .map((model) => {
                              const Icon = model.icon;
                              const value = model[metric.key] as number;
                              const isWinner = model.token === winner;
                              return (
                                <div key={model.token} className="flex items-center gap-4">
                                  <div className="w-32 flex items-center gap-2">
                                    <Icon className="w-4 h-4" style={{ color: model.color }} />
                                    <span
                                      className={`text-sm font-medium ${
                                        isWinner ? "text-foreground" : "text-muted-foreground"
                                      }`}
                                    >
                                      {model.name}
                                    </span>
                                    {isWinner && (
                                      <CheckCircle2 className="w-4 h-4 text-matrix" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="relative h-8 rounded-lg overflow-hidden bg-muted/30">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${value}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full rounded-lg"
                                        style={{
                                          background: `linear-gradient(90deg, ${model.color}60, ${model.color}90)`,
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center px-3">
                                        <span
                                          className="font-orbitron font-bold text-sm"
                                          style={{
                                            color: value > 50 ? "#fff" : model.color,
                                            textShadow: value > 50 ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
                                          }}
                                        >
                                          {value}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Radar-style Comparison Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl overflow-hidden border border-border/50"
              >
                <div className="p-6 border-b border-border/30">
                  <h2 className="font-orbitron text-xl font-semibold flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-primary" />
                    Full Specification Comparison
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="text-left p-4 font-medium text-muted-foreground">Specification</th>
                        {selectedModels.map((model) => {
                          const Icon = model.icon;
                          return (
                            <th key={model.token} className="p-4 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Icon className="w-6 h-6" style={{ color: model.color }} />
                                <span style={{ color: model.color }}>{model.name}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Accuracy", key: "accuracy", suffix: "%" },
                        { label: "Speed", key: "speed", suffix: "%" },
                        { label: "Depth", key: "depth", suffix: "%" },
                        { label: "Algorithm Quality", key: "algorithmQuality", suffix: "%" },
                        { label: "User Rating", key: "userRating", suffix: "/5" },
                        { label: "24h Change", key: "change24h", suffix: "%" },
                        { label: "Category", key: "category", suffix: "" },
                        { label: "Status", key: "status", suffix: "" },
                        { label: "Market Cap", key: "marketCap", suffix: "" },
                        { label: "24h Volume", key: "volume24h", suffix: "" },
                      ].map((row, idx) => {
                        const values = selectedModels.map((m) => m[row.key as keyof AIModel]);
                        const numericValues = values.filter((v) => typeof v === "number") as number[];
                        const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : null;

                        return (
                          <tr
                            key={row.key}
                            className={idx % 2 === 0 ? "bg-muted/10" : ""}
                          >
                            <td className="p-4 font-medium">{row.label}</td>
                            {selectedModels.map((model) => {
                              const value = model[row.key as keyof AIModel];
                              const isMax =
                                typeof value === "number" &&
                                value === maxValue &&
                                row.key !== "change24h";
                              const isPositiveChange =
                                row.key === "change24h" && (value as number) >= 0;

                              return (
                                <td key={model.token} className="p-4 text-center">
                                  <span
                                    className={`font-semibold ${
                                      isMax ? "text-matrix" : ""
                                    } ${
                                      row.key === "change24h"
                                        ? isPositiveChange
                                          ? "text-matrix"
                                          : "text-destructive"
                                        : ""
                                    } ${
                                      row.key === "status"
                                        ? value === "active"
                                          ? "text-matrix"
                                          : value === "updating"
                                          ? "text-da-vinci"
                                          : "text-destructive"
                                        : ""
                                    }`}
                                  >
                                    {row.key === "change24h" && (value as number) >= 0 ? "+" : ""}
                                    {String(value)}
                                    {row.suffix}
                                    {isMax && row.key !== "status" && row.key !== "category" && (
                                      <CheckCircle2 className="w-4 h-4 inline ml-1" />
                                    )}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Winner Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-6 border border-primary/30 bg-primary/5"
              >
                <h2 className="font-orbitron text-xl font-semibold mb-4 text-center">
                  Category Winners
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {METRICS.map((metric) => {
                    const winnerToken = getWinner(metric.key);
                    const winner = selectedModels.find((m) => m.token === winnerToken);
                    if (!winner) return null;
                    const Icon = winner.icon;
                    const MetricIcon = metric.icon;
                    return (
                      <div
                        key={metric.key}
                        className="text-center p-4 rounded-xl bg-muted/30"
                      >
                        <MetricIcon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Icon className="w-5 h-5" style={{ color: winner.color }} />
                          <span className="font-semibold" style={{ color: winner.color }}>
                            {winner.name}
                          </span>
                        </div>
                        <p className="text-lg font-orbitron font-bold mt-1" style={{ color: winner.color }}>
                          {winner[metric.key]}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 border border-border/50 text-center"
            >
              <Scale className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-orbitron text-xl font-semibold mb-2">
                Select at least 2 models to compare
              </h3>
              <p className="text-muted-foreground mb-6">
                Use the selector above to add AI models for comparison
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {aiMarketplaceData.slice(0, 4).map((model) => {
                  const Icon = model.icon;
                  return (
                    <Button
                      key={model.token}
                      variant="outline"
                      onClick={() => addModel(model.token)}
                      className="border-border/50"
                    >
                      <Icon className="w-4 h-4 mr-2" style={{ color: model.color }} />
                      {model.name}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Compare;
