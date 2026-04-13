import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const markets = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67243.50, change: 2.34, volume: '24.5B' },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.82, change: -1.23, volume: '12.3B' },
  { symbol: 'USDT', name: 'Tether', price: 1.0002, change: 0.01, volume: '45.2B' },
  { symbol: 'EUR', name: 'Euro', price: 1.0856, change: 0.15, volume: '2.1B' },
  { symbol: 'GBP', name: 'British Pound', price: 1.2734, change: -0.08, volume: '1.8B' },
  { symbol: 'TRY', name: 'Turkish Lira', price: 0.031, change: -0.52, volume: '890M' },
];

export function MarketOverview() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Market Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time market data</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Asset</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Price</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">24h Change</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Volume</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market) => (
              <tr
                key={market.symbol}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="font-bold text-sm text-primary">{market.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{market.symbol}</p>
                      <p className="text-xs text-muted-foreground">{market.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="font-mono font-medium">
                    ${market.price.toLocaleString()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      market.change >= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {market.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(market.change)}%
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm text-muted-foreground font-mono">${market.volume}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
