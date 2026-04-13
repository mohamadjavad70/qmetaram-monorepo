import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { IranianOTPVerification } from './IranianOTPVerification';

interface LinkedCard {
  id: string;
  card_number_masked: string;
  bank_name: string;
  cardholder_name: string;
  shaba_number: string | null;
  is_verified: boolean;
  status: string;
}

// Iranian bank BIN codes for detection
const IRANIAN_BANKS: Record<string, string> = {
  '603799': 'بانک ملی',
  '589210': 'بانک سپه',
  '627648': 'بانک توسعه صادرات',
  '627961': 'بانک صنعت و معدن',
  '603770': 'بانک کشاورزی',
  '628023': 'بانک مسکن',
  '627760': 'پست بانک',
  '502908': 'بانک توسعه تعاون',
  '627412': 'بانک اقتصاد نوین',
  '622106': 'بانک پارسیان',
  '502229': 'بانک پاسارگاد',
  '627488': 'بانک کارآفرین',
  '621986': 'بانک سامان',
  '639346': 'بانک سینا',
  '639607': 'بانک سرمایه',
  '636214': 'بانک آینده',
  '502806': 'بانک شهر',
  '504706': 'بانک شهر',
  '502938': 'بانک دی',
  '603769': 'بانک صادرات',
  '610433': 'بانک ملت',
  '991975': 'بانک ملت',
  '589463': 'بانک رفاه',
  '627353': 'بانک تجارت',
};

function detectBank(cardNumber: string): string {
  const bin = cardNumber.replace(/\s/g, '').substring(0, 6);
  return IRANIAN_BANKS[bin] || 'بانک نامشخص';
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1-');
}

function validateIranianCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length !== 16) return false;
  
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function validateNationalId(nationalId: string): boolean {
  const id = nationalId.replace(/\D/g, '');
  if (id.length !== 10) return false;
  
  // Iranian national ID validation algorithm
  const check = parseInt(id[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(id[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

function validateShaba(shaba: string): boolean {
  const cleaned = shaba.replace(/\s/g, '').toUpperCase();
  return /^IR\d{24}$/.test(cleaned);
}

export function IranianCardLinking() {
  const { user } = useAuthContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([]);
  const [showOTP, setShowOTP] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shabaNumber, setShabaNumber] = useState('');
  const [verificationAmount, setVerificationAmount] = useState('');

  const bankName = cardNumber.length >= 6 ? detectBank(cardNumber) : '';

  // Validate Iranian phone number
  const validateIranianPhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return (
      (digits.startsWith('09') && digits.length === 11) ||
      (digits.startsWith('9') && digits.length === 10) ||
      (digits.startsWith('989') && digits.length === 12)
    );
  };

  const handleCardSubmit = async () => {
    if (!validateIranianCard(cardNumber)) {
      toast.error('شماره کارت نامعتبر است');
      return;
    }
    if (!validateNationalId(nationalId)) {
      toast.error('کد ملی نامعتبر است');
      return;
    }
    if (!cardholderName.trim()) {
      toast.error('نام صاحب کارت الزامی است');
      return;
    }
    if (!validateIranianPhone(phoneNumber)) {
      toast.error('شماره موبایل نامعتبر است (مثال: 09123456789)');
      return;
    }
    
    // Show OTP verification
    setShowOTP(true);
  };

  const handleOTPVerified = () => {
    setShowOTP(false);
    setStep(2);
    toast.info('لطفا منتظر تراکنش تست باشید...');
    
    // In production, this would trigger a micro-transaction via PSP
    setTimeout(() => {
      toast.success('تراکنش تست ارسال شد. مبلغ را وارد کنید.');
    }, 2000);
  };

  const handleVerification = async () => {
    if (!verificationAmount) {
      toast.error('مبلغ تراکنش را وارد کنید');
      return;
    }
    
    setLoading(true);
    
    try {
      // In production, verify the amount matches the micro-transaction
      // For demo, accept any amount between 1000-9999
      const amount = parseInt(verificationAmount, 10);
      if (amount < 1000 || amount > 9999) {
        throw new Error('مبلغ وارد شده صحیح نیست');
      }
      
      setStep(3);
      toast.success('کارت تایید شد. حالا شماره شبا را وارد کنید.');
    } catch (error: any) {
      toast.error(error.message || 'خطا در تایید');
    } finally {
      setLoading(false);
    }
  };

  const handleShabaSubmit = async () => {
    if (shabaNumber && !validateShaba(shabaNumber)) {
      toast.error('شماره شبا نامعتبر است (IR + 24 رقم)');
      return;
    }
    
    setLoading(true);
    
    try {
      const cardDigits = cardNumber.replace(/\D/g, '');
      
      // Use secure server-side hashing via edge function
      const hashResponse = await supabase.functions.invoke('hash-sensitive-data', {
        body: {
          cardNumber: cardDigits,
          nationalId: nationalId
        }
      });
      
      if (hashResponse.error || !hashResponse.data?.success) {
        throw new Error(hashResponse.data?.error || 'خطا در رمزگذاری اطلاعات');
      }
      
      const { cardHash, nationalIdHash, maskedCard } = hashResponse.data;
      
      const { error } = await supabase
        .from('iranian_bank_cards')
        .insert({
          user_id: user?.id,
          card_number_masked: maskedCard,
          card_hash: cardHash,
          bank_name: bankName,
          cardholder_name: cardholderName,
          national_id_hash: nationalIdHash,
          shaba_number: shabaNumber || null,
          is_verified: true,
          verification_method: 'micro_transaction',
          verified_at: new Date().toISOString(),
          status: 'verified'
        });
      
      if (error) throw error;
      
      toast.success('کارت با موفقیت ثبت شد!');
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'خطا در ثبت کارت');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCardNumber('');
    setNationalId('');
    setCardholderName('');
    setPhoneNumber('');
    setShabaNumber('');
    setVerificationAmount('');
    setShowOTP(false);
  };

  // Show OTP verification screen
  if (showOTP) {
    return (
      <IranianOTPVerification
        phoneNumber={phoneNumber}
        purpose="card_linking"
        onVerified={handleOTPVerified}
        onCancel={() => setShowOTP(false)}
      />
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          ثبت کارت بانکی ایران
        </CardTitle>
        <CardDescription>
          برای واریز و برداشت تومان، کارت بانکی خود را ثبت کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Card Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>شماره کارت 16 رقمی</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="6037-****-****-****"
                className="text-left font-mono"
                dir="ltr"
              />
              {bankName && (
                <Badge variant="secondary" className="mt-1">{bankName}</Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>کد ملی صاحب کارت</Label>
              <Input
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').substring(0, 10))}
                placeholder="10 رقم"
                className="text-left font-mono"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label>نام صاحب کارت (به فارسی)</Label>
              <Input
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="نام و نام خانوادگی"
              />
            </div>

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
            
            <Button onClick={handleCardSubmit} className="w-full">
              ادامه - دریافت کد تایید
            </Button>
          </div>
        )}

        {/* Step 2: Micro-transaction Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                تایید مالکیت کارت
              </div>
              <p className="text-sm">
                یک تراکنش کوچک (بین 1000 تا 9999 تومان) به کارت شما ارسال شده است.
                مبلغ دقیق تراکنش را وارد کنید.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>مبلغ تراکنش (تومان)</Label>
              <Input
                value={verificationAmount}
                onChange={(e) => setVerificationAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="مثال: 4523"
                className="text-left font-mono"
                dir="ltr"
              />
            </div>
            
            <Button onClick={handleVerification} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              تایید مبلغ
            </Button>
          </div>
        )}

        {/* Step 3: Shaba Registration */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle className="h-4 w-4" />
                کارت تایید شد
              </div>
              <p className="text-sm text-muted-foreground">
                برای برداشت تومان، شماره شبا ثبت کنید (اختیاری)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>شماره شبا (IBAN)</Label>
              <Input
                value={shabaNumber}
                onChange={(e) => setShabaNumber(e.target.value.toUpperCase())}
                placeholder="IR******************************"
                className="text-left font-mono"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                شماره شبا باید با IR شروع شود و 24 رقم بعد از آن داشته باشد
              </p>
            </div>
            
            <Button onClick={handleShabaSubmit} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              تکمیل ثبت کارت
            </Button>
            
            <Button variant="outline" onClick={handleShabaSubmit} disabled={loading} className="w-full">
              ثبت بدون شبا
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-amber-500 mb-1">نکات امنیتی</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>کارت باید به نام خودتان باشد</li>
                <li>کد ملی باید با صاحب کارت مطابقت داشته باشد</li>
                <li>شماره کارت به صورت رمزگذاری شده ذخیره می‌شود</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
