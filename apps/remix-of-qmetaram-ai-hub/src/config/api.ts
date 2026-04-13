// API Configuration for QMETARAM Platform
// Supports both external FastAPI backend and Supabase edge functions

export const API_CONFIG = {
  // External FastAPI backend on Hetzner VPS
  // Set to your domain once deployed: https://qmetaram.com
  EXTERNAL_API_URL: import.meta.env.VITE_EXTERNAL_API_URL || "https://qmetaram.com",
  
  // Supabase edge function fallback
  SUPABASE_API_URL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
  
  // Use external API when available
  USE_EXTERNAL_API: import.meta.env.VITE_USE_EXTERNAL_API === "true",
};

// API Endpoints mapping
export const ENDPOINTS = {
  // Chat endpoints
  chat: (module: string) => `/chat/${module}`,
  chatFusion: "/chat/fusion",
  
  // Platform info
  root: "/",
  health: "/health",
  modules: "/modules",
  moduleUIConfig: (module: string) => `/modules/${module}/ui-config`,
  
  // AI Marketplace
  marketplace: "/ai-marketplace",
  marketplaceModel: (modelId: string) => `/ai-marketplace/${modelId}`,
  marketplaceCompare: "/ai-marketplace/compare",
  marketplaceTest: "/ai-marketplace/test",
  marketplaceNews: "/ai-marketplace/news",
  
  // Project Evaluation
  evaluateProject: "/evaluate-project",
  evaluation: (projectId: string) => `/evaluations/${projectId}`,
  
  // Ideas
  submitIdea: "/ideas/submit",
  idea: (ideaId: string) => `/ideas/${ideaId}`,
  trendingIdeas: "/ideas/trending",
  upvoteIdea: (ideaId: string) => `/ideas/${ideaId}/upvote`,
  myReferrals: "/ideas/my-referrals",
  
  // Themes & Languages
  themes: "/themes",
  setTheme: "/themes/set",
  languages: "/languages",
  setLanguage: "/languages/set",
  
  // Token
  tokenPrice: "/token-price",
  tokenStats: "/token/stats",
  tokenModules: "/token-modules",
  
  // Brain Visualization
  brainVisualization: "/brain-visualization",
  
  // Validation
  validateActions: "/validate-actions",
};

// Build full URL based on configuration
export function getApiUrl(endpoint: string): string {
  if (API_CONFIG.USE_EXTERNAL_API) {
    return `${API_CONFIG.EXTERNAL_API_URL}${endpoint}`;
  }
  return `${API_CONFIG.SUPABASE_API_URL}${endpoint}`;
}

// Get chat URL (special case - can route to external or Supabase)
export function getChatUrl(): string {
  // Chat is pinned to Supabase Edge Function for stable SSE streaming behavior.
  return `${API_CONFIG.SUPABASE_API_URL}/ai-chat`;
}

export function getSupabaseFunctionHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (publishableKey) {
    headers.apikey = publishableKey;
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}
