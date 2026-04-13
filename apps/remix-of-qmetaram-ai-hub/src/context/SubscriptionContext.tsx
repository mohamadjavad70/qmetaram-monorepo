import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "pro" | "business";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isProUser: boolean;
  isBusinessUser: boolean;
  isAdmin: boolean;
  loading: boolean;
  subscriptionEnd: string | null;
  features: {
    fusionMode: boolean;
    voiceCommands: boolean;
    fileUploads: boolean;
    imageGeneration: boolean;
    musicGeneration: boolean;
    codeExport: boolean;
    dockerExport: boolean;
    githubExport: boolean;
    brandKits: boolean;
    videoExport: boolean;
    audioStems: boolean;
    ideaValidation: boolean;
    revenueModeling: boolean;
    pitchDeck: boolean;
    goToMarket: boolean;
    monetizationRoadmap: boolean;
  };
  refreshSubscription: () => Promise<void>;
}

const defaultFeatures = {
  fusionMode: false,
  voiceCommands: false,
  fileUploads: true,
  imageGeneration: true,
  musicGeneration: true,
  codeExport: false,
  dockerExport: false,
  githubExport: false,
  brandKits: false,
  videoExport: false,
  audioStems: false,
  ideaValidation: false,
  revenueModeling: false,
  pitchDeck: false,
  goToMarket: false,
  monetizationRoadmap: false,
};

const proFeatures = {
  ...defaultFeatures,
  fusionMode: true,
  voiceCommands: true,
  codeExport: true,
  dockerExport: true,
  githubExport: true,
  brandKits: true,
  videoExport: true,
  audioStems: true,
};

const businessFeatures = {
  ...proFeatures,
  ideaValidation: true,
  revenueModeling: true,
  pitchDeck: true,
  goToMarket: true,
  monetizationRoadmap: true,
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: "free",
  isProUser: false,
  isBusinessUser: false,
  isAdmin: false,
  loading: true,
  subscriptionEnd: null,
  features: defaultFeatures,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

// Admin email - this user always has full access
const ADMIN_EMAIL = "admin@qmetaram.com";

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setTier("free");
        setIsAdmin(false);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      const user = session.user;

      // Check if user is admin (always has full access)
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setTier("business");
        setLoading(false);
        return;
      }

      // Call check-subscription edge function
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setTier("free");
        setLoading(false);
        return;
      }

      if (data) {
        const newTier = (data.tier as SubscriptionTier) || "free";
        setTier(newTier);
        setSubscriptionEnd(data.subscription_end || null);
        console.log("Subscription status:", data);
      }
      
      setIsAdmin(false);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setTier("free");
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSubscription();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshSubscription();
    });

    // Refresh subscription every 60 seconds
    const interval = setInterval(refreshSubscription, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [refreshSubscription]);

  const isProUser = tier === "pro" || tier === "business" || isAdmin;
  const isBusinessUser = tier === "business" || isAdmin;

  const features = isAdmin || tier === "business" 
    ? businessFeatures 
    : tier === "pro" 
      ? proFeatures 
      : defaultFeatures;

  return (
    <SubscriptionContext.Provider 
      value={{ 
        tier, 
        isProUser, 
        isBusinessUser, 
        isAdmin,
        loading, 
        subscriptionEnd,
        features,
        refreshSubscription 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
