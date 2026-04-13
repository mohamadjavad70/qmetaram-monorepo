import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Target, CheckCircle2, Clock, Sparkles, TrendingUp, Zap, Star, Vault, Loader2 } from 'lucide-react';
import MowlanaVortexChart from '@/components/dashboard/MowlanaVortexChart';
import { useQuery } from '@tanstack/react-query';

interface MissionRecord {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  reward_noor: number;
  created_at: string;
}

interface NoorClaimRecord {
  signup_claimed: boolean;
  total_referral_noor: number;
  total_mission_noor: number;
}

export default function Dashboard() {
  const { userHash } = useParams();
  const { user, isLoading: authLoading, isAuthenticated } = useAuthContext();
  const [missions, setMissions] = useState<MissionRecord[]>([]);
  const [noorClaim, setNoorClaim] = useState<NoorClaimRecord | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { data: reserveData } = useQuery({
    queryKey: ['system-reserves'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_reserves')
        .select('balance, label')
        .order('balance', { ascending: false });
      return data ?? [];
    },
    staleTime: 60_000,
  });

  // Verify hash ownership — if no hash in URL, user is accessing /dashboard directly (also valid)
  const expectedHash = user?.id?.slice(0, 8);
  const isOwner = !userHash || userHash === expectedHash;

  useEffect(() => {
    if (!user || !isOwner) return;

    const fetchData = async () => {
      const [missionsRes, claimsRes, referralsRes] = await Promise.all([
        supabase
          .from('daily_missions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('noor_claims')
          .select('signup_claimed, total_referral_noor, total_mission_noor')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('referral_codes')
          .select('uses_count')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (missionsRes.data) setMissions(missionsRes.data);
      if (claimsRes.data) setNoorClaim(claimsRes.data);
      if (referralsRes.data) setReferralCount(referralsRes.data.uses_count ?? 0);
      setLoading(false);
    };

    fetchData();
  }, [user, isOwner]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isOwner) return <Navigate to={`/dashboard/${expectedHash}`} replace />;

  const totalNoor = (noorClaim?.signup_claimed ? 1 : 0) + 
    (noorClaim?.total_referral_noor ?? 0) + 
    (noorClaim?.total_mission_noor ?? 0);

  const completedMissions = missions.filter(m => m.is_completed).length;
  const totalMissions = missions.length;
  const progressPercent = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  // Tier calculation
  const tierName = referralCount >= 10000 ? 'Galaxy' : referralCount >= 1000 ? 'Master' : referralCount >= 100 ? 'Elite' : referralCount >= 3 ? 'Power' : 'Basic';
  const tierColor = referralCount >= 10000 ? 'text-purple-400' : referralCount >= 1000 ? 'text-amber-400' : referralCount >= 100 ? 'text-cyan-400' : referralCount >= 3 ? 'text-green-400' : 'text-muted-foreground';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Private Workspace</h1>
            <p className="text-muted-foreground text-sm font-mono">Vault: {userHash}</p>
          </div>
          <Badge variant="outline" className={`ml-auto ${tierColor}`}>
            <Star className="h-3 w-3 mr-1" />
            {tierName} Tier
          </Badge>
        </div>

        {/* Growth Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold">Growth Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-3 mb-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>🌱 Newcomer</span>
              <span>⚡ Active Trader</span>
              <span>💎 Super Pro</span>
              <span>👑 Galaxy Leader</span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Backing Reserve */}
        {reserveData && reserveData.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/5 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Vault className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Q-Network Total Backing</p>
                    <p className="text-3xl font-bold font-mono text-amber-400">
                      ${reserveData.reduce((sum, r) => sum + Number(r.balance), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {reserveData.map((r) => (
                    <div key={r.label} className="text-xs text-muted-foreground">
                      {r.label}: <span className="font-mono font-medium text-foreground">${Number(r.balance).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* NOOR Balance */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-amber-400" />
                NOOR Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-400">{totalNoor.toFixed(1)} NOOR</p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Signup Bonus: {noorClaim?.signup_claimed ? '1.0' : '0.0'}</p>
                <p>Referral Rewards: {(noorClaim?.total_referral_noor ?? 0).toFixed(1)}</p>
                <p>Mission Rewards: {(noorClaim?.total_mission_noor ?? 0).toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Referral Stats */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-cyan-400" />
                Referral Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{referralCount}</p>
              <p className="text-sm text-muted-foreground">People Invited</p>
              <div className="mt-3 text-sm">
                <p className={tierColor}>
                  {referralCount < 3 ? `${3 - referralCount} more for Power Bonus (10 NOOR)` :
                   referralCount < 100 ? `${100 - referralCount} more for Elite (3 Agents)` :
                   referralCount < 1000 ? `${1000 - referralCount} more for Master (6 Agents)` :
                   referralCount < 10000 ? `${10000 - referralCount} more for Galaxy (All 9 Agents)` :
                   '🎉 Maximum Tier Reached!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                You have completed <strong>{Math.round(progressPercent)}%</strong> of your missions. 
                {progressPercent >= 80 
                  ? " Excellent work! Consider activating Agent Noor's Arbitrage mode for optimal portfolio growth."
                  : progressPercent >= 50
                  ? " Good progress! Complete more daily missions to unlock premium AI strategies."
                  : " Start with today's missions to build your growth trajectory."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mowlana Vortex 3-6-9 Chart */}
        <MowlanaVortexChart />

        {/* Missions History */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Mission History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : missions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No missions yet. Check the Dashboard to get started!</p>
            ) : (
              <div className="space-y-3">
                {missions.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      {m.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{m.title}</p>
                        {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={m.is_completed ? 'default' : 'secondary'} className="text-xs">
                        {m.is_completed ? 'Completed' : 'Pending'}
                      </Badge>
                      <p className="text-xs text-amber-400 mt-1">+{m.reward_noor} NOOR</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
