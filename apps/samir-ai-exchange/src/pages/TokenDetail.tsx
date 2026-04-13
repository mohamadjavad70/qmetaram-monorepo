import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, BarChart3, Activity, Globe } from 'lucide-react';
import { useAssetBySymbol, usePriceHistory } from '@/hooks/useAssets';
import { TokenChart } from '@/components/tokens/TokenChart';
import { TokenExchange } from '@/components/tokens/TokenExchange';
import { useMemo } from 'react';

export default function TokenDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data: token, isLoading } = useAssetBySymbol(symbol?.toUpperCase() || '');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px]" />
        </div>
      </MainLayout>
    );
  }

  if (!token) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-2xl font-bold mb-2">Token Not Found</p>
          <p className="text-muted-foreground mb-4">The token "{symbol}" does not exist.</p>
          <Link to="/tokens">
            <Button><ArrowLeft className="h-4 w-4 mr-2" /> Back to Tokens</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const priceChange = Number(token.price_change_24h);
  const isPositive = priceChange >= 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/tokens">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{token.icon_emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{token.name}</h1>
                <Badge variant="outline" className="text-sm">{token.symbol}</Badge>
                {token.is_platform_token && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="h-3 w-3 mr-1" /> Platform Token
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold font-mono">
                  ${Number(token.current_price_usd).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: token.current_price_usd < 1 ? 6 : 2,
                  })}
                </span>
                <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Market Cap</p>
              <p className="text-lg font-bold font-mono mt-1">
                ${(Number(token.current_price_usd) * Number(token.circulating_supply || 0)).toLocaleString('en-US', { notation: 'compact' })}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Volume 24h</p>
              <p className="text-lg font-bold font-mono mt-1">
                ${Number(token.volume_24h).toLocaleString('en-US', { notation: 'compact' })}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Circulating</p>
              <p className="text-lg font-bold font-mono mt-1">
                {Number(token.circulating_supply || 0).toLocaleString('en-US', { notation: 'compact' })}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Supply</p>
              <p className="text-lg font-bold font-mono mt-1">
                {Number(token.total_supply || 0).toLocaleString('en-US', { notation: 'compact' })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Exchange */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TokenChart token={token} />
          </div>
          <div>
            <TokenExchange defaultFromSymbol="USDT" defaultToSymbol={token.symbol} />
          </div>
        </div>

        {/* Token Info */}
        {token.is_platform_token && token.fee_discount_percent > 0 && (
          <Card className="glass-panel bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Token Benefits
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground text-sm">Fee Discount</p>
                  <p className="font-bold text-lg text-success">{token.fee_discount_percent}%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground text-sm">Base Price</p>
                  <p className="font-bold text-lg">${Number(token.base_price_usd).toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground text-sm">Type</p>
                  <p className="font-bold text-lg capitalize">{token.asset_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
