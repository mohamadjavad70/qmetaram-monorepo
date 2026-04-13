import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Simple User-Agent similarity check.
 * Extracts browser + OS tokens and checks overlap ratio.
 */
const isUserAgentSuspicious = (current: string, previous: string): boolean => {
  const extractTokens = (ua: string) => {
    const tokens = ua.toLowerCase().match(/\b(chrome|firefox|safari|edge|opera|msie|trident|android|iphone|ipad|windows|macintosh|linux)\b/g);
    return new Set(tokens || []);
  };
  const currentTokens = extractTokens(current);
  const prevTokens = extractTokens(previous);
  if (currentTokens.size === 0 || prevTokens.size === 0) return false;
  
  let overlap = 0;
  currentTokens.forEach(t => { if (prevTokens.has(t)) overlap++; });
  const similarity = overlap / Math.max(currentTokens.size, prevTokens.size);
  return similarity < 0.5; // Less than 50% overlap = suspicious
};

export const useLoginEventLogger = () => {
  const logged = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== 'SIGNED_IN' || !session?.user || logged.current) return;
      logged.current = true;

      const userId = session.user.id;
      const userAgent = navigator.userAgent;

      // Fetch rough geo from a free API (best-effort)
      let country: string | null = null;
      let city: string | null = null;
      let ipAddress: string | null = null;
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const geo = await res.json();
          country = geo.country_name ?? null;
          city = geo.city ?? null;
          ipAddress = geo.ip ?? null;
        }
      } catch {
        // geo lookup failed, proceed without it
      }

      // Check last 3 logins for suspicious changes
      let isSuspicious = false;
      let suspiciousReason: string | null = null;

      try {
        const { data: recentLogins } = await supabase
          .from('login_events')
          .select('country, city, user_agent')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentLogins && recentLogins.length > 0) {
          const lastLogin = recentLogins[0];

          // Country change detection
          if (country && lastLogin.country && country !== lastLogin.country) {
            isSuspicious = true;
            suspiciousReason = `Country changed: ${lastLogin.country} → ${country}`;
          }
          // City change (info level)
          else if (city && lastLogin.city && city !== lastLogin.city) {
            suspiciousReason = `City changed: ${lastLogin.city} → ${city}`;
          }

          // User-Agent change detection against recent logins
          const uaChanged = recentLogins.every(
            login => login.user_agent && isUserAgentSuspicious(userAgent, login.user_agent)
          );
          if (uaChanged && recentLogins.length >= 2) {
            isSuspicious = true;
            suspiciousReason = (suspiciousReason ? suspiciousReason + ' | ' : '') +
              `Device/browser changed significantly from last ${recentLogins.length} logins`;
          }
        }
      } catch {
        // comparison failed, not critical
      }

      // Insert login event
      await supabase.from('login_events').insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        country,
        city,
        is_suspicious: isSuspicious,
        suspicious_reason: suspiciousReason,
      });
    });

    return () => {
      subscription.unsubscribe();
      logged.current = false;
    };
  }, []);
};