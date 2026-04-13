import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Search, Star, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { TradingViewWidget, TradingViewTickerTape, TradingViewMarketOverview } from '@/components/markets/TradingViewWidget';

const markets = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 42580.50, change: 2.34, volume: '1.2B', tvSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 2380.25, change: 1.87, volume: '890M', tvSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'BNB/USDT', name: 'BNB', price: 315.80, change: -0.54, volume: '320M', tvSymbol: 'BINANCE:BNBUSDT' },
  { symbol: 'SOL/USDT', name: 'Solana', price: 98.45, change: 5.67, volume: '456M', tvSymbol: 'BINANCE:SOLUSDT' },
  { symbol: 'XRP/USDT', name: 'XRP', price: 0.62, change: -1.23, volume: '234M', tvSymbol: 'BINANCE:XRPUSDT' },
  { symbol: 'ADA/USDT', name: 'Cardano', price: 0.58, change: 3.45, volume: '178M', tvSymbol: 'BINANCE:ADAUSDT' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.089, change: 8.92, volume: '567M', tvSymbol: 'BINANCE:DOGEUSDT' },
  { symbol: 'DOT/USDT', name: 'Polkadot', price: 7.85, change: -2.34, volume: '123M', tvSymbol: 'BINANCE:DOTUSDT' },
];

const forexPairs = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0912, change: -0.12, volume: '5.2B', tvSymbol: 'FX:EURUSD' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2685, change: 0.23, volume: '3.1B', tvSymbol: 'FX:GBPUSD' },
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', price: 31.82, change: 0.45, volume: '890M', tvSymbol: 'FX:USDTRY' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 148.25, change: -0.34, volume: '4.5B', tvSymbol: 'FX:USDJPY' },
];

export default function Markets() {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT']);

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filteredMarkets = markets.filter(m => 
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredForex = forexPairs.filter(m => 
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Ticker Tape */}
        <TradingViewTickerTape theme={resolvedTheme} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t('markets')}</h1>
            <p className="text-muted-foreground mt-1">Real-time market data powered by TradingView</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <TradingViewWidget symbol={selectedSymbol} theme={resolvedTheme} height={600} />
          </div>

          {/* Market List */}
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <Tabs defaultValue="crypto">
                <TabsList className="w-full">
                  <TabsTrigger value="crypto" className="flex-1">Crypto</TabsTrigger>
                  <TabsTrigger value="forex" className="flex-1">Forex</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1">
                    <Star className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="crypto" className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredMarkets.map((market) => (
                    <div
                      key={market.symbol}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50 ${
                        selectedSymbol === market.tvSymbol ? 'bg-secondary border border-primary/30' : 'bg-secondary/30'
                      }`}
                      onClick={() => setSelectedSymbol(market.tvSymbol)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(market.symbol); }}>
                            <Star className={`h-4 w-4 ${favorites.includes(market.symbol) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                          </button>
                          <div>
                            <p className="font-medium">{market.symbol}</p>
                            <p className="text-xs text-muted-foreground">{market.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">${market.price.toLocaleString()}</p>
                          <p className={`text-sm flex items-center gap-1 justify-end ${market.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {market.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {market.change >= 0 ? '+' : ''}{market.change}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="forex" className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredForex.map((market) => (
                    <div
                      key={market.symbol}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50 ${
                        selectedSymbol === market.tvSymbol ? 'bg-secondary border border-primary/30' : 'bg-secondary/30'
                      }`}
                      onClick={() => setSelectedSymbol(market.tvSymbol)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(market.symbol); }}>
                            <Star className={`h-4 w-4 ${favorites.includes(market.symbol) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                          </button>
                          <div>
                            <p className="font-medium">{market.symbol}</p>
                            <p className="text-xs text-muted-foreground">{market.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">{market.price.toFixed(4)}</p>
                          <p className={`text-sm flex items-center gap-1 justify-end ${market.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {market.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {market.change >= 0 ? '+' : ''}{market.change}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="favorites" className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                  {[...markets, ...forexPairs]
                    .filter(m => favorites.includes(m.symbol))
                    .map((market) => (
                      <div
                        key={market.symbol}
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50 ${
                          selectedSymbol === market.tvSymbol ? 'bg-secondary border border-primary/30' : 'bg-secondary/30'
                        }`}
                        onClick={() => setSelectedSymbol(market.tvSymbol)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <div>
                              <p className="font-medium">{market.symbol}</p>
                              <p className="text-xs text-muted-foreground">{market.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-medium">${market.price.toLocaleString()}</p>
                            <p className={`text-sm ${market.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {market.change >= 0 ? '+' : ''}{market.change}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>

        {/* Market Overview Widget */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TradingViewMarketOverview theme={resolvedTheme} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
