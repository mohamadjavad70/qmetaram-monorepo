import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'revoked' | 'success' | 'error';

const PrivateInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<InviteState>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('redeem-invite', {
        body: { token, action: 'validate' },
      });

      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 410) setState('expired');
        else if (status === 403) setState('revoked');
        else if (status === 429) {
          setState('error');
          setErrorMessage('Too many attempts. Please try again later.');
        } else setState('invalid');
        return;
      }

      if (data?.valid) {
        setEmail(data.email);
        setState('valid');
      } else {
        setState('invalid');
      }
    } catch {
      setState('invalid');
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Minimum 8 characters required', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-invite', {
        body: { token, password, action: 'redeem' },
      });

      if (error) {
        const body = typeof error === 'object' && 'context' in error
          ? await (error as any).context?.json?.() 
          : null;
        toast({ 
          title: 'Error', 
          description: body?.error || 'Failed to create account', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      if (data?.success) {
        setState('success');
        toast({ title: 'Account created!', description: 'You can now log in.' });
        setTimeout(() => navigate('/auth'), 3000);
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Samir Exchange</h1>
          <p className="text-muted-foreground">Private Access Portal</p>
        </div>

        {state === 'loading' && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Verifying your invite...</p>
            </CardContent>
          </Card>
        )}

        {state === 'valid' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Set Up Your Account
              </CardTitle>
              <CardDescription>
                You've been invited to join. Set a password to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {state === 'success' && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold">Account Created!</h2>
              <p className="text-muted-foreground">Redirecting to login...</p>
            </CardContent>
          </Card>
        )}

        {(state === 'invalid' || state === 'expired' || state === 'used' || state === 'revoked' || state === 'error') && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">
                {state === 'expired' && 'Link Expired'}
                {state === 'used' && 'Already Used'}
                {state === 'revoked' && 'Link Revoked'}
                {state === 'invalid' && 'Invalid Link'}
                {state === 'error' && 'Error'}
              </h2>
              <p className="text-muted-foreground">
                {state === 'expired' && 'This invite link has expired. Please contact your administrator.'}
                {state === 'used' && 'This invite has already been used. Please log in with your credentials.'}
                {state === 'revoked' && 'This invite has been revoked by the administrator.'}
                {state === 'invalid' && 'This invite link is not valid.'}
                {state === 'error' && (errorMessage || 'Something went wrong.')}
              </p>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PrivateInvite;
