import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Unlock, Zap } from 'lucide-react';
import { useReferralTier } from '@/hooks/useReferralTier';
import { useReferrals } from '@/hooks/useReferrals';
import { useAuthContext } from '@/components/auth/AuthProvider';

export function ReferralTierCard() {
  const { isAuthenticated } = useAuthContext();
  const { stats } = useReferrals();
  const tier = useReferralTier(stats.totalReferrals);

  if (!isAuthenticated) return null;

  const progressToNext = tier.nextThreshold
    ? Math.min((stats.totalReferrals / tier.nextThreshold) * 100, 100)
    : 100;

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Referral Tier
          </CardTitle>
          <Badge className={`${tier.color} border-current`}>
            {tier.icon} {tier.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Invites: {stats.totalReferrals}</span>
          {tier.nextTier && (
            <span className="text-muted-foreground">Next: {tier.nextThreshold}</span>
          )}
        </div>
        {tier.nextThreshold && <Progress value={progressToNext} className="h-2" />}

        <div className="grid grid-cols-3 gap-2">
          {[
            { count: 3, label: '3 Agents', threshold: 100 },
            { count: 6, label: '6 Agents', threshold: 1000 },
            { count: 9, label: '9 Agents (Full Galaxy)', threshold: 10000 },
          ].map(({ count, label, threshold }) => {
            const unlocked = tier.agentsUnlocked >= count;
            return (
              <div
                key={count}
                className={`p-2 rounded-lg text-center text-xs ${
                  unlocked ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30 border border-border/50'
                }`}
              >
                {unlocked ? (
                  <Unlock className="h-4 w-4 mx-auto mb-1 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                )}
                <p className={unlocked ? 'text-primary font-medium' : 'text-muted-foreground'}>{label}</p>
                <p className="text-muted-foreground mt-0.5">{threshold}+ invites</p>
              </div>
            );
          })}
        </div>

        {tier.bonusNoor > 0 && (
          <div className="text-center text-sm text-yellow-400 font-medium">
            🎁 Bonus NOOR earned from referrals: +{tier.bonusNoor}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
