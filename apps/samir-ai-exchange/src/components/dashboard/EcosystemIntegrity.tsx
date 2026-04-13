import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, TrendingUp, Banknote } from 'lucide-react';

export function EcosystemIntegrity() {
  const tvl = 101_000_000;
  const treasury = 10_000_000;
  const aiCapital = 270_000;
  const tvlProgress = 82; // simulated TVL fill

  return (
    <Card className="glass-panel border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-green-500/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Ecosystem Integrity</h3>
              <p className="text-xs text-muted-foreground">Samir Master Treasury — Verified Backing</p>
            </div>
          </div>
          <Badge variant="outline" className="border-green-500/30 text-green-400 gap-1">
            <Lock className="h-3 w-3" />
            VERIFIED
          </Badge>
        </div>

        {/* Liquidity Certificate */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Banknote className="h-4 w-4" />
              System Liquidity Pool
            </span>
            <span className="text-2xl font-bold mono-text text-green-400">
              ${tvl.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Liquidity Certificate: System pool secured at $101,000,000 — backed by Samir Master Treasury
          </p>
        </div>

        {/* TVL Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Total Value Locked (TVL)
            </span>
            <span className="mono-text font-medium">{tvlProgress}%</span>
          </div>
          <Progress value={tvlProgress} className="h-3" />
          <p className="text-[10px] text-muted-foreground">
            Supported by Samir Master Treasury • Executive Reserve: ${treasury.toLocaleString()} • AI Capital: ${aiCapital.toLocaleString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-secondary/20 border border-border/30">
            <p className="text-lg font-bold mono-text">$101M</p>
            <p className="text-[10px] text-muted-foreground">System Pool</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/20 border border-border/30">
            <p className="text-lg font-bold mono-text">$10M</p>
            <p className="text-[10px] text-muted-foreground">Executive Treasury</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/20 border border-border/30">
            <p className="text-lg font-bold mono-text">9</p>
            <p className="text-[10px] text-muted-foreground">Active AI Agents</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
