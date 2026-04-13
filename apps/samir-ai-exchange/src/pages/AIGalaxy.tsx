import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';

const riskColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AIGalaxy() {
  const { data: agents, isLoading } = useAIAgents();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold gradient-text">Samir AI Galaxy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            9 Autonomous Trading Agents — Each with $30,000 managed capital and a unique strategy
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> Learning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-muted" /> Idle
            </span>
          </div>
        </div>

        {/* Galaxy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents?.map((agent) => {
            const pnlPositive = Number(agent.total_pnl) >= 0;
            return (
              <Link key={agent.id} to={`/ai/${agent.slug}`}>
                <Card className="glass-panel border-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-glow-sm cursor-pointer group h-full">
                  <CardContent className="p-5 space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{agent.icon_emoji}</div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{agent.name}</h3>
                          <p className="text-xs text-muted-foreground">{agent.specialty}</p>
                        </div>
                      </div>
                      {/* Pulse */}
                      <span className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                    </div>

                    {/* Capital */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-lg bg-secondary/40">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capital</p>
                        <p className="mono-text font-bold">${Number(agent.initial_capital).toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-secondary/40">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
                        <p className="mono-text font-bold">${Number(agent.current_balance).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* PnL & Token */}
                    <div className="flex items-center justify-between">
                      <Badge variant={pnlPositive ? 'default' : 'destructive'} className="mono-text">
                        {pnlPositive ? '+' : ''}{Number(agent.pnl_percent).toFixed(2)}%
                      </Badge>
                      <Badge variant="outline" className={riskColors[agent.risk_level] || ''}>
                        {agent.risk_level.toUpperCase()}
                      </Badge>
                      {agent.token_symbol && (
                        <span className="text-xs text-muted-foreground">{agent.token_symbol}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
