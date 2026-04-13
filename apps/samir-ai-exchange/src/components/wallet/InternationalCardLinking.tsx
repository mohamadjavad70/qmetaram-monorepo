import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Shield, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function InternationalCardLinking() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [brand, setBrand] = useState('visa');

  const { data: cards, isLoading } = useQuery({
    queryKey: ['international-cards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('international_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const linkCard = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const cleaned = cardNumber.replace(/\s/g, '');
      if (cleaned.length < 13 || cleaned.length > 19) throw new Error('Invalid card number');
      if (!cardholderName.trim()) throw new Error('Cardholder name required');

      const lastFour = cleaned.slice(-4);

      // Use server-side HMAC-SHA256 hashing via edge function
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Authentication required');

      const { data: hashData, error: hashError } = await supabase.functions.invoke('hash-sensitive-data', {
        body: { cardNumber: cleaned, nationalId: '0000000000' },
      });

      if (hashError || !hashData?.cardHash) {
        throw new Error('Failed to securely process card data');
      }

      const { error } = await supabase.from('international_cards').insert({
        user_id: user.id,
        card_last_four: lastFour,
        card_hash: hashData.cardHash,
        card_brand: brand,
        cardholder_name: cardholderName.trim(),
        expiry_masked: expiry || null,
        status: 'pending_verification',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Card submitted for verification');
      setCardNumber('');
      setCardholderName('');
      setExpiry('');
      queryClient.invalidateQueries({ queryKey: ['international-cards'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const formatCardInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Cards */}
      {cards && cards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Linked Cards</h3>
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">
                    {card.card_brand.toUpperCase()} •••• {card.card_last_four}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.cardholder_name}</p>
                </div>
              </div>
              {statusBadge(card.status)}
            </div>
          ))}
        </div>
      )}

      {/* Link New Card */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Link Global Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Card Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cardholder Name</Label>
              <Input
                placeholder="JOHN DOE"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry (MM/YY)</Label>
              <Input
                placeholder="12/25"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                maxLength={5}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Only the last 4 digits are stored. Full number is never saved.
          </p>

          <Button
            className="w-full"
            onClick={() => linkCard.mutate()}
            disabled={linkCard.isPending || !cardNumber || !cardholderName}
          >
            {linkCard.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
            Submit for Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
