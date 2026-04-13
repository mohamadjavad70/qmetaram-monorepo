import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, Shield, Key, Smartphone, Activity, 
  Copy, Check, AlertTriangle, ChevronRight, 
  LogOut, Settings, FileCheck, Link2, Loader2,
  QrCode, Share2, Mail, Phone, Globe, Calendar,
  Wallet
} from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
  is_demo_user: boolean | null;
  created_at: string | null;
}

interface KYCStatus {
  status: string | null;
  document_type: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuthContext();
  const { isAdmin } = useAdmin();
  const { referralCode, getReferralLink, stats } = useReferrals();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchKYCStatus();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
    setIsLoading(false);
  };

  const fetchKYCStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('kyc_verifications')
      .select('status, document_type')
      .eq('user_id', user.id)
      .maybeSingle();

    setKycStatus(data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('User ID copied');
    }
  };

  const copyReferralCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
      toast.success('Referral code copied');
    }
  };

  const copyReferralLink = () => {
    const link = getReferralLink();
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied');
    }
  };

  const shareReferralLink = async () => {
    const link = getReferralLink();
    if (navigator.share && link) {
      try {
        await navigator.share({
          title: 'Join Samir Exchange',
          text: `Join Samir Exchange using my referral link and get exclusive benefits!`,
          url: link,
        });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const getVerificationLevel = () => {
    if (kycStatus?.status === 'approved') return { level: 'Verified', color: 'bg-green-500', progress: 100 };
    if (kycStatus?.status === 'under_review') return { level: 'Under Review', color: 'bg-yellow-500', progress: 66 };
    if (kycStatus?.status === 'pending') return { level: 'Pending', color: 'bg-blue-500', progress: 33 };
    return { level: 'Unverified', color: 'bg-gray-500', progress: 0 };
  };

  const verification = getVerificationLevel();
  const referralLink = getReferralLink();

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-muted-foreground">Manage your account settings and security</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Account Overview Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                  {profile?.phone && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </p>
                  )}
                  {profile?.country && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {profile.country}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${verification.color} text-white`}>
                      {verification.level}
                    </Badge>
                    {profile?.is_demo_user && (
                      <Badge variant="secondary">Demo Account</Badge>
                    )}
                    {isAdmin && (
                      <Badge variant="destructive">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Info Panel */}
              <div className="flex flex-col gap-3 w-full lg:w-auto">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{user?.id?.slice(0, 12)}...</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyUserId}>
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-muted-foreground">{verification.progress}%</span>
              </div>
              <Progress value={verification.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Referral QR Code Card */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Your Referral Code</CardTitle>
                <CardDescription>Share your QR code or link to invite others</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG 
                  value={referralLink || window.location.origin}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </div>
              
              {/* Referral Info */}
              <div className="flex-1 space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Referral Code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold text-primary">
                      {referralCode?.code || 'Loading...'}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyReferralCode}>
                      {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Referral Link</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm truncate max-w-[200px]">
                      {referralLink || 'Loading...'}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={shareReferralLink} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/referrals')}>
                    View Referrals
                  </Button>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-muted/20 rounded p-2 text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalReferrals}</p>
                    <p className="text-xs text-muted-foreground">Total Referrals</p>
                  </div>
                  <div className="bg-muted/20 rounded p-2 text-center">
                    <p className="text-2xl font-bold text-green-500">${stats.totalEarnings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Key className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                        <CardDescription>Add an extra layer of security</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                      Not Enabled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Enable 2FA
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Smartphone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Device Management</CardTitle>
                      <CardDescription>Manage your trusted devices</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div>
                          <p className="font-medium">Current Device</p>
                          <p className="text-sm text-muted-foreground">Last active: Just now</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Change Password</CardTitle>
                      <CardDescription>Update your password regularly</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Change Password
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>
                  Complete verification to unlock full platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verification.progress >= 33 ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {verification.progress >= 33 ? <Check className="h-4 w-4 text-white" /> : '1'}
                      </div>
                      <div>
                        <p className="font-medium">Basic Information</p>
                        <p className="text-sm text-muted-foreground">Email verified</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400/30">
                      Complete
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verification.progress >= 66 ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {verification.progress >= 66 ? <Check className="h-4 w-4 text-white" /> : '2'}
                      </div>
                      <div>
                        <p className="font-medium">Identity Document</p>
                        <p className="text-sm text-muted-foreground">Upload ID/Passport</p>
                      </div>
                    </div>
                    {kycStatus?.status ? (
                      <Badge variant="outline">{kycStatus.status}</Badge>
                    ) : (
                      <Button size="sm">Upload</Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verification.progress >= 100 ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {verification.progress >= 100 ? <Check className="h-4 w-4 text-white" /> : '3'}
                      </div>
                      <div>
                        <p className="font-medium">Selfie Verification</p>
                        <p className="text-sm text-muted-foreground">Take a selfie with your ID</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={profile?.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue={profile?.phone || ''} placeholder="+1 234 567 8900" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input defaultValue={profile?.country || ''} placeholder="Select country" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent account activity and login history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium">Login Successful</p>
                        <p className="text-sm text-muted-foreground">Current session</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/referrals')}>
            <Link2 className="h-5 w-5" />
            <span>Referral Program</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/wallet')}>
            <Wallet className="h-5 w-5" />
            <span>My Wallets</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
            <span>Preferences</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/help')}>
            <Activity className="h-5 w-5" />
            <span>Help Center</span>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
