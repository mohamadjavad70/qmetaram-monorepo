import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  TrendingUp, 
  Download,
  ChevronDown,
  ChevronRight,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReferrals } from '@/hooks/useReferrals';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface ReferralNode {
  id: string;
  name: string;
  email: string;
  level: number;
  earnings: number;
  joinDate: string;
  status: 'active' | 'inactive';
  children?: ReferralNode[];
}

function TreeNode({ node, expanded, onToggle }: { node: ReferralNode; expanded: Set<string>; onToggle: (id: string) => void }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <div className="space-y-2">
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
          node.level === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/30 hover:bg-secondary/50'
        }`}
      >
        {hasChildren ? (
          <button onClick={() => onToggle(node.id)} className="p-1">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className={`p-2 rounded-full ${node.status === 'active' ? 'bg-green-500/20' : 'bg-muted'}`}>
          <User className={`h-4 w-4 ${node.status === 'active' ? 'text-green-400' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex-1">
          <p className="font-medium">{node.name}</p>
          <p className="text-xs text-muted-foreground">{node.email}</p>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-green-400">${node.earnings.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Level {node.level}</p>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-8 pl-4 border-l border-border space-y-2">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Referrals() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuthContext();
  const { referralCode, referrals, commissions, stats, isLoading, getReferralLink, refreshData } = useReferrals();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyLink = () => {
    const link = getReferralLink();
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied!');
    }
  };

  const shareLink = async () => {
    const link = getReferralLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Samir Exchange',
          text: 'Trade cryptocurrencies and earn rewards on Samir Exchange!',
          url: link,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyLink();
    }
  };

  const exportCSV = () => {
    if (referrals.length === 0) {
      toast.error('No referral data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Level', 'Status', 'Commission Earned', 'Join Date'];
    const rows = referrals.map(r => [
      r.referred_user?.full_name || 'Unknown',
      r.referred_user?.email || 'N/A',
      r.level,
      r.status,
      r.total_commission_earned,
      new Date(r.created_at).toLocaleDateString()
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referrals-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  // Build tree data from referrals
  const buildTreeData = (): ReferralNode => {
    const rootNode: ReferralNode = {
      id: 'root',
      name: 'You',
      email: user?.email || 'your@email.com',
      level: 0,
      earnings: stats.totalEarnings,
      joinDate: new Date().toISOString(),
      status: 'active',
      children: referrals.map(r => ({
        id: r.id,
        name: r.referred_user?.full_name || 'User',
        email: r.referred_user?.email || 'N/A',
        level: r.level,
        earnings: r.total_commission_earned || 0,
        joinDate: r.created_at,
        status: r.status === 'active' ? 'active' : 'inactive',
      })),
    };
    return rootNode;
  };

  const referralTree = buildTreeData();

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4">Please login to access the referral program</p>
          <Button onClick={() => window.location.href = '/auth'}>Login to Continue</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t('referralProgram')}</h1>
            <p className="text-muted-foreground mt-1">Earn commissions by inviting friends</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={exportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{t('yourReferralLink')}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    value={isLoading ? 'Loading...' : getReferralLink()} 
                    readOnly 
                    className="font-mono bg-background/50 flex-1" 
                  />
                  <div className="flex gap-2">
                    <Button onClick={copyLink} className="gap-2" disabled={isLoading}>
                      <Copy className="h-4 w-4" />
                      {t('copyLink')}
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={shareLink}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                {referralCode && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Your referral code: <span className="font-mono font-bold text-primary">{referralCode.code}</span>
                    {referralCode.uses_count > 0 && (
                      <span className="ml-2">• Used {referralCode.uses_count} times</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalReferrals')}</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalReferrals}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalEarnings')}</p>
                  <p className="text-2xl font-bold text-green-400">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${stats.totalEarnings.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <Gift className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('pendingRewards')}</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${stats.pendingCommissions.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-secondary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeReferrals}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Rates */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Commission Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-4xl font-bold text-primary">10%</p>
                <p className="text-sm text-muted-foreground mt-1">Level 1 Commission</p>
                <p className="text-xs text-muted-foreground">Direct referrals</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-4xl font-bold text-primary/70">5%</p>
                <p className="text-sm text-muted-foreground mt-1">Level 2 Commission</p>
                <p className="text-xs text-muted-foreground">Referrals of your referrals</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-4xl font-bold text-primary/50">2%</p>
                <p className="text-sm text-muted-foreground mt-1">Level 3 Commission</p>
                <p className="text-xs text-muted-foreground">Third tier referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Tree */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('referralTree')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet</p>
                <p className="text-sm">Share your referral link to start earning commissions!</p>
              </div>
            ) : (
              <TreeNode node={referralTree} expanded={expanded} onToggle={toggleExpand} />
            )}
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        {commissions.length > 0 && (
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Recent Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{new Date(commission.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono">${commission.commission_amount.toFixed(2)}</TableCell>
                      <TableCell>{(commission.commission_rate * 100).toFixed(0)}%</TableCell>
                      <TableCell>
                        <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                          {commission.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
