import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, CreditCard, ArrowUpRight, Loader2, Shield, 
  CheckCircle, AlertTriangle, Clock, DollarSign 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const FEE_PERCENT = 0.005; // 0.5%
const AUTO_APPROVE_LIMIT = 100;
const MANUAL_APPROVE_LIMIT = 500;

type WithdrawStep = 'form' | 'tracking' | 'done';

const trackingStages = [
  { label: 'Validating Agent', icon: Shield },
  { label: 'Checking Liquidity', icon: DollarSign },
  { label: 'Banking Network', icon: CreditCard },
  { label: 'Success', icon: CheckCircle },
];

function maskCardNumber(num: string): string {
  const clean = num.replace(/\D/g, '');
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}-****-****-${clean.slice(-4)}`;
}

function validateBSCAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export function GlobalWithdraw() {
  const { user } = useAuth();
  const [payoutType, setPayoutType] = useState<'crypto' | 'fiat'>('crypto');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<WithdrawStep>('form');
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [trackingStage, setTrackingStage] = useState(0);
  const [sessionId, setSessionId] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * FEE_PERCENT;
  const netAmount = numAmount - fee;

  // Status is now determined server-side for security

  const simulateTracking = () => {
    setStep('tracking');
    setTrackingStage(0);
    setTrackingProgress(0);

    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setTrackingStage(stage);
      setTrackingProgress(stage * 25);

      if (stage >= 4) {
        clearInterval(interval);
        setTimeout(() => setStep('done'), 800);
      }
    }, 1200);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    if (numAmount <= 0 || numAmount > 50000) {
      toast.error('Enter a valid amount ($1 - $50,000)');
      return;
    }

    // Client-side pre-validation (server validates again)
    if (payoutType === 'crypto' && !validateBSCAddress(walletAddress)) {
      toast.error('Invalid BSC/ERC20 wallet address (must start with 0x and be 42 chars)');
      return;
    }

    if (payoutType === 'fiat') {
      if (!cardholderName.trim()) { toast.error('Enter cardholder name'); return; }
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) { toast.error('Invalid card number'); return; }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) { toast.error('Expiry must be MM/YY'); return; }
    }

    setLoading(true);

    try {
      // Call secure server-side edge function
      const { data: result, error } = await supabase.functions.invoke('withdraw-request-create', {
        body: {
          payout_type: payoutType,
          amount_usd: numAmount,
          wallet_address: payoutType === 'crypto' ? walletAddress : undefined,
          cardholder_name: payoutType === 'fiat' ? cardholderName : undefined,
          card_number: payoutType === 'fiat' ? cardNumber : undefined,
          card_expiry: payoutType === 'fiat' ? cardExpiry : undefined,
        },
      });

      if (error) throw new Error(error.message || 'Request failed');
      if (!result?.success) throw new Error(result?.error || 'Server rejected request');

      setSessionId(result.data.session_id);
      simulateTracking();

      if (result.data.requires_approval) {
        toast.info('Amount > $500 — requires admin approval in War Room');
      } else if (result.data.status === 'approved') {
        toast.success('Auto-approved! Processing your withdrawal.');
      } else {
        toast.info('Withdrawal submitted for review.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setAmount('');
    setWalletAddress('');
    setCardholderName('');
    setCardNumber('');
    setCardExpiry('');
    setTrackingProgress(0);
    setTrackingStage(0);
  };

  // Tracking view
  if (step === 'tracking' || step === 'done') {
    return (
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Quantum Payout Tracking
          </CardTitle>
          <CardDescription>Session: <span className="font-mono text-primary">{sessionId}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={trackingProgress} className="h-3" />
          
          <div className="grid grid-cols-4 gap-2">
            {trackingStages.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= trackingStage;
              const isCurrent = i === trackingStage;
              return (
                <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  isActive ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30 border border-border/30'
                } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs text-center ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {step === 'done' && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center space-y-3">
              <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />
              <p className="font-semibold text-green-400">Withdrawal Request Submitted</p>
              <p className="text-sm text-muted-foreground">
                Amount: <span className="font-mono">${numAmount.toFixed(2)}</span> | 
                Fee: <span className="font-mono">${fee.toFixed(2)}</span> | 
                Net: <span className="font-mono text-green-400">${netAmount.toFixed(2)}</span>
              </p>
              <Button onClick={resetForm} variant="outline" size="sm">New Withdrawal</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Form view
  return (
    <Card className="glass-panel border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-primary" />
          Global Payout Engine
        </CardTitle>
        <CardDescription>Withdraw to crypto wallet or bank card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={payoutType} onValueChange={(v) => setPayoutType(v as 'crypto' | 'fiat')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto" className="gap-2">
              <Wallet className="h-4 w-4" /> Crypto (BSC/ERC20)
            </TabsTrigger>
            <TabsTrigger value="fiat" className="gap-2">
              <CreditCard className="h-4 w-4" /> Visa/Mastercard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Wallet Address (BSC/ERC20)</Label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value.trim())}
                placeholder="0x742d35Cc6634C0532925a3b844Bc..."
                className="font-mono text-sm"
              />
              {walletAddress && !validateBSCAddress(walletAddress) && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Invalid address format
                </p>
              )}
              {walletAddress && validateBSCAddress(walletAddress) && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Valid BSC/ERC20 address
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fiat" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Cardholder Name</Label>
              <Input
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
                placeholder="4111 1111 1111 1111"
                className="font-mono"
              />
              {cardNumber.replace(/\D/g, '').length >= 8 && (
                <p className="text-xs text-muted-foreground">
                  Masked: {maskCardNumber(cardNumber)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Expiry (MM/YY)</Label>
              <Input
                value={cardExpiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                  setCardExpiry(v);
                }}
                placeholder="12/28"
                className="font-mono w-32"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Amount */}
        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            className="text-lg font-mono"
          />
        </div>

        {/* Fee breakdown */}
        {numAmount > 0 && (
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-mono">${numAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee (0.5% → Treasury):</span>
              <span className="font-mono text-amber-400">-${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-medium">
              <span>You receive:</span>
              <span className="font-mono text-green-400">${netAmount.toFixed(2)}</span>
            </div>
            {/* Risk indicator */}
            <div className="flex items-center gap-2 pt-1">
              {numAmount > MANUAL_APPROVE_LIMIT ? (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" /> Requires Admin Approval (&gt;$500)
                </Badge>
              ) : numAmount <= AUTO_APPROVE_LIMIT ? (
                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" /> Auto-Approved (&le;$100)
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" /> Standard Review
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={loading || numAmount <= 0} 
          className="w-full" 
          size="lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpRight className="h-4 w-4 mr-2" />}
          Submit Withdrawal Request
        </Button>
      </CardContent>
    </Card>
  );
}
