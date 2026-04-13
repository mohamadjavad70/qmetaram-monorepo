import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Exchange from "./pages/Exchange";
import Markets from "./pages/Markets";
import Tokens from "./pages/Tokens";
import TokenDetail from "./pages/TokenDetail";
import Referrals from "./pages/Referrals";
import AIAssistantPage from "./pages/AIAssistant";
import AIAgentHub from "./pages/AIAgentHub";
import AIGalaxy from "./pages/AIGalaxy";
import AIMarket from "./pages/AIMarket";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import WarRoom from "./pages/WarRoom";
import Memorial from "./pages/Memorial";
import PrivateInvite from "./pages/PrivateInvite";

// Legacy/public pages
import StarWorld from "./pages/StarWorld";
import QCore from "./pages/QCore";
import CommandCenter from "./pages/CommandCenter";
import Command from "./pages/Command";
import SunCorePage from "./pages/SunCore";
import CommandDashboard from "./pages/CommandDashboard";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/star/:slug" element={<StarWorld />} />
        <Route path="/q" element={<QCore />} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/command" element={<Command />} />
        <Route path="/sun-core" element={<SunCorePage />} />
        <Route path="/empire" element={<CommandDashboard />} />
        <Route path="/memorial" element={<Memorial />} />
        <Route path="/invite/:token" element={<PrivateInvite />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/:userHash" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
        <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
        <Route path="/tokens" element={<ProtectedRoute><Tokens /></ProtectedRoute>} />
        <Route path="/tokens/:id" element={<ProtectedRoute><TokenDetail /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
        <Route path="/ai-agents" element={<ProtectedRoute><AIAgentHub /></ProtectedRoute>} />
        <Route path="/ai-galaxy" element={<ProtectedRoute><AIGalaxy /></ProtectedRoute>} />
        <Route path="/ai-market" element={<ProtectedRoute><AIMarket /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/war-room" element={<ProtectedRoute><WarRoom /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const src = event.filename || "";
      const msg = event.message || "";
      if (
        src.includes("chrome-extension://") ||
        src.includes("moz-extension://") ||
        msg.includes("ethereum") ||
        msg.includes("Cannot redefine property")
      ) {
        event.preventDefault();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message || event.reason || "");
      const stack = String(event.reason?.stack || "");
      if (
        msg.includes("MetaMask") ||
        msg.includes("ethereum") ||
        msg.includes("func sseError not found") ||
        msg.includes("Cannot redefine property") ||
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
