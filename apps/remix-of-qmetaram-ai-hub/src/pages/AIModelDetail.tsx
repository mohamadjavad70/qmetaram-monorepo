import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { aiMarketplaceData } from "@/data/modules";
import { ArrowLeft, Star, TrendingUp, TrendingDown, Target, Zap, Brain, Activity, MessageSquare, ExternalLink, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const AIModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const model = aiMarketplaceData.find(
    (m) => m.token.toLowerCase() === id?.toLowerCase()
  );

  if (!model) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-orbitron text-2xl font-bold mb-4">Model Not Found</h1>
          <Link to="/marketplace">
            <Button>Return to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = model.icon;

  const metrics = [
    { label: "Accuracy Score", value: model.accuracy, icon: Target, description: "Response correctness and reliability" },
    { label: "Speed Rating", value: model.speed, icon: Zap, description: "Response time and processing efficiency" },
    { label: "Depth Score", value: model.depth, icon: Brain, description: "Complexity and comprehensiveness" },
    { label: "Algorithm Quality", value: model.algorithmQuality, icon: Activity, description: "Sophistication of underlying model" },
  ];

  // Find similar models from same provider or category
  const similarModels = aiMarketplaceData
    .filter((m) => m.token !== model.token && (m.provider === model.provider || m.category === model.category))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="ai-model-detail"
        titleOverride={`${model.name} | AI Model Detail | Qmetaram`}
        descriptionOverride={model.description || `${model.name} by ${model.provider} on the Qmetaram AI marketplace. Review ranking, speed, depth, and accuracy in one place.`}
        canonicalPathOverride={`/ai-model/${model.token.toLowerCase()}`}
        schemaNameOverride={`${model.name} AI model`}
      />
      <Navbar />

      {/* Hero */}
      <section
        className="pt-24 pb-16 relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${model.color}15 0%, transparent 60%)`,
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          {/* Back button */}
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${model.color}30, ${model.color}10)`,
                      border: `2px solid ${model.color}50`,
                      boxShadow: `0 0 50px ${model.color}30`,
                    }}
                  >
                    {model.iconImage ? (
                      <img src={model.iconImage} alt={model.name} className="w-16 h-16 object-contain" />
                    ) : (
                      <Icon className="w-12 h-12" style={{ color: model.color }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1
                        className="font-orbitron text-3xl md:text-4xl font-bold"
                        style={{ color: model.color }}
                      >
                        {model.name}
                      </h1>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                        {model.token}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">{model.provider}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{model.category}</span>
                    </div>
                    {model.description && (
                      <p className="text-muted-foreground mb-4">{model.description}</p>
                    )}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-da-vinci fill-da-vinci" />
                        <span className="font-bold text-lg">{model.userRating}</span>
                        <span className="text-muted-foreground text-sm">User Rating</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          model.change24h >= 0 ? "text-matrix" : "text-destructive"
                        }`}
                      >
                        {model.change24h >= 0 ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        <span className="font-bold text-lg">
                          {model.change24h >= 0 ? "+" : ""}
                          {model.change24h}%
                        </span>
                        <span className="text-muted-foreground text-sm">24h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 mb-8">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      model.status === "active"
                        ? "bg-matrix/20 text-matrix"
                        : model.status === "updating"
                        ? "bg-da-vinci/20 text-da-vinci"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        model.status === "active"
                          ? "bg-matrix animate-pulse"
                          : model.status === "updating"
                          ? "bg-da-vinci animate-pulse"
                          : "bg-destructive"
                      }`}
                    />
                    {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">Rank #{model.rank}</span>
                  {model.apiAvailable && (
                    <span className="inline-flex items-center gap-1 text-sm text-matrix">
                      <CheckCircle2 className="w-4 h-4" />
                      API Available
                    </span>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 mb-12">
                  <Link to="/chat">
                    <Button
                      size="lg"
                      className="text-primary-foreground"
                      style={{
                        background: `linear-gradient(135deg, ${model.color}, ${model.color}cc)`,
                      }}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Test This Model
                    </Button>
                  </Link>
                  <Link to={`/compare?models=${model.token}`}>
                    <Button size="lg" variant="outline" className="border-primary/30">
                      Compare with Others
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-primary/30">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Documentation
                  </Button>
                </div>

                {/* Performance Metrics */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-orbitron text-xl font-bold mb-6">Performance Metrics</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {metrics.map((metric) => (
                      <div key={metric.label} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <metric.icon className="w-5 h-5" style={{ color: model.color }} />
                            <span className="font-medium">{metric.label}</span>
                          </div>
                          <span className="font-bold text-lg" style={{ color: model.color }}>
                            {metric.value}%
                          </span>
                        </div>
                        <Progress value={metric.value} className="h-3" />
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="glass rounded-2xl p-6" style={{ borderColor: `${model.color}30` }}>
                <h3 className="font-orbitron text-lg font-bold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-bold">{model.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-bold">{model.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-bold">{model.volume24h}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-bold">{model.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Global Rank</span>
                    <span className="font-bold">#{model.rank}</span>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="glass rounded-2xl p-6 text-center" style={{ borderColor: `${model.color}30` }}>
                <h3 className="font-orbitron text-lg font-bold mb-4">Overall Score</h3>
                <div
                  className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{
                    background: `conic-gradient(${model.color} ${
                      ((model.accuracy + model.speed + model.depth + model.algorithmQuality) / 4) * 3.6
                    }deg, hsl(var(--muted)) 0deg)`,
                  }}
                >
                  <div className="w-28 h-28 rounded-full bg-card flex items-center justify-center">
                    <span className="font-orbitron text-3xl font-bold" style={{ color: model.color }}>
                      {Math.round((model.accuracy + model.speed + model.depth + model.algorithmQuality) / 4)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Based on all performance metrics</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Similar Models */}
      {similarModels.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="font-orbitron text-2xl font-bold mb-8">Similar Models</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarModels.map((similarModel) => {
                const SimilarIcon = similarModel.icon;
                return (
                  <Link
                    key={similarModel.token}
                    to={`/ai/${similarModel.token.toLowerCase()}`}
                    className="glass rounded-xl p-4 hover:scale-105 transition-transform"
                    style={{ borderColor: `${similarModel.color}30` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${similarModel.color}30, ${similarModel.color}10)`,
                          border: `1px solid ${similarModel.color}40`,
                        }}
                      >
                        {similarModel.iconImage ? (
                          <img src={similarModel.iconImage} alt={similarModel.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <SimilarIcon className="w-5 h-5" style={{ color: similarModel.color }} />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: similarModel.color }}>
                          {similarModel.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{similarModel.provider}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-medium" style={{ color: similarModel.color }}>{similarModel.accuracy}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default AIModelDetail;
