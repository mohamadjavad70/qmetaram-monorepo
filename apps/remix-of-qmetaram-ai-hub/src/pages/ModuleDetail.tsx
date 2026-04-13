import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { getModuleById, modules } from "@/data/modules";
import { ArrowLeft, MessageSquare, Sparkles, Target, Zap, Brain, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ModuleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const module = getModuleById(id || "");

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-orbitron text-2xl font-bold mb-4">Module Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Accuracy", value: 94, icon: Target },
    { label: "Speed", value: 88, icon: Zap },
    { label: "Depth", value: 92, icon: Brain },
    { label: "Algorithm", value: 95, icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="module-detail"
        titleOverride={`${module.name} | Qmetaram Module`}
        descriptionOverride={module.description}
        canonicalPathOverride={`/modules/${module.id}`}
        schemaNameOverride={`${module.name} module`}
      />
      <Navbar />

      {/* Hero with module-specific background */}
      <section
        className="pt-24 pb-16 relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${module.color}15 0%, transparent 60%)`,
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          {/* Back button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Modules</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                    border: `2px solid ${module.color}50`,
                    boxShadow: `0 0 40px ${module.color}30`,
                  }}
                >
                  <img src={module.iconImage} alt={module.name} className="w-16 h-16 object-contain" />
                </div>
                <div>
                  <h1
                    className="font-orbitron text-4xl md:text-5xl font-bold"
                    style={{ color: module.color }}
                  >
                    {module.name}
                  </h1>
                  <span className="text-xl text-muted-foreground">{module.namePersian}</span>
                </div>
              </div>

              <p className="text-lg text-primary mb-4">{module.specialty}</p>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                {module.description}
              </p>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-2 mb-8">
                {module.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${module.color}20`,
                      color: module.color,
                      border: `1px solid ${module.color}30`,
                    }}
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to={`/modules/${module.id}/chat`}>
                  <Button
                    size="lg"
                    className="text-primary-foreground"
                    style={{
                      background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)`,
                    }}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat with {module.name}
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Fusion Mode
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-8"
              style={{
                border: `1px solid ${module.color}30`,
              }}
            >
              <h3 className="font-orbitron text-xl font-bold mb-6">Performance Metrics</h3>
              <div className="space-y-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="font-bold" style={{ color: module.color }}>
                        {stat.value}%
                      </span>
                    </div>
                    <Progress
                      value={stat.value}
                      className="h-2"
                      style={{
                        ["--progress-foreground" as any]: module.color,
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-matrix animate-pulse" />
                      <span className="text-sm font-medium text-matrix">Active</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Last Update</div>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Queries</div>
                    <span className="text-sm font-medium">1.2M+</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Avg Response</div>
                    <span className="text-sm font-medium">0.8s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module Features Section */}
      {module.features && (
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="font-orbitron text-2xl font-bold mb-8">
              <span style={{ color: module.color }}>{module.name}</span> Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {module.features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className="h-full hover:scale-105 transition-transform cursor-pointer"
                    style={{ borderColor: `${module.color}30` }}
                  >
                    <CardHeader className="pb-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                        style={{
                          background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                          border: `1px solid ${module.color}40`,
                        }}
                      >
                        <feature.icon className="w-6 h-6" style={{ color: module.color }} />
                      </div>
                      <CardTitle className="text-lg" style={{ color: module.color }}>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Start Chat CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Link to={`/modules/${module.id}/chat`}>
                <Button 
                  size="lg" 
                  className="group"
                  style={{
                    background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)`,
                  }}
                >
                  Start Using {module.name}
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Other Modules */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="font-orbitron text-2xl font-bold mb-8">Explore Other Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {modules
              .filter((m) => m.id !== module.id)
              .map((otherModule) => (
                <Link
                  key={otherModule.id}
                  to={`/modules/${otherModule.id}`}
                  className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform"
                  style={{
                    borderColor: `${otherModule.color}30`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${otherModule.color}30, ${otherModule.color}10)`,
                      border: `1px solid ${otherModule.color}40`,
                    }}
                  >
                    <img src={otherModule.iconImage} alt={otherModule.name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="font-semibold text-sm" style={{ color: otherModule.color }}>
                    {otherModule.name}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ModuleDetail;
