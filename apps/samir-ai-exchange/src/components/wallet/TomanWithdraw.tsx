import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, ArrowLeft, Clock, AlertTriangle, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { IranianOTPVerification } from './IranianOTPVerification';

const WITHDRAW_LIMITS = {
  min: 500000, // 500,000 Toman
  max: 100000000, // 100 Million Toman
  dailyLimit: 500000000, // 500 Million Toman
};

const WITHDRAW_FEE_PERCENT = 0.001; // 0.1% fee
const MINIMUM_FEE = 5000; // Minimum 5,000 Toman fee

function formatToman(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

// Mock linked cards
const mockLinkedCards = [
  { id: '1', masked: '6037-****-****-1234', bank: 'بانک ملی', shaba: 'IR820170000000123456789012' },
  { id: '2', masked: '6219-****-****-5678', bank: 'بانک سامان', shaba: 'IR820560000000987654321098' },
];

export function TomanWithdraw() {
  const [amount, setAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const fee = Math.max(Math.floor(numericAmount * WITHDRAW_FEE_PERCENT), MINIMUM_FEE);
  const finalAmount = numericAmount - fee;

  const selectedCardInfo = mockLinkedCards.find(c => c.id === selectedCard);

  const validateIranianPhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return (
      (digits.startsWith('09') && digits.length === 11) ||
      (digits.startsWith('9') && digits.length === 10)
    );
  };

  const handleAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits) {
      setAmount(formatToman(parseInt(digits, 10)));
    } else {
      setAmount('');
    }
  };

  const handleWithdrawRequest = () => {
    if (!selectedCard) {
      toast.error('لطفا کارت مقصد را انتخاب کنید');
      return;
    }
    if (numericAmount < WITHDRAW_LIMITS.min) {
      toast.error(`حداقل مبلغ برداشت ${formatToman(WITHDRAW_LIMITS.min)} تومان است`);
      return;
    }
    if (numericAmount > WITHDRAW_LIMITS.max) {
      toast.error(`حداکثر مبلغ برداشت ${formatToman(WITHDRAW_LIMITS.max)} تومان است`);
      return;
    }
    if (!validateIranianPhone(phoneNumber)) {
      toast.error('شماره موبایل نامعتبر است (مثال: 09123456789)');
      return;
    }

    // Show OTP verification before processing withdrawal
    setShowOTP(true);
  };

  const handleOTPVerified = async () => {
    setShowOTP(false);
    setLoading(true);
    
    try {
      // In production, this would submit withdrawal request
      toast.success('درخواست برداشت ثبت شد. پس از بررسی، مبلغ به حساب شما واریز می‌شود.');
      
      setTimeout(() => {
        setAmount('');
        setSelectedCard('');
        setPhoneNumber('');
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'خطا در ثبت درخواست');
      setLoading(false);
    }
  };

  // Show OTP verification screen
  if (showOTP) {
    return (
      <IranianOTPVerification
        phoneNumber={phoneNumber}
        purpose="withdrawal"
        onVerified={handleOTPVerified}
        onCancel={() => setShowOTP(false)}
      />
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-amber-500" />
          برداشت تومان
        </CardTitle>
        <CardDescription>
          برداشت به کارت‌های ثبت شده شما
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Selection */}
        <div className="space-y-2">
          <Label>کارت مقصد</Label>
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger>
              <SelectValue placeholder="کارت مقصد را انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {mockLinkedCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{card.masked}</span>
                    <Badge variant="outline" className="text-xs">{card.bank}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCardInfo && (
            <p className="text-xs text-muted-foreground">
              شبا: {selectedCardInfo.shaba}
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label>مبلغ برداشت (تومان)</Label>
          <Input
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="مبلغ را وارد کنید"
            className="text-lg font-medium"
          />
        </div>

        {/* Phone Number for OTP */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            شماره موبایل (برای تایید پیامکی)
          </Label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 11))}
            placeholder="09123456789"
            className="text-left font-mono"
            dir="ltr"
          />
        </div>

        {/* Transaction Details */}
        {numericAmount > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">مبلغ برداشت:</span>
              <span>{formatToman(numericAmount)} تومان</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">کارمزد (0.1%):</span>
              <span className="text-amber-500">-{formatToman(fee)} تومان</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-medium">
              <span>مبلغ دریافتی:</span>
              <span className="text-green-500">{formatToman(finalAmount)} تومان</span>
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <Button 
          onClick={handleWithdrawRequest} 
          disabled={loading || numericAmount < WITHDRAW_LIMITS.min || !selectedCard || !phoneNumber}
          className="w-full"
          size="lg"
          variant="secondary"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ArrowLeft className="h-4 w-4 mr-2" />
          )}
          ادامه - دریافت کد تایید
        </Button>

        {/* Info */}
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>زمان انتقال: معمولا 2 تا 24 ساعت کاری</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500 mb-1">توجه</p>
                <ul className="space-y-1">
                  <li>• برداشت فقط به کارت‌های تایید شده امکان‌پذیر است</li>
                  <li>• برداشت‌های بالای 50 میلیون نیاز به تایید دستی دارد</li>
                  <li>• حداقل برداشت: {formatToman(WITHDRAW_LIMITS.min)} تومان</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
