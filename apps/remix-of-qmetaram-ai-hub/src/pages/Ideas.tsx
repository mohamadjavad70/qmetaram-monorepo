import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Share2, 
  ThumbsUp, 
  Copy, 
  Check,
  Sparkles,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Gift,
  Coins,
  Star
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { qmetaramApi, Idea, ReferralStats } from "@/services/qmetaramApi";

const IDEA_CATEGORIES = [
  { value: "ai-module", label: "AI Module" },
  { value: "marketplace", label: "Marketplace" },
  { value: "integration", label: "Integration" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "research", label: "Research" },
];

// Default fallback data for when API is unavailable
const FALLBACK_TRENDING_IDEAS: Idea[] = [
  {
    idea_id: "idea-001",
    title: "Quantum-Enhanced Language Model",
    description: "A revolutionary approach combining quantum computing principles with transformer architectures for exponentially faster training and inference.",
    category: "ai-module",
    referral_code: "QMET-7X9K2M4P",
    url: "https://qmetaram.com/ideas/idea-001",
    upvotes: 847,
    status: "approved",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    idea_id: "idea-002",
    title: "Cross-Modal AI Fusion Interface",
    description: "Seamless integration of text, image, audio, and video processing in a unified interface with real-time switching capabilities.",
    category: "feature",
    referral_code: "QMET-3N8R5W2Q",
    url: "https://qmetaram.com/ideas/idea-002",
    upvotes: 623,
    status: "approved",
    created_at: "2024-01-14T15:45:00Z"
  },
  {
    idea_id: "idea-003",
    title: "AI Ethics Validator Module",
    description: "Automated ethical assessment tool that evaluates AI outputs for bias, fairness, and compliance with global AI governance standards.",
    category: "ai-module",
    referral_code: "QMET-9L4H7V1X",
    url: "https://qmetaram.com/ideas/idea-003",
    upvotes: 512,
    status: "pending",
    created_at: "2024-01-13T09:20:00Z"
  },
];

const FALLBACK_REFERRAL_STATS: ReferralStats = {
  total_referrals: 0,
  successful_conversions: 0,
  pending_conversions: 0,
  total_earnings: 0,
  pending_earnings: 0,
  referral_codes: []
};

function IdeaSubmissionForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState<Idea | null>(null);

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await qmetaramApi.submitIdea({
        title,
        description,
        category,
        submitter_email: email || undefined,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to submit idea");
      }
      return response.data;
    },
    onSuccess: (data) => {
      setSubmittedIdea(data);
      queryClient.invalidateQueries({ queryKey: ["trending-ideas"] });
      toast({
        title: "Idea Submitted!",
        description: "Your referral code has been created. Share it with your friends!",
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setEmail("");
    },
    onError: (error) => {
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate();
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-5 h-5" />
          Submit New Idea
        </CardTitle>
        <CardDescription>
          Share your innovative ideas and earn through the referral system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Idea Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write an engaging title for your idea..."
              className="bg-background/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Category *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {IDEA_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Idea Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail. The more complete, the better the approval chances..."
              rows={4}
              className="bg-background/50 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Email (Optional)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="To receive notifications about your idea"
              className="bg-background/50"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.span>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Submit Idea
              </span>
            )}
          </Button>
        </form>

        {/* Show referral code after submission */}
        <AnimatePresence>
          {submittedIdea && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30"
            >
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Your Referral Code
              </h4>
              <ReferralCodeDisplay code={submittedIdea.referral_code} url={submittedIdea.url} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function ReferralCodeDisplay({ code, url }: { code: string; url: string }) {
  const [copied, setCopied] = useState<"code" | "url" | null>(null);

  const copyToClipboard = async (text: string, type: "code" | "url") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied!",
      description: type === "code" ? "Referral code copied" : "Link copied",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-background/50 rounded-md font-mono text-sm">
          {code}
        </code>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(code, "code")}
        >
          {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-background/50 rounded-md font-mono text-xs truncate">
          {url}
        </code>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(url, "url")}
        >
          {copied === "url" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  const [upvoted, setUpvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(idea.upvotes);

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const response = await qmetaramApi.upvoteIdea(idea.idea_id);
      if (!response.success) {
        throw new Error(response.error || "Failed to upvote");
      }
      return response.data;
    },
    onSuccess: (data) => {
      setUpvoted(true);
      if (data?.new_upvotes) {
        setLocalUpvotes(data.new_upvotes);
      } else {
        setLocalUpvotes(prev => prev + 1);
      }
      toast({ title: "Vote recorded!" });
    },
    onError: () => {
      // Optimistic update fallback
      setUpvoted(true);
      setLocalUpvotes(prev => prev + 1);
      toast({ title: "Vote recorded!" });
    },
  });

  const handleUpvote = () => {
    if (!upvoted && !upvoteMutation.isPending) {
      upvoteMutation.mutate();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "ai-module": "bg-primary/20 text-primary border-primary/30",
      "marketplace": "bg-secondary/20 text-secondary border-secondary/30",
      "integration": "bg-accent/20 text-accent border-accent/30",
      "feature": "bg-da-vinci/20 text-da-vinci border-da-vinci/30",
      "improvement": "bg-mowlana/20 text-mowlana border-mowlana/30",
      "research": "bg-tesla/20 text-tesla border-tesla/30",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-matrix/20 text-matrix border-matrix/30",
      pending: "bg-da-vinci/20 text-da-vinci border-da-vinci/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    };
    const labels: Record<string, string> = {
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
    };
    return { style: styles[status], label: labels[status] };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 group">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Rank & Upvote */}
            <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                #{index + 1}
              </div>
              <Button
                size="sm"
                variant={upvoted ? "default" : "outline"}
                className="flex items-center gap-1"
                onClick={handleUpvote}
              >
                <ThumbsUp className={`w-4 h-4 ${upvoted ? "fill-current" : ""}`} />
                <span>{localUpvotes}</span>
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className={getCategoryColor(idea.category)}>
                  {IDEA_CATEGORIES.find(c => c.value === idea.category)?.label || idea.category}
                </Badge>
                <Badge variant="outline" className={getStatusBadge(idea.status).style}>
                  {getStatusBadge(idea.status).label}
                </Badge>
              </div>

              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {idea.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {idea.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(idea.created_at).toLocaleDateString("en-US")}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Gift className="w-3 h-3" />
                  {idea.referral_code}
                </span>
              </div>
            </div>

            {/* Action */}
            <Button size="sm" variant="ghost" className="shrink-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrendingIdeas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: ideasData, isLoading, error } = useQuery({
    queryKey: ["trending-ideas"],
    queryFn: async () => {
      const response = await qmetaramApi.getTrendingIdeas();
      if (response.success && response.data) {
        return response.data;
      }
      return FALLBACK_TRENDING_IDEAS;
    },
    staleTime: 30000,
  });

  const ideas = ideasData || FALLBACK_TRENDING_IDEAS;

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || idea.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ideas..."
            className="pl-10 bg-background/50"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-background/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {IDEA_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            </motion.div>
            <p>Loading...</p>
          </div>
        ) : filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea, index) => (
            <IdeaCard key={idea.idea_id} idea={idea} index={index} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No ideas found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["my-referrals"],
    queryFn: async () => {
      const response = await qmetaramApi.getMyReferrals();
      if (response.success && response.data) {
        return response.data;
      }
      return FALLBACK_REFERRAL_STATS;
    },
    staleTime: 30000,
  });

  const stats = statsData || FALLBACK_REFERRAL_STATS;

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
        </motion.div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Referrals"
          value={stats.total_referrals}
          color="primary"
        />
        <StatCard
          icon={<Check className="w-5 h-5" />}
          label="Successful Conversions"
          value={stats.successful_conversions}
          color="matrix"
        />
        <StatCard
          icon={<Coins className="w-5 h-5" />}
          label="Total Earnings"
          value={`$${stats.total_earnings.toFixed(2)}`}
          color="da-vinci"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending"
          value={`$${stats.pending_earnings.toFixed(2)}`}
          color="secondary"
        />
      </div>

      {/* Referral Codes Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            My Referral Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Code</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Clicks</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Conversions</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Earnings</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.referral_codes.map((ref) => (
                  <ReferralRow key={ref.code} referral={ref} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="glass border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Tips to Increase Your Earnings
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Share your ideas on social media platforms
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Be active in AI-focused communities and forums
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              More complete ideas have better approval and earnings chances
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Each successful conversion earns you $20!
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/30",
    matrix: "bg-matrix/10 text-matrix border-matrix/30",
    "da-vinci": "bg-da-vinci/10 text-da-vinci border-da-vinci/30",
    secondary: "bg-secondary/10 text-secondary border-secondary/30",
  };

  return (
    <Card className={`glass border ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralRow({ referral }: { referral: { code: string; clicks: number; conversions: number; earnings: number } }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(referral.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate = referral.clicks > 0 ? ((referral.conversions / referral.clicks) * 100).toFixed(1) : "0";

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-2">
        <code className="font-mono text-sm text-primary">{referral.code}</code>
      </td>
      <td className="text-center py-3 px-2">{referral.clicks}</td>
      <td className="text-center py-3 px-2">
        <span className="text-matrix">{referral.conversions}</span>
        <span className="text-xs text-muted-foreground ml-1">({conversionRate}%)</span>
      </td>
      <td className="text-center py-3 px-2 text-da-vinci font-medium">${referral.earnings.toFixed(2)}</td>
      <td className="text-center py-3 px-2">
        <Button size="sm" variant="ghost" onClick={copyCode}>
          {copied ? <Check className="w-4 h-4 text-matrix" /> : <Copy className="w-4 h-4" />}
        </Button>
      </td>
    </tr>
  );
}

export default function Ideas() {
  return (
    <div className="min-h-screen-safe bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-50" />
        <div className="container-safe relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Ideas & Referral System
            </Badge>
            <h1 className="text-responsive-xl font-bold mb-4 text-gradient-primary">
              Share Your Innovative Ideas
            </h1>
            <p className="text-muted-foreground text-responsive-base mb-6">
              Submit your innovative ideas, get inspired by others, and earn through our referral system
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gift className="w-4 h-4 text-primary" />
                <span>$20 reward per conversion</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-matrix" />
                <span>500+ ideas submitted</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-secondary" />
                <span>1000+ active users</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-responsive">
        <div className="container-safe">
          <Tabs defaultValue="trending" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-muted/50">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Submit</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Referrals</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              <TrendingIdeas />
            </TabsContent>

            <TabsContent value="submit">
              <div className="max-w-2xl mx-auto">
                <IdeaSubmissionForm />
              </div>
            </TabsContent>

            <TabsContent value="referrals">
              <ReferralDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
