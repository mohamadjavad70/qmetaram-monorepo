import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp, RefreshCw, Wallet, TrendingUp, TrendingDown, Shield, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { ConnectWalletModal } from '@/components/wallet/ConnectWalletModal';
import { TradingViewWidget } from '@/components/markets/TradingViewWidget';
import { useAssets } from '@/hooks/useAssets';
import { toast } from 'sonner';

const tradingViewSymbols: Record<string, string> = {
  BTC: 'BINANCE:BTCUSDT',
  ETH: 'BINANCE:ETHUSDT',
  BNB: 'BINANCE:BNBUSDT',
  SOL: 'BINANCE:SOLUSDT',
  XRP: 'BINANCE:XRPUSDT',
  USDT: 'BINANCE:BTCUSDT',
  EUR: 'FX:EURUSD',
  USD: 'FX:EURUSD',
  GBP: 'FX:GBPUSD',
  TRY: 'FX:USDTRY',
};

export default function Exchange() {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { data: assets, isLoading } = useAssets();
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('1000');
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Build currency list from DB assets + fallback
  const currencies = useMemo(() => {
    if (!assets?.length) {
      return [
        { code: 'EUR', name: 'Euro', flag: '🇪🇺', price: 1.09 },
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸', price: 1 },
        { code: 'BTC', name: 'Bitcoin', flag: '🪙', price: 42500 },
        { code: 'ETH', name: 'Ethereum', flag: '💎', price: 2380 },
        { code: 'USDT', name: 'Tether', flag: '💵', price: 1 },
      ];
    }
    return assets.map(a => ({
      code: a.symbol,
      name: a.name,
      flag: a.icon_emoji || '🪙',
      price: a.current_price_usd,
      change: a.price_change_24h,
    }));
  }, [assets]);

  const fromAsset = currencies.find(c => c.code === fromCurrency);
  const toAsset = currencies.find(c => c.code === toCurrency);

  const rate = fromAsset && toAsset && toAsset.price > 0
    ? fromAsset.price / toAsset.price
    : 1;
  const toAmount = (parseFloat(fromAmount || '0') * rate).toFixed(6);
  const fee = (parseFloat(fromAmount || '0') * 0.001).toFixed(2);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchange = () => {
    toast.info(
      `Service request submitted: ${fromAmount} ${fromCurrency} → ${toAmount} ${toCurrency}. An admin will process your order shortly.`,
      { duration: 5000 }
    );
  };

  const chartSymbol = tradingViewSymbols[fromCurrency] || tradingViewSymbols[toCurrency] || 'BINANCE:BTCUSDT';

  // Top movers from DB
  const topAssets = useMemo(() => {
    if (!assets?.length) return [];
    return [...assets]
      .filter(a => a.asset_type === 'crypto')
      .sort((a, b) => Math.abs(b.price_change_24h) - Math.abs(a.price_change_24h))
      .slice(0, 4);
  }, [assets]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t('exchange')}</h1>
            <p className="text-muted-foreground mt-1">Exchange currencies instantly with best rates</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-success/30 text-success">
              <Shield className="h-3.5 w-3.5" />
              Verified Platform
            </Badge>
            <Button onClick={() => setWalletModalOpen(true)} className="gap-2">
              <Wallet className="h-4 w-4" />
              {t('connectWallet')}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Exchange Form */}
          <Card className="lg:col-span-1 glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5 text-primary" />
                Quick Exchange
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t('youPay')}</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-lg font-mono"
                  />
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-primary/30 hover:bg-primary/10"
                  onClick={handleSwap}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>

              {/* To */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t('youReceive')}</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={toAmount}
                    readOnly
                    className="flex-1 text-lg font-mono bg-secondary/30"
                  />
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rate Info */}
              <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('exchangeRate')}</span>
                  <span className="font-mono">1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('fee')} (0.1%)</span>
                  <span className="font-mono">{fee} {fromCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing</span>
                  <span className="flex items-center gap-1 text-warning">
                    <Clock className="h-3.5 w-3.5" />
                    Manual Review
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleExchange}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Submit Exchange Request
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Orders are processed manually by our team for maximum security
              </p>
            </CardContent>
          </Card>

          {/* Chart */}
          <div className="lg:col-span-2">
            <TradingViewWidget
              symbol={chartSymbol}
              theme={resolvedTheme}
              height={500}
            />
          </div>
        </div>

        {/* Market Stats from DB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topAssets.length > 0 ? topAssets.map((asset) => (
            <Card key={asset.id} className="glass-panel trading-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span>{asset.icon_emoji}</span>
                    {asset.symbol}/USD
                  </span>
                  {asset.price_change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="text-xl font-bold mt-1 mono-text">
                  ${asset.current_price_usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-sm ${asset.price_change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {asset.price_change_24h >= 0 ? '+' : ''}{asset.price_change_24h.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          )) : (
            [
              { name: 'BTC/USD', price: '$42,580', change: '+2.34%', up: true },
              { name: 'ETH/USD', price: '$2,380', change: '+1.87%', up: true },
              { name: 'EUR/USD', price: '$1.0912', change: '-0.12%', up: false },
              { name: 'USD/TRY', price: '₺31.82', change: '+0.45%', up: true },
            ].map((item) => (
              <Card key={item.name} className="glass-panel trading-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    {item.up ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="text-xl font-bold mt-1">{item.price}</div>
                  <div className={`text-sm ${item.up ? 'text-success' : 'text-destructive'}`}>{item.change}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ConnectWalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </MainLayout>
  );
}
