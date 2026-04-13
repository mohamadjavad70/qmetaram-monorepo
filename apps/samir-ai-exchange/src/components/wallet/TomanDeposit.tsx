import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Banknote, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DEPOSIT_LIMITS = {
  min: 100000, // 100,000 Toman
  max: 500000000, // 500 Million Toman
  dailyLimit: 1000000000, // 1 Billion Toman
};

const DEPOSIT_FEE_PERCENT = 0; // Free deposits

function formatToman(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function TomanDeposit() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const fee = Math.floor(numericAmount * DEPOSIT_FEE_PERCENT);
  const totalAmount = numericAmount + fee;

  const handleAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits) {
      setAmount(formatToman(parseInt(digits, 10)));
    } else {
      setAmount('');
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(formatToman(value));
  };

  const handleDeposit = async () => {
    if (numericAmount < DEPOSIT_LIMITS.min) {
      toast.error(`حداقل مبلغ واریز ${formatToman(DEPOSIT_LIMITS.min)} تومان است`);
      return;
    }
    if (numericAmount > DEPOSIT_LIMITS.max) {
      toast.error(`حداکثر مبلغ واریز ${formatToman(DEPOSIT_LIMITS.max)} تومان است`);
      return;
    }

    setLoading(true);
    
    try {
      // In production, this would redirect to Shaparak gateway
      // For demo, show a success message
      toast.info('در حال انتقال به درگاه پرداخت...');
      
      // Simulate gateway redirect
      setTimeout(() => {
        toast.success('این یک نسخه دمو است. در نسخه واقعی به درگاه بانکی منتقل می‌شوید.');
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'خطا در اتصال به درگاه');
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-green-500" />
          واریز تومان
        </CardTitle>
        <CardDescription>
          واریز مستقیم از کارت‌های عضو شتاب
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label>مبلغ واریز (تومان)</Label>
          <Input
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="مبلغ را وارد کنید"
            className="text-lg font-medium"
          />
          <div className="flex gap-2 flex-wrap">
            {[500000, 1000000, 5000000, 10000000].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(val)}
              >
                {formatToman(val)}
              </Button>
            ))}
          </div>
        </div>

        {/* Transaction Details */}
        {numericAmount > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">مبلغ واریز:</span>
              <span>{formatToman(numericAmount)} تومان</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">کارمزد:</span>
              <Badge variant="secondary" className="text-green-500">رایگان</Badge>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-medium">
              <span>مبلغ نهایی:</span>
              <span className="text-primary">{formatToman(totalAmount)} تومان</span>
            </div>
          </div>
        )}

        {/* Deposit Button */}
        <Button 
          onClick={handleDeposit} 
          disabled={loading || numericAmount < DEPOSIT_LIMITS.min}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          انتقال به درگاه پرداخت
        </Button>

        {/* Info */}
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>درگاه امن شاپرک - تمام کارت‌های عضو شتاب</span>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <p className="font-medium mb-1">محدودیت‌ها:</p>
            <ul className="space-y-1">
              <li>• حداقل واریز: {formatToman(DEPOSIT_LIMITS.min)} تومان</li>
              <li>• حداکثر واریز: {formatToman(DEPOSIT_LIMITS.max)} تومان</li>
              <li>• سقف روزانه: {formatToman(DEPOSIT_LIMITS.dailyLimit)} تومان</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
