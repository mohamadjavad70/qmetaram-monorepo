import { ArrowUpRight, ArrowDownRight, Eye, EyeOff, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useWalletBalances, useTotalBalanceUSD } from '@/hooks/useWalletBalances';

export function WalletOverview() {
  const [hideBalances, setHideBalances] = useState(false);
  const { data: wallets, isLoading } = useWalletBalances();
  const totalUSD = useTotalBalanceUSD();

  const allocations = (wallets ?? [])
    .map(w => {
      const usdVal = w.balance * (w.current_price_usd ?? 0);
      return { ...w, usdVal, pct: totalUSD > 0 ? (usdVal / totalUSD) * 100 : 0 };
    })
    .filter(w => w.usdVal > 0)
    .sort((a, b) => b.usdVal - a.usdVal);

  const EMOJI: Record<string, string> = {
    BTC: '🪙', ETH: '💎', USDT: '💵', EUR: '🇪🇺', USD: '🇺🇸', NOOR: '✦', BNB: '🔶',
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Smart Wallet</p>
          <div className="flex items-baseline gap-2 mt-1">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-2xl font-bold font-mono">
                {hideBalances ? '••••••' : `$${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setHideBalances(!hideBalances)}>
          {hideBalances ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="glow" size="sm" className="flex-1 h-8 text-xs">
          <ArrowDownRight className="h-3 w-3 mr-1" /> Deposit
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
          <ArrowUpRight className="h-3 w-3 mr-1" /> Withdraw
        </Button>
      </div>

      <div className="space-y-1.5">
        {allocations.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground text-center py-3">No balances yet</p>
        )}
        {allocations.map((w) => (
          <div
            key={w.id}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r border border-border/30 hover:border-primary/30 transition-all cursor-pointer"
            style={{ background: `linear-gradient(135deg, hsl(var(--secondary) / 0.5), hsl(var(--secondary) / 0.2))` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-primary/5 transition-colors" />
            <div className="relative flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold">{w.icon_emoji || EMOJI[w.symbol ?? ''] || '💰'}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold leading-none">{w.symbol ?? '?'}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {hideBalances ? '••••' : w.balance.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 hidden sm:block">
                  <Progress value={w.pct} className="h-1" />
                  <p className="text-[9px] text-muted-foreground text-right mt-0.5">{w.pct.toFixed(1)}%</p>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  ${w.usdVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
