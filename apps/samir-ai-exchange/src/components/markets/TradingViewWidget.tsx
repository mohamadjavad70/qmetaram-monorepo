import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  height?: number;
}

function TradingViewWidgetComponent({ 
  symbol = 'BINANCE:BTCUSDT', 
  theme = 'dark',
  height = 500 
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_side_toolbar: false,
      withdateranges: true,
      details: true,
      hotlist: true,
      studies: [
        'STD;RSI',
        'STD;MACD',
        'STD;Bollinger_Bands',
        'STD;SMA'
      ],
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      className="tradingview-widget-container rounded-lg overflow-hidden border border-border"
      style={{ height }}
    >
      <div ref={container} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);

// Market Overview Widget
export function TradingViewMarketOverview({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '100%',
      tabs: [
        {
          title: 'Crypto',
          symbols: [
            { s: 'BINANCE:BTCUSDT', d: 'Bitcoin' },
            { s: 'BINANCE:ETHUSDT', d: 'Ethereum' },
            { s: 'BINANCE:BNBUSDT', d: 'Binance Coin' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana' },
            { s: 'BINANCE:XRPUSDT', d: 'XRP' },
          ],
          originalTitle: 'Crypto',
        },
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR/USD' },
            { s: 'FX:GBPUSD', d: 'GBP/USD' },
            { s: 'FX:USDJPY', d: 'USD/JPY' },
            { s: 'FX:USDTRY', d: 'USD/TRY' },
          ],
          originalTitle: 'Forex',
        },
      ],
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div 
      className="tradingview-widget-container rounded-lg overflow-hidden"
      style={{ height: 400 }}
    >
      <div ref={container} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

// Ticker Tape Widget
export function TradingViewTickerTape({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'BINANCE:BNBUSDT', title: 'BNB/USDT' },
        { proName: 'BINANCE:SOLUSDT', title: 'SOL/USDT' },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en',
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container">
      <div ref={container} />
    </div>
  );
}
