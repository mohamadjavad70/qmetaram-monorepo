import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SUBDOMAIN_ROUTES: Record<string, string> = {
  app: "/dashboard",
  exchange: "/exchange",
  ai: "/ai",
  admin: "/admin",
  // 'samir' maps to '/' which is the default
};

const ROOT_DOMAINS = ["ble.app", "samir.com"];

export function useSubdomainRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    const match = hostname.match(/^([^.]+)\.([^.]+\.[^.]+)$/);
    if (!match) return;

    const [, subdomain, root] = match;
    if (!ROOT_DOMAINS.includes(root)) return;

    const targetRoute = SUBDOMAIN_ROUTES[subdomain];

    // Only redirect on root path to avoid breaking deep links
    if (targetRoute && location.pathname === '/') {
      navigate(targetRoute, { replace: true });
    }
  }, [navigate, location.pathname]);
}
