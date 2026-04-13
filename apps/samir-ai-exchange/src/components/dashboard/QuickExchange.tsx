import { useState } from 'react';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const currencies = ['EUR', 'USD', 'GBP', 'TRY', 'BTC', 'ETH', 'USDT'];

export function QuickExchange() {
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [fromAmount, setFromAmount] = useState('1000');
  const [isSwapping, setIsSwapping] = useState(false);

  const rate = 1.0856;
  const toAmount = (parseFloat(fromAmount) * rate).toFixed(2);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      setIsSwapping(false);
    }, 300);
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Quick Exchange</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* From */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">From</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-1 bg-secondary/50 border-transparent text-lg font-mono font-medium"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="px-4 rounded-lg bg-secondary border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwap}
          className={`rounded-full bg-secondary border border-border transition-transform duration-300 ${isSwapping ? 'rotate-180' : ''}`}
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>

      {/* To */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">To</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={toAmount}
            readOnly
            className="flex-1 bg-secondary/50 border-transparent text-lg font-mono font-medium"
          />
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="px-4 rounded-lg bg-secondary border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate Info */}
      <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-secondary/30">
        <span className="text-muted-foreground">Exchange Rate</span>
        <span className="font-mono font-medium">1 {fromCurrency} = {rate} {toCurrency}</span>
      </div>

      {/* Fee Info */}
      <div className="flex items-center justify-between text-sm px-3">
        <span className="text-muted-foreground">Fee (0.1%)</span>
        <span className="font-mono">~${(parseFloat(fromAmount) * 0.001).toFixed(2)}</span>
      </div>

      <Button variant="buy" className="w-full" size="lg">
        Exchange Now
      </Button>
    </div>
  );
}
