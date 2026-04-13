import { useMemo } from 'react';

interface TierInfo {
  name: string;
  label: string;
  color: string;
  agentsUnlocked: number;
  nextTier: string | null;
  nextThreshold: number | null;
  icon: string;
}

const TIERS: Record<string, TierInfo> = {
  basic: { name: 'basic', label: 'Basic', color: 'text-muted-foreground', agentsUnlocked: 1, nextTier: 'power', nextThreshold: 3, icon: '🌱' },
  power: { name: 'power', label: 'Power', color: 'text-blue-400', agentsUnlocked: 1, nextTier: 'elite', nextThreshold: 100, icon: '⚡' },
  elite: { name: 'elite', label: 'Elite', color: 'text-purple-400', agentsUnlocked: 3, nextTier: 'master', nextThreshold: 1000, icon: '💎' },
  master: { name: 'master', label: 'Master', color: 'text-yellow-400', agentsUnlocked: 6, nextTier: 'galaxy', nextThreshold: 10000, icon: '👑' },
  galaxy: { name: 'galaxy', label: 'Galaxy Commander', color: 'text-primary', agentsUnlocked: 9, nextTier: null, nextThreshold: null, icon: '🌌' },
};

export const useReferralTier = (inviteCount: number) => {
  return useMemo(() => {
    let tierName: string;
    if (inviteCount >= 10000) tierName = 'galaxy';
    else if (inviteCount >= 1000) tierName = 'master';
    else if (inviteCount >= 100) tierName = 'elite';
    else if (inviteCount >= 3) tierName = 'power';
    else tierName = 'basic';

    const tier = TIERS[tierName];
    const bonusNoor = inviteCount >= 3 ? 10 + Math.floor(inviteCount / 10) : 0;

    return { ...tier, inviteCount, bonusNoor };
  }, [inviteCount]);
};
