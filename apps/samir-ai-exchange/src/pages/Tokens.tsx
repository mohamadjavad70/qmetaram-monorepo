import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Coins, Info, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlatformTokens, useAssets } from '@/hooks/useAssets';
import { TokenCard } from '@/components/tokens/TokenCard';
import { TokenChart } from '@/components/tokens/TokenChart';
import { TokenExchange } from '@/components/tokens/TokenExchange';
import { Skeleton } from '@/components/ui/skeleton';

export default function Tokens() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: platformTokens, isLoading: tokensLoading } = usePlatformTokens();
  const { data: allAssets } = useAssets();
  const [selectedToken, setSelectedToken] = useState<string>('SAMIR');

  const selectedTokenData = platformTokens?.find(t => t.symbol === selectedToken);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Platform Tokens
            </h1>
            <p className="text-muted-foreground mt-1">
              Trade SAMIR and METARAM tokens with exclusive benefits
            </p>
          </div>
        </div>

        {/* Benefits Banner */}
        <Card className="glass-panel bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">10% Fee Discount</h3>
                  <p className="text-sm text-muted-foreground">Pay fees with SAMIR or METARAM and save 10%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-success/20">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Tradeable Assets</h3>
                  <p className="text-sm text-muted-foreground">Exchange for fiat, crypto, or other tokens</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-warning/20">
                  <Coins className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Demo Trading</h3>
                  <p className="text-sm text-muted-foreground">Practice with 1 METARAM + 10 SAMIR demo funds</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          {tokensLoading ? (
            <>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </>
          ) : (
            <>
              {platformTokens?.map(token => (
                <TokenCard
                  key={token.id}
                  token={token}
                  selected={selectedToken === token.symbol}
                  onClick={() => setSelectedToken(token.symbol)}
                />
              ))}
              {allAssets?.filter(a => !a.is_platform_token).map(token => (
                <TokenCard
                  key={token.id}
                  token={token}
                  selected={selectedToken === token.symbol}
                  onClick={() => navigate(`/tokens/${token.symbol.toLowerCase()}`)}
                />
              ))}
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            {selectedTokenData ? (
              <TokenChart token={selectedTokenData} />
            ) : (
              <Skeleton className="h-[400px]" />
            )}
          </div>

          {/* Exchange */}
          <div>
            <TokenExchange 
              defaultFromSymbol="USDT" 
              defaultToSymbol={selectedToken} 
            />
          </div>
        </div>

        {/* Token Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* SAMIR Info */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                SAMIR Token
                <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">$1.00 USD</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                SAMIR is the primary utility token of the Samir Exchange platform. 
                It provides fee discounts and can be traded against all supported assets.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Base Value</p>
                  <p className="font-bold text-lg">$1.00 USD</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Fee Discount</p>
                  <p className="font-bold text-lg text-success">10%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Total Supply</p>
                  <p className="font-bold">100M</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Circulating</p>
                  <p className="font-bold">25M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* METARAM Info */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💎</span>
                METARAM Token
                <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">$10.00 USD</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                METARAM (q.metaram) is the premium token offering enhanced benefits. 
                Higher value per token with the same 10% fee discount.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Base Value</p>
                  <p className="font-bold text-lg">$10.00 USD</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Fee Discount</p>
                  <p className="font-bold text-lg text-success">10%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Total Supply</p>
                  <p className="font-bold">10M</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Circulating</p>
                  <p className="font-bold">2.5M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="glass-panel bg-warning/5 border-warning/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning">Important Notice</p>
              <p className="text-muted-foreground mt-1">
                Platform tokens are subject to market volatility. Trading involves risk. 
                Past performance does not guarantee future results. This is not financial advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
