import { useState } from 'react';
import samirLogo from '@/assets/samir-logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Users,
  Bot,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  TreePine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'exchange', href: '/exchange', icon: ArrowLeftRight },
  { name: 'tokens', href: '/tokens', icon: Sparkles, badge: 'New' },
  { name: 'wallet', href: '/wallet', icon: Wallet },
  { name: 'markets', href: '/markets', icon: TrendingUp },
  { name: 'referrals', href: '/referrals', icon: Users },
  { name: 'aiAssistant', href: '/ai-assistant', icon: Bot },
  { name: 'AI Market', href: '/ai-market', icon: TrendingUp, badge: '🔥' },
  { name: 'جنگل یادبود', href: '/memorial', icon: TreePine, badge: '🌳' },
];

const secondaryNav = [
  { name: 'admin', href: '/admin', icon: ShieldCheck, adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const { signOut, isAuthenticated } = useAuthContext();

  const filteredSecondaryNav = secondaryNav.filter(item => !item.adminOnly || isAdmin);

  const handleSignOut = async () => {
    if (isAuthenticated) {
      await signOut();
      toast.success('Signed out successfully');
    }
    navigate('/auth');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={samirLogo} alt="Samir Exchange" className="w-9 h-9 rounded-lg object-cover" />
          {!collapsed && (
            <span className="font-bold text-xl gradient-text">Samir</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const navItem = item as typeof item & { badge?: string };
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {!collapsed && (
                <>
                  <span className="font-medium text-sm">{t(item.name)}</span>
                  {navItem.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/20 text-primary">
                      {navItem.badge}
                    </span>
                  )}
                </>
              )}
              {isActive && !collapsed && !navItem.badge && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {filteredSecondaryNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                item.adminOnly && 'text-red-400 hover:text-red-300'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', item.adminOnly && 'text-red-400')} />
              {!collapsed && (
                <span className="text-sm">{t(item.name)}</span>
              )}
            </Link>
          );
        })}

        {/* User Profile / Logout */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">{t('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
}
