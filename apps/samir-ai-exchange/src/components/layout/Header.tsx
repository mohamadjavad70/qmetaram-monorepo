import { Bell, Search, Globe, Sun, Moon, User, LogOut, Settings, Shield, HelpCircle } from 'lucide-react';
import samirLogo from '@/assets/samir-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇨🇭' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr' as Language, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
  { code: 'fa' as Language, name: 'فارسی', flag: '🇮🇷' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
];

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const currentLang = languages.find(l => l.code === language);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('search')} className="pl-10 bg-secondary/50 border-transparent focus:border-primary/30" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs font-medium text-success">{t('live')}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <span className="text-lg">{currentLang?.flag}</span>
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)} className="gap-2 cursor-pointer">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" className="gap-2 ml-2">
                <img src={samirLogo} alt="Samir" className="w-7 h-7 rounded-full object-cover" />
                <span className="text-sm font-medium truncate max-w-[120px]">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer gap-2">
                <User className="h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/security')} className="cursor-pointer gap-2">
                <Shield className="h-4 w-4" />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/help')} className="cursor-pointer gap-2">
                <HelpCircle className="h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
