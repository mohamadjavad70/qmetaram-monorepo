import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Smartphone, Shield, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface IranianOTPVerificationProps {
  phoneNumber: string;
  purpose: 'card_linking' | 'withdrawal';
  onVerified: () => void;
  onCancel: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; // 2 minutes

export function IranianOTPVerification({ 
  phoneNumber, 
  purpose, 
  onVerified, 
  onCancel 
}: IranianOTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format Iranian phone number for display
  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('98')) {
      return `+98 ${digits.slice(2, 5)} *** ${digits.slice(-2)}`;
    }
    if (digits.startsWith('0')) {
      return `+98 ${digits.slice(1, 4)} *** ${digits.slice(-2)}`;
    }
    return `*** ${digits.slice(-4)}`;
  };

  // Start countdown timer
  useEffect(() => {
    if (otpSent && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpSent]);

  // Send OTP on component mount
  useEffect(() => {
    sendOTP();
  }, []);

  const sendOTP = async () => {
    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-iranian-otp', {
        body: { 
          phoneNumber,
          purpose 
        }
      });

      if (error) throw error;

      setOtpSent(true);
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      toast.success('کد تایید ارسال شد');
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error('خطا در ارسال کد. لطفا دوباره تلاش کنید.');
    } finally {
      setSending(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp('');
    sendOTP();
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.error('کد 6 رقمی را کامل وارد کنید');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-iranian-otp', {
        body: {
          phoneNumber,
          otp,
          purpose
        }
      });

      if (error) throw error;

      if (data?.verified) {
        toast.success('شماره موبایل تایید شد');
        onVerified();
      } else {
        toast.error('کد وارد شده صحیح نیست');
        setOtp('');
      }
    } catch (error: any) {
      console.error('OTP verify error:', error);
      toast.error(error.message || 'خطا در تایید کد');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const purposeText = purpose === 'card_linking' 
    ? 'ثبت کارت بانکی' 
    : 'برداشت تومان';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>تایید شماره موبایل</CardTitle>
        <CardDescription>
          برای {purposeText}، کد ارسال شده را وارد کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phone Number Display */}
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">کد ارسال شده به:</p>
          <p className="font-mono text-lg font-medium" dir="ltr">
            {formatPhoneDisplay(phoneNumber)}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center" dir="ltr">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={OTP_LENGTH}
            disabled={loading}
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <InputOTPSlot key={i} index={i} className="w-10 h-12" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Countdown / Resend */}
        <div className="text-center">
          {canResend ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={sending}
              className="text-primary"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              ارسال مجدد کد
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              ارسال مجدد تا {formatTime(countdown)}
            </p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={loading || otp.length !== OTP_LENGTH}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          تایید کد
        </Button>

        {/* Cancel Button */}
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full"
        >
          انصراف
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-center text-muted-foreground">
          <p>کد تایید 6 رقمی به پیامک ارسال شده است.</p>
          <p>این کد تا 5 دقیقه معتبر است.</p>
        </div>
      </CardContent>
    </Card>
  );
}
