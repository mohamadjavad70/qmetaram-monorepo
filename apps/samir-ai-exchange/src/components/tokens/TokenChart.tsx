import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { usePriceHistory, type PlatformAsset } from '@/hooks/useAssets';
import { Loader2 } from 'lucide-react';

interface TokenChartProps {
  token: PlatformAsset;
}

export function TokenChart({ token }: TokenChartProps) {
  const { data: priceHistory, isLoading } = usePriceHistory(token.id);

  const chartData = useMemo(() => {
    if (!priceHistory) return [];
    return priceHistory.map(p => ({
      date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(p.close_price || p.price_usd),
      volume: Number(p.volume),
      high: Number(p.high),
      low: Number(p.low),
    }));
  }, [priceHistory]);

  const priceChange = Number(token.price_change_24h);
  const isPositive = priceChange >= 0;
  const gradientColor = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  if (isLoading) {
    return (
      <Card className="glass-panel">
        <CardContent className="p-6 flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{token.icon_emoji}</span>
            {token.symbol}/USD
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono">
              ${Number(token.current_price_usd).toFixed(token.current_price_usd < 1 ? 4 : 2)}
            </p>
            <p className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}% (24h)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={gradientColor}
                strokeWidth={2}
                fill={`url(#gradient-${token.symbol})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">24h High</p>
            <p className="font-mono font-medium">${(Number(token.current_price_usd) * 1.02).toFixed(4)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">24h Low</p>
            <p className="font-mono font-medium">${(Number(token.current_price_usd) * 0.98).toFixed(4)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="font-mono font-medium">${Number(token.volume_24h).toLocaleString('en-US', { notation: 'compact' })}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-mono font-medium">
              ${(Number(token.current_price_usd) * Number(token.circulating_supply || 0)).toLocaleString('en-US', { notation: 'compact' })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
