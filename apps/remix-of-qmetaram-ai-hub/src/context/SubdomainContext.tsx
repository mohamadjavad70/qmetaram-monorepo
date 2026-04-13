import { createContext, useContext, ReactNode, useMemo } from "react";

interface SubdomainContextType {
  subdomain: string;
}

const SubdomainContext = createContext<SubdomainContextType>({ subdomain: "app" });

export const useSubdomain = () => useContext(SubdomainContext);

function extractSubdomain(): string {
  const hostname = window.location.hostname;
  // localhost or IP → default
  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return "app";
  }
  // Remove .qmetaram.com or .lovable.app
  const parts = hostname.replace(/:\d+$/, "").split(".");
  if (parts.length >= 3) {
    return parts[0];
  }
  return "app";
}

export const SubdomainProvider = ({ children }: { children: ReactNode }) => {
  const subdomain = useMemo(() => extractSubdomain(), []);

  return (
    <SubdomainContext.Provider value={{ subdomain }}>
      {children}
    </SubdomainContext.Provider>
  );
};
