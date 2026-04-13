import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Bot, Zap, Shield, BarChart3, 
  ArrowUpRight, ArrowDownRight, Activity, Brain, Target 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface AgentMarketData {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  risk_level: string;
  icon_emoji: string;
  current_balance: number;
  initial_capital: number;
  total_pnl: number;
  pnl_percent: number;
  token_symbol: string | null;
  status: string;
}

function useAgentMarket() {
  return useQuery({
    queryKey: ['ai-market-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('status', 'active')
        .order('pnl_percent', { ascending: false });
      if (error) throw error;
      return data as AgentMarketData[];
    },
  });
}

function useRecentTrades() {
  return useQuery({
    queryKey: ['ai-market-trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_trade_logs')
        .select('*, ai_agents(name, icon_emoji)')
        .order('created_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'bg-success/20 text-success border-success/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    high: 'bg-destructive/20 text-destructive border-destructive/30',
  };
  return <Badge variant="outline" className={colors[level] || colors.medium}>{level}</Badge>;
}

export default function AIMarket() {
  const { data: agents, isLoading } = useAgentMarket();
  const { data: trades } = useRecentTrades();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const totalMarketCap = agents?.reduce((sum, a) => sum + a.current_balance, 0) || 0;
  const avgPnl = agents && agents.length > 0 
    ? agents.reduce((sum, a) => sum + a.pnl_percent, 0) / agents.length 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Internal Market
          </h1>
          <p className="text-muted-foreground mt-1">
            هوش‌های مصنوعی روی هم سرمایه‌گذاری می‌کنند • Watch AI agents trade and invest in each other
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total AUM</p>
              <p className="text-xl font-bold font-mono text-primary">
                ${totalMarketCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Active Agents</p>
              <p className="text-xl font-bold">{agents?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg PnL</p>
              <p className={`text-xl font-bold ${avgPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {avgPnl >= 0 ? '+' : ''}{avgPnl.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Recent Trades</p>
              <p className="text-xl font-bold">{trades?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leaderboard">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
            <TabsTrigger value="trades">📊 Live Trades</TabsTrigger>
          </TabsList>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-3 mt-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              agents?.map((agent, idx) => {
                const isProfit = agent.pnl_percent >= 0;
                const balancePercent = (agent.current_balance / (agent.initial_capital * 2)) * 100;

                return (
                  <Card
                    key={agent.id}
                    className={`glass-panel transition-all hover:border-primary/40 cursor-pointer ${
                      selectedAgent === agent.id ? 'border-primary ring-1 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                          idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </div>

                        {/* Agent Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{agent.icon_emoji}</span>
                            <h3 className="font-bold truncate">{agent.name}</h3>
                            <RiskBadge level={agent.risk_level} />
                            {agent.token_symbol && (
                              <Badge variant="outline" className="text-xs">
                                ${agent.token_symbol}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{agent.specialty}</p>
                          <Progress value={Math.min(balancePercent, 100)} className="h-1.5 mt-2" />
                        </div>

                        {/* PnL */}
                        <div className="text-right">
                          <div className={`flex items-center gap-1 ${isProfit ? 'text-success' : 'text-destructive'}`}>
                            {isProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            <span className="font-bold text-lg">{isProfit ? '+' : ''}{agent.pnl_percent.toFixed(2)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            ${agent.current_balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedAgent === agent.id && (
                        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-secondary/30">
                            <p className="text-xs text-muted-foreground">Initial Capital</p>
                            <p className="font-bold font-mono">${agent.initial_capital.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-secondary/30">
                            <p className="text-xs text-muted-foreground">Total PnL</p>
                            <p className={`font-bold font-mono ${isProfit ? 'text-success' : 'text-destructive'}`}>
                              {isProfit ? '+' : ''}${agent.total_pnl.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center">
                            <Link to={`/ai/${agent.slug}`}>
                              <Button size="sm" className="w-full gap-1">
                                <Target className="h-3 w-3" /> View Agent
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Live Trades */}
          <TabsContent value="trades" className="space-y-2 mt-4">
            {trades?.map((trade: any) => (
              <Card key={trade.id} className="glass-panel">
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-lg">{trade.ai_agents?.icon_emoji || '🤖'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{trade.ai_agents?.name}</span>
                      <Badge variant={trade.action === 'buy' ? 'default' : 'secondary'} className="text-xs">
                        {trade.action.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-mono">{trade.asset_symbol}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {trade.reasoning || 'Automated trade signal'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">${Number(trade.amount).toFixed(2)}</p>
                    {trade.pnl !== null && (
                      <p className={`text-xs font-mono ${Number(trade.pnl) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {Number(trade.pnl) >= 0 ? '+' : ''}${Number(trade.pnl).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(trade.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </CardContent>
              </Card>
            ))}
            {(!trades || trades.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent trades recorded yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
