import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Heart, MessageSquare, ExternalLink, TrendingUp, Filter, Grid3X3, List } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiToolsData, categoryInfo, getTrendingTools, getCategoryStats, AIToolCategory, AITool } from "@/data/aiToolsData";

const AITools = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AIToolCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const trendingTools = useMemo(() => getTrendingTools(12), []);
  const categoryStats = useMemo(() => getCategoryStats(), []);

  const filteredTools = useMemo(() => {
    return aiToolsData.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen-safe bg-background relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <main className="container-safe pt-24 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-responsive-hero font-orbitron font-bold text-gradient-hero mb-4">
            🌐 AI Social Network
          </h1>
          <p className="text-responsive-base text-muted-foreground max-w-3xl mx-auto">
            Discover, test and rate 69 open-source AI tools from Hugging Face
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Tools", value: "69", icon: "🤖" },
            { label: "Medical Tools", value: "27", icon: "🏥" },
            { label: "Trending Today", value: trendingTools.length.toString(), icon: "🔥" },
            { label: "Categories", value: "9", icon: "📂" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="trending" className="space-y-6">
          <TabsList className="glass w-full justify-start overflow-x-auto">
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" /> 🔥 Trending
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Grid3X3 className="w-4 h-4" /> All Tools
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Filter className="w-4 h-4" /> Categories
            </TabsTrigger>
          </TabsList>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <h2 className="text-2xl font-orbitron font-bold flex items-center gap-2">
              🔥 Trending Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </TabsContent>

          {/* All Tools Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  All ({aiToolsData.length})
                </Badge>
                {Object.entries(categoryInfo).slice(0, 5).map(([key, info]) => (
                  <Badge
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(key as AIToolCategory)}
                  >
                    {info.icon} {info.name.split(" ")[0]}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const tools = aiToolsData.filter(t => t.category === key);
              const stats = categoryStats[key as AIToolCategory];
              return (
                <div key={key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-orbitron font-bold flex items-center gap-2">
                      {info.icon} {info.name}
                      <Badge variant="secondary">{tools.length} tools</Badge>
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      Avg Likes: {stats?.avgLikes || 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.slice(0, 3).map((tool, i) => (
                      <ToolCard key={tool.id} tool={tool} index={i} compact />
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

// Tool Card Component
const ToolCard = ({ tool, index, compact = false }: { tool: AITool; index: number; compact?: boolean }) => {
  const catInfo = categoryInfo[tool.category];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass hover:border-primary/50 transition-all group h-full">
        <CardHeader className={compact ? "pb-2" : ""}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {tool.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs mt-1">
                  {catInfo.icon} {catInfo.name.split(" ")[0]}
                </Badge>
              </div>
            </div>
            {tool.isTrending && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                🔥 Trending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                {tool.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                {tool.commentsCount}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {tool.averageRating}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a href={tool.huggingfaceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Test
              </a>
            </Button>
            <Button size="sm" className="flex-1">
              <Star className="w-4 h-4 mr-1" />
              Rate
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AITools;
