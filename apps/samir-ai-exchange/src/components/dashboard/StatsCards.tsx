import { TrendingUp, Users, ArrowLeftRight, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

function useStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [tradesRes, profilesRes, kycRes] = await Promise.all([
        supabase.from('trades').select('from_amount', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('kyc_verifications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      ]);

      const totalVolume = tradesRes.data?.reduce((sum, t) => sum + Number(t.from_amount ?? 0), 0) ?? 0;

      return {
        totalVolume,
        tradeCount: tradesRes.count ?? 0,
        userCount: profilesRes.count ?? 0,
        verifiedCount: kycRes.count ?? 0,
      };
    },
    staleTime: 60_000,
  });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function StatsCards() {
  const { data, isLoading } = useStats();

  const stats = [
    { title: 'Total Volume', value: data ? formatNumber(data.totalVolume) : '-', icon: TrendingUp },
    { title: 'Active Users', value: data ? data.userCount.toLocaleString() : '-', icon: Users },
    { title: 'Transactions', value: data ? data.tradeCount.toLocaleString() : '-', icon: ArrowLeftRight },
    { title: 'Verified Users', value: data ? data.verifiedCount.toLocaleString() : '-', icon: Shield },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.title} className="glass-panel p-5 trading-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
