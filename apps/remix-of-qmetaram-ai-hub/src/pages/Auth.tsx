import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthMode = "login" | "signup" | "forgot" | "reset";
type Provider = "google" | "github" | "apple";
type RecoveryMethod = "email" | "phone";
type Message = { type: "success" | "error"; text: string } | null;

type I18n = {
  authTitle: string;
  login: string;
  signup: string;
  forgot: string;
  reset: string;
  loginDesc: string;
  signupDesc: string;
  forgotDesc: string;
  resetDesc: string;
  email: string;
  password: string;
  newPassword: string;
  phone: string;
  forgotPassword: string;
  sendRecovery: string;
  backToLogin: string;
  signIn: string;
  signUp: string;
  orWithEmail: string;
  google: string;
  github: string;
  apple: string;
  accountCreated: string;
  loginSuccess: string;
  recoveryEmailSent: string;
  recoveryPhoneSent: string;
  recoveryDetected: string;
  passwordUpdated: string;
  invalidEmail: string;
  passwordTooShort: string;
  enterEmail: string;
  enterPhone: string;
};

const fa: I18n = {
  authTitle: "احراز هویت",
  login: "ورود",
  signup: "ثبت نام",
  forgot: "بازیابی",
  reset: "تنظیم رمز جدید",
  loginDesc: "به حساب خود وارد شوید",
  signupDesc: "حساب جدید بسازید",
  forgotDesc: "رمز عبور خود را بازیابی کنید",
  resetDesc: "رمز عبور جدید را وارد کنید",
  email: "ایمیل",
  password: "رمز عبور",
  newPassword: "رمز جدید",
  phone: "شماره تلفن",
  forgotPassword: "رمز را فراموش کرده اید؟",
  sendRecovery: "ارسال لینک بازیابی",
  backToLogin: "بازگشت به ورود",
  signIn: "ورود",
  signUp: "ایجاد حساب",
  orWithEmail: "یا با ایمیل",
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  accountCreated: "ثبت نام موفق بود. لطفا ایمیل تایید را بررسی کنید.",
  loginSuccess: "ورود با موفقیت انجام شد.",
  recoveryEmailSent: "لینک بازیابی به ایمیل شما ارسال شد.",
  recoveryPhoneSent: "کد یکبار مصرف به شماره شما ارسال شد.",
  recoveryDetected: "لینک بازیابی معتبر است. رمز جدید را وارد کنید.",
  passwordUpdated: "رمز عبور با موفقیت تغییر کرد.",
  invalidEmail: "ایمیل معتبر وارد کنید.",
  passwordTooShort: "رمز عبور باید حداقل 6 کاراکتر باشد.",
  enterEmail: "ایمیل خود را وارد کنید",
  enterPhone: "مثال: +989121234567",
};

const en: I18n = {
  authTitle: "Authentication",
  login: "Login",
  signup: "Sign up",
  forgot: "Recovery",
  reset: "Set new password",
  loginDesc: "Sign in to your account",
  signupDesc: "Create a new account",
  forgotDesc: "Recover your password",
  resetDesc: "Enter your new password",
  email: "Email",
  password: "Password",
  newPassword: "New password",
  phone: "Phone",
  forgotPassword: "Forgot password?",
  sendRecovery: "Send recovery link",
  backToLogin: "Back to login",
  signIn: "Sign in",
  signUp: "Create account",
  orWithEmail: "or continue with email",
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  accountCreated: "Sign-up successful. Check your verification email.",
  loginSuccess: "Signed in successfully.",
  recoveryEmailSent: "Recovery link sent to your email.",
  recoveryPhoneSent: "OTP sent to your phone.",
  recoveryDetected: "Recovery link detected. Please set a new password.",
  passwordUpdated: "Password updated successfully.",
  invalidEmail: "Please enter a valid email.",
  passwordTooShort: "Password must be at least 6 characters.",
  enterEmail: "Enter your email",
  enterPhone: "Example: +15555555555",
};

const getRecoverySignal = (search: URLSearchParams, pathname: string) => {
  if (pathname === "/auth/update-password") {
    return true;
  }

  const typeParam = search.get("type");
  if (typeParam === "recovery") {
    return true;
  }

  if (typeof window !== "undefined") {
    return window.location.hash.includes("type=recovery");
  }

  return false;
};

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locale = useMemo(() => (navigator.language?.toLowerCase().startsWith("fa") ? fa : en), []);

  const [mode, setMode] = useState<AuthMode>("login");
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const targetAfterAuth = ((location.state as { from?: string } | null)?.from || "/dashboard") as string;

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user && !getRecoverySignal(searchParams, location.pathname)) {
        navigate(targetAfterAuth, { replace: true });
      }
    };
    run();

    if (getRecoverySignal(searchParams, location.pathname)) {
      setMode("reset");
      setMessage({ type: "success", text: locale.recoveryDetected });
    }
  }, [navigate, searchParams, targetAfterAuth, locale.recoveryDetected, location.pathname]);

  const setError = (text: string) => setMessage({ type: "error", text });

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.includes("@")) {
      setError(locale.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setError(locale.passwordTooShort);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage({ type: "success", text: locale.loginSuccess });
    navigate(targetAfterAuth, { replace: true });
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.includes("@")) {
      setError(locale.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setError(locale.passwordTooShort);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage({ type: "success", text: locale.accountCreated });
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (recoveryMethod === "email") {
      if (!email.includes("@")) {
        setError(locale.invalidEmail);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage({ type: "success", text: locale.recoveryEmailSent });
      }
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError(locale.enterPhone);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    if (error) {
      setError(error.message);
    } else {
      setMessage({ type: "success", text: locale.recoveryPhoneSent });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password.length < 6) {
      setError(locale.passwordTooShort);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage({ type: "success", text: locale.passwordUpdated });
    setLoading(false);
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 1200);
  };

  const pageTitle =
    mode === "login"
      ? locale.login
      : mode === "signup"
        ? locale.signup
        : mode === "forgot"
          ? locale.forgot
          : locale.reset;

  const pageDescription =
    mode === "login"
      ? locale.loginDesc
      : mode === "signup"
        ? locale.signupDesc
        : mode === "forgot"
          ? locale.forgotDesc
          : locale.resetDesc;

  return (
    <div className="min-h-screen-safe flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{pageTitle}</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-4">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {mode !== "reset" && mode !== "forgot" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="gap-2"
                  onClick={() => handleOAuthSignIn("google")}
                >
                  <GoogleIcon />
                  {locale.google}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="gap-2"
                  onClick={() => handleOAuthSignIn("github")}
                >
                  <GithubIcon />
                  {locale.github}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="gap-2"
                  onClick={() => handleOAuthSignIn("apple")}
                >
                  <AppleIcon />
                  {locale.apple}
                </Button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{locale.orWithEmail}</span>
                </div>
              </div>
            </>
          )}

          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{locale.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale.reset}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {locale.backToLogin}
              </Button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={recoveryMethod === "email" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setRecoveryMethod("email")}
                >
                  <Mail className="h-4 w-4" />
                  {locale.email}
                </Button>
                <Button
                  type="button"
                  variant={recoveryMethod === "phone" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setRecoveryMethod("phone")}
                >
                  <Phone className="h-4 w-4" />
                  {locale.phone}
                </Button>
              </div>

              {recoveryMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">{locale.email}</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={locale.enterEmail}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="recovery-phone">{locale.phone}</Label>
                  <Input
                    id="recovery-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={locale.enterPhone}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale.sendRecovery}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {locale.backToLogin}
              </Button>
            </form>
          )}

          {(mode === "login" || mode === "signup") && (
            <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{locale.login}</TabsTrigger>
                <TabsTrigger value="signup">{locale.signup}</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-4">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{locale.email}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={locale.enterEmail}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{locale.password}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="button" variant="link" className="h-auto px-0" onClick={() => setMode("forgot")}
                  >
                    {locale.forgotPassword}
                  </Button>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale.signIn}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="pt-4">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{locale.email}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={locale.enterEmail}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{locale.password}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : locale.signUp}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.21.68-.48 0-.24-.01-.88-.01-1.73-2.78.6-3.37-1.2-3.37-1.2-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 1.43c0 1.14-.42 2.2-1.13 2.98-.78.86-2.05 1.53-3.15 1.45-.14-1.08.39-2.24 1.1-3.02.78-.86 2.12-1.47 3.18-1.41zM20.94 17.2c-.6 1.38-.88 1.99-1.66 3.2-1.09 1.7-2.62 3.82-4.51 3.84-1.68.02-2.11-1.09-4.39-1.08-2.28.01-2.76 1.1-4.44 1.08-1.88-.02-3.33-1.93-4.42-3.63C-1.5 16 .14 9.4 3.85 8.8c1.85-.3 3.6 1.02 4.73 1.02 1.1 0 3.17-1.26 5.35-1.08.92.04 3.5.37 5.15 2.78-4.53 2.49-3.8 8.93 1.86 10.68z" />
    </svg>
  );
}