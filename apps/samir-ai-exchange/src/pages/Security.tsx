import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  Monitor, 
  MapPin,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const loginHistory = [
  { id: 1, device: 'Chrome on Windows', location: 'Berlin, Germany', ip: '192.168.1.xxx', time: '2024-01-15 14:30', current: true },
  { id: 2, device: 'Safari on iPhone', location: 'Istanbul, Turkey', ip: '10.0.0.xxx', time: '2024-01-14 09:15', current: false },
  { id: 3, device: 'Firefox on MacOS', location: 'London, UK', ip: '172.16.0.xxx', time: '2024-01-12 18:45', current: false },
];

const devices = [
  { id: 1, name: 'Windows PC', type: 'desktop', lastActive: '2024-01-15 14:30', trusted: true },
  { id: 2, name: 'iPhone 15 Pro', type: 'mobile', lastActive: '2024-01-14 09:15', trusted: true },
  { id: 3, name: 'MacBook Pro', type: 'laptop', lastActive: '2024-01-12 18:45', trusted: false },
];

export default function Security() {
  const { t } = useLanguage();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
    toast.success('Two-Factor Authentication enabled!');
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const revokeDevice = (id: number) => {
    toast.success('Device access revoked');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('security')}</h1>
          <p className="text-muted-foreground mt-1">Manage your account security settings</p>
        </div>

        {/* Security Status */}
        <Card className="glass-panel bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-success/20">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security Score: 75%</h2>
                <p className="text-muted-foreground">Enable 2FA to improve your security score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('twoFactorAuth')}
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${twoFactorEnabled ? 'bg-success/20' : 'bg-warning/20'}`}>
                    {twoFactorEnabled ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                    </p>
                  </div>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={handleEnable2FA} />
              </div>

              {!twoFactorEnabled && (
                <Button onClick={handleEnable2FA} className="w-full">
                  {t('enable2FA')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('changePassword')}
              </CardTitle>
              <CardDescription>
                Update your password regularly for better security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">New Password</label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              <Button onClick={handleChangePassword} className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Login History */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('loginHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginHistory.map((login) => (
                <div key={login.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {login.device}
                        {login.current && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">
                            Current
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {login.location}
                        </span>
                        <span>{login.ip}</span>
                        <span>{login.time}</span>
                      </div>
                    </div>
                  </div>
                  {!login.current && (
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Management */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {t('deviceManagement')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${device.trusted ? 'bg-success/20' : 'bg-muted'}`}>
                      {device.trusted ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">Last active: {device.lastActive}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => revokeDevice(device.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
