import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SEO } from "@/components/SEO";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { SubdomainProvider } from "@/context/SubdomainContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Marketplace from "./pages/Marketplace";
import AITools from "./pages/AITools";
import AIModelDetail from "./pages/AIModelDetail";
import Compare from "./pages/Compare";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleChat from "./pages/ModuleChat";
import Q1Landing from "./pages/Q1Landing";
import Ideas from "./pages/Ideas";
import About from "./pages/About";
import Vision from "./pages/Vision";
import Team from "./pages/Team";
import Nodes from "./pages/Nodes";
import DeviceControl from "./pages/DeviceControl";
import Subscriptions from "./pages/Subscriptions";
import BiruniChat from "./pages/BiruniChat";
import BeethovenStudio from "./pages/BeethovenStudio";
import DaVinciStudio from "./pages/DaVinciStudio";
import QmetaramCore from "./pages/QmetaramCore";
import MatrixStudio from "./pages/MatrixStudio";
import QNetwork from "./pages/QNetwork";
import SamerExchange from "./pages/SamerExchange";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";
import BiruniModule from "./pages/modules/BiruniModule";
import BeethovenModule from "./pages/modules/BeethovenModule";
import DaVinciModule from "./pages/modules/DaVinciModule";
import { useAnalytics } from "./hooks/useAnalytics";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { ReactNode } from "react";
import type { SeoPageKey } from "@/i18n/seo-content";

const queryClient = new QueryClient();

const AppInitializer = () => {
  useAnalytics();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
};

const RouteWithSeo = ({ pageKey, children }: { pageKey: SeoPageKey; children: ReactNode }) => (
  <>
    <SEO pageKey={pageKey} />
    {children}
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <SubdomainProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppInitializer />
              {!isSupabaseConfigured && (
                <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Supabase env is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a .env file. Public pages can render, but auth, chat, and subscription features will not work until configured.
                </div>
              )}
              <Routes>
                {/* Public */}
                <Route path="/" element={<RouteWithSeo pageKey="home"><Index /></RouteWithSeo>} />
                <Route path="/about" element={<RouteWithSeo pageKey="about"><About /></RouteWithSeo>} />
                <Route path="/vision" element={<RouteWithSeo pageKey="vision"><Vision /></RouteWithSeo>} />
                <Route path="/team" element={<RouteWithSeo pageKey="team"><Team /></RouteWithSeo>} />
                <Route path="/nodes" element={<RouteWithSeo pageKey="nodes"><Nodes /></RouteWithSeo>} />
                <Route path="/q-agent" element={<RouteWithSeo pageKey="q-agent"><DeviceControl /></RouteWithSeo>} />
                <Route path="/auth" element={<RouteWithSeo pageKey="auth"><Auth /></RouteWithSeo>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/update-password" element={<RouteWithSeo pageKey="auth"><Auth /></RouteWithSeo>} />
                <Route path="/pricing" element={<RouteWithSeo pageKey="pricing"><Pricing /></RouteWithSeo>} />
                <Route path="/chat" element={<RouteWithSeo pageKey="chat"><Chat /></RouteWithSeo>} />
                <Route path="/marketplace" element={<RouteWithSeo pageKey="marketplace"><Marketplace /></RouteWithSeo>} />
                <Route path="/ai-tools" element={<RouteWithSeo pageKey="ai-tools"><AITools /></RouteWithSeo>} />
                <Route path="/ai-model/:id" element={<AIModelDetail />} />
                <Route path="/compare" element={<RouteWithSeo pageKey="compare"><Compare /></RouteWithSeo>} />
                <Route path="/modules/:id" element={<ModuleDetail />} />
                <Route path="/modules/:id/chat" element={<RouteWithSeo pageKey="module-chat"><ModuleChat /></RouteWithSeo>} />
                <Route path="/q1" element={<RouteWithSeo pageKey="q1"><Q1Landing /></RouteWithSeo>} />
                <Route path="/ideas" element={<RouteWithSeo pageKey="ideas"><Ideas /></RouteWithSeo>} />
                <Route path="/subscriptions" element={<RouteWithSeo pageKey="subscriptions"><Subscriptions /></RouteWithSeo>} />
                <Route path="/biruni" element={<RouteWithSeo pageKey="biruni"><BiruniChat /></RouteWithSeo>} />
                <Route path="/beethoven" element={<RouteWithSeo pageKey="beethoven"><BeethovenStudio /></RouteWithSeo>} />
                <Route path="/davinci" element={<RouteWithSeo pageKey="davinci"><DaVinciStudio /></RouteWithSeo>} />
                <Route path="/core" element={<RouteWithSeo pageKey="core"><QmetaramCore /></RouteWithSeo>} />
                <Route path="/matrix" element={<RouteWithSeo pageKey="matrix"><MatrixStudio /></RouteWithSeo>} />
                <Route path="/q-network" element={<RouteWithSeo pageKey="q-network"><QNetwork /></RouteWithSeo>} />
                <Route path="/samer" element={<RouteWithSeo pageKey="samer"><SamerExchange /></RouteWithSeo>} />

                {/* Protected */}
                <Route path="/dashboard" element={<RouteWithSeo pageKey="dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></RouteWithSeo>} />
                <Route path="/dashboard/agents" element={<RouteWithSeo pageKey="agents"><ProtectedRoute><Agents /></ProtectedRoute></RouteWithSeo>} />
                <Route path="/settings" element={<RouteWithSeo pageKey="settings"><ProtectedRoute><Settings /></ProtectedRoute></RouteWithSeo>} />
                <Route path="/modules/biruni/chat" element={<RouteWithSeo pageKey="biruni-module"><ProtectedRoute><BiruniModule /></ProtectedRoute></RouteWithSeo>} />
                <Route path="/modules/beethoven/chat" element={<RouteWithSeo pageKey="beethoven-module"><ProtectedRoute><BeethovenModule /></ProtectedRoute></RouteWithSeo>} />
                <Route path="/modules/da-vinci/chat" element={<RouteWithSeo pageKey="da-vinci-module"><ProtectedRoute><DaVinciModule /></ProtectedRoute></RouteWithSeo>} />

                <Route path="*" element={<RouteWithSeo pageKey="not-found"><NotFound /></RouteWithSeo>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </SubdomainProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
