// QMETARAM API Service
// Handles communication with the external FastAPI backend

import { API_CONFIG, ENDPOINTS, getApiUrl } from "@/config/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  error_code?: string;
  message?: string;
  timestamp: string;
}

interface ChatRequest {
  messages: { role: string; content: string }[];
  module?: string;
  model?: string;
  fusion?: string[];
}

interface ModuleUIConfig {
  module_id: string;
  interface_style: string;
  visual_elements: string[];
  input_types: string[];
  tools: string[];
  color_scheme: Record<string, string>;
}

interface BrainVisualizationData {
  neurons: {
    id: string;
    position: { x: number; y: number; z: number };
    activity_level: number;
    color: string;
    connections: string[];
  }[];
  neural_activity: {
    timestamp: string;
    active_regions: string[];
    pulse_frequency: number;
    network_density: number;
  };
  animation_params: {
    rotation_speed: number;
    pulse_rate: number;
    glow_intensity: number;
  };
}

interface Theme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  background: string;
  text: string;
  accent: string;
}

interface AINews {
  news_id: string;
  title: string;
  title_fa: string;
  source: string;
  url: string;
  published_at: string;
  category: string;
  related_models: string[];
  summary: string;
  summary_fa: string;
}

interface IdeaSubmission {
  title: string;
  description: string;
  category: string;
  submitter_email?: string;
}

interface Idea {
  idea_id: string;
  title: string;
  description: string;
  category: string;
  referral_code: string;
  url: string;
  upvotes: number;
  status: string;
  created_at: string;
}

interface ReferralCode {
  code: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

interface ReferralStats {
  total_referrals: number;
  successful_conversions: number;
  pending_conversions: number;
  total_earnings: number;
  pending_earnings: number;
  referral_codes: ReferralCode[];
}

interface ProjectEvaluation {
  project_id: string;
  code_quality: number;
  architecture: number;
  performance: number;
  innovation: number;
  security: number;
  overall: number;
  recommendations: string[];
  technology_stack: string[];
  issues: { description: string; severity: string }[];
}

class QmetaramApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.EXTERNAL_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = getApiUrl(endpoint);
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`,
          error_code: errorData.error_code,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Platform endpoints
  async getPlatformStatus() {
    return this.request(ENDPOINTS.root);
  }

  async getHealth() {
    return this.request(ENDPOINTS.health);
  }

  async getModules() {
    return this.request<ModuleUIConfig[]>(ENDPOINTS.modules);
  }

  async getModuleUIConfig(moduleId: string) {
    return this.request<ModuleUIConfig>(ENDPOINTS.moduleUIConfig(moduleId));
  }

  // Chat endpoints (streaming handled separately)
  async chatWithModule(moduleId: string, request: ChatRequest) {
    return this.request(ENDPOINTS.chat(moduleId), {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async chatFusion(request: ChatRequest) {
    return this.request(ENDPOINTS.chatFusion, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // AI Marketplace
  async getMarketplace() {
    return this.request(ENDPOINTS.marketplace);
  }

  async getMarketplaceModel(modelId: string) {
    return this.request(ENDPOINTS.marketplaceModel(modelId));
  }

  async compareModels(modelIds: string[]) {
    return this.request(ENDPOINTS.marketplaceCompare, {
      method: "POST",
      body: JSON.stringify({ model_ids: modelIds }),
    });
  }

  async getMarketplaceNews() {
    return this.request<AINews[]>(ENDPOINTS.marketplaceNews);
  }

  // Project Evaluation
  async evaluateProject(formData: FormData) {
    const url = getApiUrl(ENDPOINTS.evaluateProject);
    const response = await fetch(url, {
      method: "POST",
      body: formData, // Don't set Content-Type for FormData
    });
    return response.json() as Promise<ApiResponse<ProjectEvaluation>>;
  }

  async getEvaluation(projectId: string) {
    return this.request<ProjectEvaluation>(ENDPOINTS.evaluation(projectId));
  }

  // Ideas
  async submitIdea(idea: IdeaSubmission) {
    return this.request<Idea>(ENDPOINTS.submitIdea, {
      method: "POST",
      body: JSON.stringify(idea),
    });
  }

  async getIdea(ideaId: string) {
    return this.request<Idea>(ENDPOINTS.idea(ideaId));
  }

  async getTrendingIdeas() {
    return this.request<Idea[]>(ENDPOINTS.trendingIdeas);
  }

  async upvoteIdea(ideaId: string) {
    return this.request<{ new_upvotes: number }>(ENDPOINTS.upvoteIdea(ideaId), {
      method: "POST",
    });
  }

  async getMyReferrals() {
    return this.request<ReferralStats>(ENDPOINTS.myReferrals);
  }

  // Themes
  async getThemes() {
    return this.request<Theme[]>(ENDPOINTS.themes);
  }

  async setTheme(themeId: string) {
    return this.request(ENDPOINTS.setTheme, {
      method: "POST",
      body: JSON.stringify({ theme_id: themeId }),
    });
  }

  // Languages
  async getLanguages() {
    return this.request(ENDPOINTS.languages);
  }

  async setLanguage(languageCode: string) {
    return this.request(ENDPOINTS.setLanguage, {
      method: "POST",
      body: JSON.stringify({ language: languageCode }),
    });
  }

  // Brain Visualization
  async getBrainVisualization() {
    return this.request<BrainVisualizationData>(ENDPOINTS.brainVisualization);
  }

  // Validation
  async validateActions() {
    return this.request(ENDPOINTS.validateActions, {
      method: "POST",
    });
  }
}

export const qmetaramApi = new QmetaramApiService();
export type {
  ApiResponse,
  ChatRequest,
  ModuleUIConfig,
  BrainVisualizationData,
  Theme,
  AINews,
  IdeaSubmission,
  Idea,
  ReferralStats,
  ReferralCode,
  ProjectEvaluation,
};
