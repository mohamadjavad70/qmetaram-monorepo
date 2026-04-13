import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Globe, 
  Palette, 
  Mail,
  Phone,
  MapPin,
  Camera,
  Save
} from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+49 123 456 7890',
    country: 'Germany',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    priceAlerts: true,
    securityAlerts: true,
    transactionUpdates: true,
  });
  const { theme, setTheme } = useTheme();

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('settings')}</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-2">
              <Globe className="h-4 w-4" />
              Language
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>{t('profileSettings')}</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-foreground">JD</span>
                    </div>
                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">PNG or JPG, max 2MB</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">First Name</label>
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Last Name</label>
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Country
                    </label>
                    <Select value={profile.country} onValueChange={(v) => setProfile(p => ({ ...p, country: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Turkey">Turkey</SelectItem>
                        <SelectItem value="Iran">Iran</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="USA">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>{t('notificationSettings')}</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {Object.entries({
                    email: 'Email Notifications',
                    push: 'Push Notifications',
                    sms: 'SMS Notifications',
                    priceAlerts: 'Price Alerts',
                    securityAlerts: 'Security Alerts',
                    transactionUpdates: 'Transaction Updates',
                    marketing: 'Marketing & Promotions',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'securityAlerts' && 'Get notified about security events'}
                          {key === 'priceAlerts' && 'Receive alerts when prices change'}
                          {key === 'transactionUpdates' && 'Updates about your transactions'}
                        </p>
                      </div>
                      <Switch
                        checked={notifications[key as keyof typeof notifications]}
                        onCheckedChange={(v) => setNotifications(n => ({ ...n, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>{t('languageSettings')}</CardTitle>
                <CardDescription>Choose your preferred language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      className={`p-4 rounded-lg text-left transition-all ${
                        language === lang.code
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-secondary/30 hover:bg-secondary/50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <p className="font-medium">{lang.name}</p>
                          <p className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>{t('themeSettings')}</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-6 rounded-lg text-center transition-all ${
                      theme === 'dark'
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-secondary/30 hover:bg-secondary/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-[#0a0a0f] border border-border" />
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Optimized for traders</p>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`p-6 rounded-lg text-center transition-all ${
                      theme === 'light'
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-secondary/30 hover:bg-secondary/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-white border border-gray-200" />
                    <p className="font-medium">Light Mode</p>
                    <p className="text-xs text-muted-foreground">For general use</p>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`p-6 rounded-lg text-center transition-all ${
                      theme === 'system'
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-secondary/30 hover:bg-secondary/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-r from-[#0a0a0f] to-white border border-border" />
                    <p className="font-medium">System</p>
                    <p className="text-xs text-muted-foreground">Follow system setting</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
