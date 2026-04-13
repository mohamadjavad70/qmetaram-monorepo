import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown } from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';

export function QuantumRaceLeaderboard() {
  const { data: agents, isLoading } = useAIAgents();

  if (isLoading || !agents) return null;

  const sorted = [...agents].sort((a, b) => Number(b.total_pnl) - Number(a.total_pnl));

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Quantum Race — 1hr Leaderboard
          <Badge variant="destructive" className="ml-auto animate-pulse text-xs">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((agent, i) => {
            const pnl = Number(agent.total_pnl);
            const isAlpha = i === 0 && pnl > 0;
            return (
              <div
                key={agent.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isAlpha
                    ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]'
                    : 'bg-secondary/30 border-border/30'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-500/30 text-yellow-400' :
                  i === 1 ? 'bg-gray-400/20 text-gray-400' :
                  i === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {i + 1}
                </span>
                <span className="text-xl">{agent.icon_emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{agent.name}</span>
                    {isAlpha && <Crown className="h-4 w-4 text-yellow-400" />}
                    {isAlpha && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">ALPHA</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{agent.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="mono-text text-sm font-bold">${Number(agent.current_balance).toLocaleString()}</p>
                  <p className={`mono-text text-xs ${pnl >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
