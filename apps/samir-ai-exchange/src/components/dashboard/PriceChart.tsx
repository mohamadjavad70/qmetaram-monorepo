import { useState } from 'react';
import { cn } from '@/lib/utils';

const timeframes = ['1H', '4H', '1D', '1W', '1M'];

// Mock chart data points
const generateChartData = () => {
  const data = [];
  let price = 67000;
  for (let i = 0; i < 50; i++) {
    price += (Math.random() - 0.48) * 500;
    data.push(price);
  }
  return data;
};

export function PriceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartData] = useState(generateChartData);

  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const range = max - min;

  const getY = (value: number) => {
    return ((max - value) / range) * 200;
  };

  const pathData = chartData
    .map((value, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = getY(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const areaPath = `${pathData} L 100 200 L 0 200 Z`;

  const currentPrice = chartData[chartData.length - 1];
  const startPrice = chartData[0];
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="glass-panel p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
              <span className="font-bold text-warning">₿</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Bitcoin</h2>
              <p className="text-sm text-muted-foreground">BTC/USD</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold font-mono">
              ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                selectedTimeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[200px] w-full">
        <svg
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid Lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2="100"
              y2={y * 2}
              stroke="hsl(var(--chart-grid))"
              strokeWidth="0.3"
              strokeDasharray="2 2"
            />
          ))}

          {/* Gradient Fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isPositive ? 'hsl(var(--chart-up))' : 'hsl(var(--chart-down))'}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositive ? 'hsl(var(--chart-up))' : 'hsl(var(--chart-down))'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Area */}
          <path
            d={areaPath}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? 'hsl(var(--chart-up))' : 'hsl(var(--chart-down))'}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current Price Dot */}
          <circle
            cx="100"
            cy={getY(currentPrice)}
            r="1.5"
            fill={isPositive ? 'hsl(var(--chart-up))' : 'hsl(var(--chart-down))'}
            className="animate-pulse"
          />
        </svg>

        {/* Price Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground font-mono">
          <span>${max.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span>${((max + min) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span>${min.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
        {[
          { label: '24h High', value: '$68,234' },
          { label: '24h Low', value: '$65,892' },
          { label: '24h Vol', value: '$24.5B' },
          { label: 'Market Cap', value: '$1.32T' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-mono font-medium text-sm">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
