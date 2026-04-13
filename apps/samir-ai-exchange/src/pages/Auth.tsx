import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, ShieldCheck, Wallet, Gift, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import samirLogo from '@/assets/samir-logo.png';
import { NoorSpinWheel } from '@/components/auth/NoorSpinWheel';
import { TreasureChestReveal } from '@/components/auth/TreasureChestReveal';

const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

const emailSchema = z.string().email('Invalid email address').max(255);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(72);
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100).optional();

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, resetPassword, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reward flow state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showTreasureChest, setShowTreasureChest] = useState(false);
  const [wonNoor, setWonNoor] = useState(0);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load Turnstile script
  useEffect(() => {
    if (document.querySelector('script[src*="turnstile"]')) {
      setTurnstileLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    script.async = true;
    (window as any).onTurnstileLoad = () => setTurnstileLoaded(true);
    document.head.appendChild(script);
    return () => {
      delete (window as any).onTurnstileLoad;
    };
  }, []);

  useEffect(() => {
    if (!turnstileLoaded || !turnstileRef.current || widgetIdRef.current) return;
    const turnstile = (window as any).turnstile;
    if (!turnstile) return;
    widgetIdRef.current = turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(null),
      theme: 'dark',
    });
  }, [turnstileLoaded, activeTab]);

  useEffect(() => {
    setTurnstileToken(null);
    if (widgetIdRef.current && (window as any).turnstile) {
      (window as any).turnstile.reset(widgetIdRef.current);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && !authLoading && user && !showSpinWheel && !showTreasureChest) {
      const userHash = user.id.substring(0, 8);
      navigate(`/dashboard/${userHash}`);
    }
  }, [isAuthenticated, authLoading, navigate, user, showSpinWheel, showTreasureChest]);

  const verifyTurnstile = async (): Promise<boolean> => {
    if (!turnstileToken) {
      toast.error('Please complete the security check');
      return false;
    }
    try {
      const { data, error } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken },
      });
      if (error || !data?.success) {
        toast.error('Security verification failed. Please try again.');
        if (widgetIdRef.current && (window as any).turnstile) {
          (window as any).turnstile.reset(widgetIdRef.current);
        }
        setTurnstileToken(null);
        return false;
      }
      return true;
    } catch {
      toast.error('Security verification error');
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    if (activeTab !== 'reset') {
      try { passwordSchema.parse(password); } catch (e) {
        if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
      }
    }
    if (activeTab === 'register' && fullName) {
      try { nameSchema.parse(fullName); } catch (e) {
        if (e instanceof z.ZodError) newErrors.fullName = e.errors[0].message;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const verified = await verifyTurnstile();
    if (!verified) { setIsLoading(false); return; }
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes('Invalid login credentials') ? 'Invalid email or password' : error.message);
    } else {
      toast.success('Welcome back!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const verified = await verifyTurnstile();
    if (!verified) { setIsLoading(false); return; }
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'This email is already registered' : error.message);
    } else {
      // Show spin wheel instead of simple toast
      setShowSpinWheel(true);
    }
  };

  const handleSpinResult = useCallback((value: number) => {
    setWonNoor(value);
    setShowSpinWheel(false);
    setTimeout(() => setShowTreasureChest(true), 400);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent!');
      setActiveTab('login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Spin Wheel Modal */}
      <NoorSpinWheel open={showSpinWheel} onResult={handleSpinResult} />
      
      {/* Treasure Chest Modal */}
      <TreasureChestReveal
        open={showTreasureChest}
        noorAmount={wonNoor}
        onClose={() => setShowTreasureChest(false)}
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <img src={samirLogo} alt="Samir Exchange" className="w-12 h-12 rounded-xl object-cover" />
            <span className="font-bold text-3xl gradient-text">Samir</span>
          </div>
          <p className="text-muted-foreground">Professional Multi-Currency Exchange</p>
        </div>

        {/* Reward Banner */}
        <div className="mb-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/15 via-yellow-500/10 to-primary/15 p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20 shrink-0">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Sign up & get surprised with rewards!
            </p>
            <p className="text-xs text-muted-foreground">
              Spin the Lucky Wheel and win up to 19 NOOR tokens
            </p>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur border-border/50 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">
              {activeTab === 'login' && 'Welcome Back'}
              {activeTab === 'register' && 'Create Account'}
              {activeTab === 'reset' && 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'login' && 'Enter your credentials to access your account'}
              {activeTab === 'register' && 'Start trading on Samir Exchange'}
              {activeTab === 'reset' && 'Enter your email to reset your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'reset' ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setActiveTab('login')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="login-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`pl-10 ${errors.email ? 'border-destructive' : ''}`} />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setActiveTab('reset')} className="text-sm text-primary hover:underline">Forgot password?</button>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div ref={activeTab === 'login' ? turnstileRef : undefined} />
                      {turnstileToken && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <ShieldCheck className="h-3 w-3" /><span>Verified</span>
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !turnstileToken}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="register-name" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`} />
                      </div>
                      {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="register-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`pl-10 ${errors.email ? 'border-destructive' : ''}`} />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div ref={activeTab === 'register' ? turnstileRef : undefined} />
                      {turnstileToken && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <ShieldCheck className="h-3 w-3" /><span>Verified</span>
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !turnstileToken}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {/* Social Login */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground mb-4">Or continue with</p>
              <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={async () => { const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (error) toast.error('Google sign-in failed'); }} className="w-11 h-11 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-colors" title="Google">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button type="button" onClick={async () => { const { error } = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin }); if (error) toast.error('Apple sign-in failed'); }} className="w-11 h-11 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-colors" title="Apple">
                  <svg className="w-5 h-5 fill-current text-foreground" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
                <button type="button" onClick={async () => { if (typeof window !== 'undefined' && (window as any).ethereum) { try { const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' }); const address = accounts[0]; if (address) { const { data: { user: currentUser } } = await supabase.auth.getUser(); if (currentUser) { await supabase.from('web3_wallets').upsert({ user_id: currentUser.id, wallet_address: address.toLowerCase(), chain_id: 56, is_primary: true }, { onConflict: 'user_id,wallet_address' }); } toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`); } } catch { toast.error('MetaMask connection rejected'); } } else { toast.error('MetaMask not installed'); } }} className="w-11 h-11 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-colors" title="MetaMask">
                  <span className="text-xl">🦊</span>
                </button>
                <button type="button" onClick={() => toast.info('WalletConnect coming soon')} className="w-11 h-11 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-colors" title="WalletConnect">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
