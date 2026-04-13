import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { useAssets } from '@/hooks/useAssets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, DollarSign, Users, Activity, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPayoutApprovals } from '@/components/admin/AdminPayoutApprovals';
import { QuantumRaceLeaderboard } from '@/components/warroom/QuantumRaceLeaderboard';
import { GlobalPayroll } from '@/components/warroom/GlobalPayroll';
import { GlobalCardApprovals } from '@/components/warroom/GlobalCardApprovals';

const WarRoom = () => {
  const { isAdmin, isLoading } = useAdmin();
  const navigate = useNavigate();
  const { data: assets } = useAssets();

  const { data: pools } = useQuery({
    queryKey: ['liquidity-pools-war'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_pools')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: signals } = useQuery({
    queryKey: ['trading-signals-war'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_intelligence')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) return null;

  const totalPoolValue = pools?.reduce((sum, p) => sum + Number(p.base_balance || 0) + Number(p.quote_balance || 0), 0) || 0;
  const platformTokens = assets?.filter(a => a.is_platform_token) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">War Room</h1>
            <p className="text-muted-foreground">Executive Command Center — Liquidity & Intelligence</p>
          </div>
          <Badge variant="destructive" className="ml-auto animate-pulse">LIVE</Badge>
        </div>

        {/* Treasury Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-panel border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> System Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mono-text gradient-text">$101,000,000</p>
              <p className="text-xs text-muted-foreground mt-1">Locked in Liquidity Pools</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Executive Treasury
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mono-text gradient-text">$10,000,000</p>
              <p className="text-xs text-muted-foreground mt-1">Operations & Payroll Reserve</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Active Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mono-text">{pools?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pool Value: <span className="mono-text">${totalPoolValue.toLocaleString()}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Impact (Payouts) / Tokens / Intelligence */}
        <Tabs defaultValue="race">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="race" className="gap-2">
              <Activity className="h-4 w-4" /> Quantum Race
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <Users className="h-4 w-4" /> Payroll
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <CreditCard className="h-4 w-4" /> Card Approvals
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-2">
              <CreditCard className="h-4 w-4" /> Payouts
            </TabsTrigger>
            <TabsTrigger value="tokens" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Tokens
            </TabsTrigger>
            <TabsTrigger value="signals" className="gap-2">
              <Users className="h-4 w-4" /> Signals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="race" className="mt-4">
            <QuantumRaceLeaderboard />
          </TabsContent>

          <TabsContent value="payroll" className="mt-4">
            <GlobalPayroll />
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            <GlobalCardApprovals />
          </TabsContent>

          <TabsContent value="impact" className="mt-4">
            <AdminPayoutApprovals />
          </TabsContent>

          <TabsContent value="tokens" className="mt-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Platform Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {platformTokens.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {platformTokens.map(token => (
                      <div key={token.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{token.icon_emoji}</span>
                          <span className="font-semibold">{token.symbol}</span>
                        </div>
                        <p className="mono-text text-lg">${Number(token.current_price_usd).toFixed(2)}</p>
                        <p className={`text-xs ${Number(token.price_change_24h) >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                          {Number(token.price_change_24h) >= 0 ? '+' : ''}{Number(token.price_change_24h).toFixed(2)}%
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No platform tokens configured yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="mt-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Active AI Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {signals && signals.length > 0 ? (
                  <div className="space-y-2">
                    {signals.map(sig => (
                      <div key={sig.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                        <div className="flex items-center gap-3">
                          <Badge variant={sig.signal_type === 'buy' ? 'default' : sig.signal_type === 'sell' ? 'destructive' : 'secondary'}>
                            {sig.signal_type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{sig.asset_symbol}</span>
                          <span className="text-xs text-muted-foreground">by {sig.agent_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="mono-text text-sm">{Number(sig.confidence).toFixed(0)}%</span>
                          <Badge variant="outline" className="text-xs">{sig.risk_level}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active trading signals.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default WarRoom;
