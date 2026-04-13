import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, DollarSign, TrendingUp, Brain, Activity, MessageCircle } from 'lucide-react';
import { useAIAgent, useAgentTradeLogs, useAgentLearning } from '@/hooks/useAIAgents';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AgentChat } from '@/components/ai/AgentChat';
import { InvestInAgent } from '@/components/ai/InvestInAgent';

export default function AIAgentHub() {
  const { slug } = useParams<{ slug: string }>();
  const { data: agent, isLoading } = useAIAgent(slug || '');
  const { data: tradeLogs } = useAgentTradeLogs(agent?.id);
  const { data: lessons } = useAgentLearning(agent?.id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!agent) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Agent not found</p>
          <Link to="/ai"><Button variant="outline" className="mt-4">Back to Galaxy</Button></Link>
        </div>
      </MainLayout>
    );
  }

  const pnlPositive = Number(agent.total_pnl) >= 0;

  // Generate simulated PnL chart data
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const base = Number(agent.initial_capital);
    const variance = (Math.random() - 0.45) * base * 0.02;
    return {
      hour: `${i}:00`,
      value: base + variance * (i + 1),
    };
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/ai">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="text-4xl">{agent.icon_emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                {agent.status === 'active' ? '🟢 Active' : '🔵 Learning'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{agent.specialty}</p>
          </div>
          {agent.token_symbol && (
            <Badge variant="outline" className="text-lg px-4 py-1.5">{agent.token_symbol}</Badge>
          )}
        </div>

        {/* Capital Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-panel border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" /> Initial Capital
              </div>
              <p className="text-2xl font-bold mono-text">${Number(agent.initial_capital).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Activity className="h-4 w-4" /> Current Value
              </div>
              <p className="text-2xl font-bold mono-text">${Number(agent.current_balance).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" /> Total PnL
              </div>
              <p className={`text-2xl font-bold mono-text ${pnlPositive ? 'text-green-400' : 'text-destructive'}`}>
                {pnlPositive ? '+' : ''}${Number(agent.total_pnl).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Brain className="h-4 w-4" /> Risk Level
              </div>
              <p className="text-2xl font-bold capitalize">{agent.risk_level}</p>
            </CardContent>
          </Card>
        </div>

        {/* PnL Chart */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-sm">Performance (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, 'Value']}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invest */}
        <InvestInAgent agentId={agent.id} agentName={agent.name} tokenSymbol={agent.token_symbol} />

        {/* Chat */}
        <AgentChat agentId={agent.id} agentName={agent.name} agentSlug={agent.slug} />

        {/* Tabs: Trade Logs, Learning, Strategy */}
        <Tabs defaultValue="logs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Decision Log</TabsTrigger>
            <TabsTrigger value="learning">Learning Vault</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-4">
            <Card className="glass-panel">
              <CardContent className="p-4">
                <ScrollArea className="h-72">
                  {tradeLogs && tradeLogs.length > 0 ? (
                    <div className="space-y-2">
                      {tradeLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/30 text-sm">
                          <Badge variant={log.action === 'buy' ? 'default' : log.action === 'sell' ? 'destructive' : 'secondary'} className="w-12 justify-center">
                            {log.action.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{log.asset_symbol}</span>
                          <span className="mono-text text-muted-foreground">${Number(log.amount).toLocaleString()}</span>
                          <span className="flex-1 text-xs text-muted-foreground truncate">{log.reasoning}</span>
                          {log.pnl !== null && (
                            <span className={`mono-text text-xs ${Number(log.pnl) >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                              {Number(log.pnl) >= 0 ? '+' : ''}${Number(log.pnl).toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p>{agent.name} is analyzing markets...</p>
                      <p className="text-xs mt-1">Trade logs will appear here in real-time</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="mt-4">
            <Card className="glass-panel">
              <CardContent className="p-4">
                <ScrollArea className="h-72">
                  {lessons && lessons.length > 0 ? (
                    <div className="space-y-3">
                      {lessons.map((l) => (
                        <div key={l.id} className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                          <p className="text-sm">{l.lesson}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Confidence: {Number(l.confidence_before).toFixed(0)}% → {Number(l.confidence_after).toFixed(0)}%</span>
                            <span>{new Date(l.cycle_timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p>Learning cycles will be recorded here</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy" className="mt-4">
            <Card className="glass-panel">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Strategy Prompt</h3>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 font-mono text-sm whitespace-pre-wrap">
                  {agent.strategy_prompt || 'No strategy defined.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
