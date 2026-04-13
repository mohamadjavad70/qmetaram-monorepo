import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Sparkles, Info, Loader2 } from 'lucide-react';
import { useAssets, type PlatformAsset } from '@/hooks/useAssets';
import { toast } from 'sonner';

interface TokenExchangeProps {
  defaultFromSymbol?: string;
  defaultToSymbol?: string;
}

export function TokenExchange({ defaultFromSymbol = 'USDT', defaultToSymbol = 'SAMIR' }: TokenExchangeProps) {
  const { data: assets, isLoading } = useAssets();
  const [fromSymbol, setFromSymbol] = useState(defaultFromSymbol);
  const [toSymbol, setToSymbol] = useState(defaultToSymbol);
  const [fromAmount, setFromAmount] = useState('100');
  const [isSwapping, setIsSwapping] = useState(false);

  const fromAsset = useMemo(() => assets?.find(a => a.symbol === fromSymbol), [assets, fromSymbol]);
  const toAsset = useMemo(() => assets?.find(a => a.symbol === toSymbol), [assets, toSymbol]);

  const exchangeRate = useMemo(() => {
    if (!fromAsset || !toAsset) return 0;
    return Number(fromAsset.current_price_usd) / Number(toAsset.current_price_usd);
  }, [fromAsset, toAsset]);

  const toAmount = useMemo(() => {
    const amount = parseFloat(fromAmount) || 0;
    return (amount * exchangeRate).toFixed(6);
  }, [fromAmount, exchangeRate]);

  const fee = useMemo(() => {
    const amount = parseFloat(fromAmount) || 0;
    // Apply 10% discount if paying with platform token
    const feePercent = (fromAsset?.is_platform_token || toAsset?.is_platform_token) ? 0.09 : 0.1;
    return (amount * feePercent / 100).toFixed(6);
  }, [fromAmount, fromAsset, toAsset]);

  const handleSwapDirection = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
    setFromAmount(toAmount);
  };

  const handleExchange = async () => {
    if (!fromAsset || !toAsset) return;
    
    setIsSwapping(true);
    // Simulate exchange
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(
      `Successfully exchanged ${fromAmount} ${fromSymbol} for ${toAmount} ${toSymbol}`,
      { description: 'Transaction completed' }
    );
    setIsSwapping(false);
  };

  if (isLoading) {
    return (
      <Card className="glass-panel">
        <CardContent className="p-6 flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const platformTokenSelected = fromAsset?.is_platform_token || toAsset?.is_platform_token;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5 text-primary" />
          Token Exchange
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">You Pay</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 text-lg font-mono"
              placeholder="0.00"
            />
            <Select value={fromSymbol} onValueChange={setFromSymbol}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets?.filter(a => a.symbol !== toSymbol).map((asset) => (
                  <SelectItem key={asset.id} value={asset.symbol}>
                    <span className="flex items-center gap-2">
                      <span>{asset.icon_emoji}</span>
                      <span>{asset.symbol}</span>
                      {asset.is_platform_token && <Sparkles className="h-3 w-3 text-primary" />}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fromAsset && (
            <p className="text-xs text-muted-foreground">
              ≈ ${(parseFloat(fromAmount) * Number(fromAsset.current_price_usd)).toFixed(2)} USD
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 border-primary/30 hover:bg-primary/10"
            onClick={handleSwapDirection}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">You Receive</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={toAmount}
              readOnly
              className="flex-1 text-lg font-mono bg-secondary/30"
            />
            <Select value={toSymbol} onValueChange={setToSymbol}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets?.filter(a => a.symbol !== fromSymbol).map((asset) => (
                  <SelectItem key={asset.id} value={asset.symbol}>
                    <span className="flex items-center gap-2">
                      <span>{asset.icon_emoji}</span>
                      <span>{asset.symbol}</span>
                      {asset.is_platform_token && <Sparkles className="h-3 w-3 text-primary" />}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {toAsset && (
            <p className="text-xs text-muted-foreground">
              ≈ ${(parseFloat(toAmount) * Number(toAsset.current_price_usd)).toFixed(2)} USD
            </p>
          )}
        </div>

        {/* Fee Discount Banner */}
        {platformTokenSelected && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-success mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-success">10% Fee Discount Applied!</p>
              <p className="text-muted-foreground text-xs">Using SAMIR or METARAM reduces trading fees</p>
            </div>
          </div>
        )}

        {/* Rate Info */}
        <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-mono">1 {fromSymbol} = {exchangeRate.toFixed(6)} {toSymbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              Fee ({platformTokenSelected ? '0.09%' : '0.1%'})
              {platformTokenSelected && <Sparkles className="h-3 w-3 text-success" />}
            </span>
            <span className="font-mono">{fee} {fromSymbol}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t border-border/50">
            <span>You'll Receive</span>
            <span className="font-mono text-primary">{toAmount} {toSymbol}</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleExchange}
          disabled={isSwapping || !parseFloat(fromAmount)}
        >
          {isSwapping ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowDownUp className="h-4 w-4 mr-2" />
              Exchange Now
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Info className="h-3 w-3" />
          Prices update in real-time. Slippage may occur.
        </p>
      </CardContent>
    </Card>
  );
}
