import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, Check } from 'lucide-react';
import { useNoorClaims } from '@/hooks/useNoorClaims';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export function NoorClaimBanner() {
  const { isAuthenticated } = useAuthContext();
  const { claim, totalNoor, claimSignupNoor } = useNoorClaims();
  const [claiming, setClaiming] = useState(false);

  if (!isAuthenticated) return null;
  if (claim?.signup_claimed) return null;

  const handleClaim = async () => {
    setClaiming(true);
    const success = await claimSignupNoor();
    if (success) {
      toast.success('🎉 You received 1 NOOR Token! Welcome to the Galaxy.');
    } else {
      toast.error('Failed to claim. Please try again.');
    }
    setClaiming(false);
  };

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-yellow-500/10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20 animate-pulse">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Welcome Gift: Claim 1 Free NOOR Token
            </h3>
            <p className="text-sm text-muted-foreground">
              Start your journey in the Samir AI Galaxy with a free NOOR token. Unlock Basic AI Agent access!
            </p>
          </div>
        </div>
        <Button 
          onClick={handleClaim} 
          disabled={claiming}
          className="gap-2 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-primary-foreground font-bold px-6 shrink-0"
        >
          {claiming ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Gift className="h-5 w-5" />
          )}
          Claim 1 NOOR
        </Button>
      </CardContent>
    </Card>
  );
}
