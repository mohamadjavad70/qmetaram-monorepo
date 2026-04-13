import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminKYCApprovals } from '@/components/admin/AdminKYCApprovals';
import { AdminTokenPricing } from '@/components/admin/AdminTokenPricing';
import { AdminOTPRateLimits } from '@/components/admin/AdminOTPRateLimits';
import { AdminSecurityRealtime } from '@/components/admin/AdminSecurityRealtime';
import { AdminInviteManagement } from '@/components/admin/AdminInviteManagement';
import { AdminAssetAllocation } from '@/components/admin/AdminAssetAllocation';
import { AdminLoginEvents } from '@/components/admin/AdminLoginEvents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, FileCheck, Coins, Loader2, ShieldAlert, Radio, Link2, Server, Activity } from 'lucide-react';

const Admin = () => {
  const { isAdmin, isLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, KYC verifications, and platform tokens</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Users</p>
                  <p className="text-sm text-muted-foreground">Manage all users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <FileCheck className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">KYC</p>
                  <p className="text-sm text-muted-foreground">Pending approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Coins className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Tokens</p>
                  <p className="text-sm text-muted-foreground">Price management</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <ShieldAlert className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Security</p>
                  <p className="text-sm text-muted-foreground">OTP rate limits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-card/50 border border-border/50 flex-wrap">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              KYC Approvals
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Token Pricing
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              OTP Security
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="relative">
                Real-time
                <span className="absolute -top-1 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Invites
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Asset Allocation
            </TabsTrigger>
            <TabsTrigger value="login-events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Entry Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="kyc">
            <AdminKYCApprovals />
          </TabsContent>

          <TabsContent value="tokens">
            <AdminTokenPricing />
          </TabsContent>

          <TabsContent value="security">
            <AdminOTPRateLimits />
          </TabsContent>

          <TabsContent value="realtime">
            <AdminSecurityRealtime />
          </TabsContent>

          <TabsContent value="invites">
            <AdminInviteManagement />
          </TabsContent>

          <TabsContent value="allocation">
            <AdminAssetAllocation />
          </TabsContent>

          <TabsContent value="login-events">
            <AdminLoginEvents />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
