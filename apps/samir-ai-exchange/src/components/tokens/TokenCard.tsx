import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import type { PlatformAsset } from '@/hooks/useAssets';

interface TokenCardProps {
  token: PlatformAsset;
  onClick?: () => void;
  selected?: boolean;
}

export function TokenCard({ token, onClick, selected }: TokenCardProps) {
  const priceChange = Number(token.price_change_24h);
  const isPositive = priceChange >= 0;

  return (
    <Card 
      className={`glass-panel cursor-pointer transition-all hover:border-primary/50 ${
        selected ? 'border-primary ring-2 ring-primary/20' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{token.icon_emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{token.symbol}</h3>
                {token.is_platform_token && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Platform
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{token.name}</p>
            </div>
          </div>
          {token.fee_discount_percent > 0 && (
            <Badge className="bg-success/20 text-success border-success/30">
              {token.fee_discount_percent}% Fee Discount
            </Badge>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold font-mono">
              ${Number(token.current_price_usd).toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: token.current_price_usd < 1 ? 4 : 2 
              })}
            </p>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
              <span className="text-muted-foreground ml-1">24h</span>
            </div>
          </div>

          <div className="text-right text-sm">
            <p className="text-muted-foreground">Volume 24h</p>
            <p className="font-mono">${Number(token.volume_24h).toLocaleString('en-US', { notation: 'compact' })}</p>
          </div>
        </div>

        {token.circulating_supply && (
          <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Circulating</span>
              <p className="font-mono">{Number(token.circulating_supply).toLocaleString('en-US', { notation: 'compact' })}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Supply</span>
              <p className="font-mono">{Number(token.total_supply).toLocaleString('en-US', { notation: 'compact' })}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
