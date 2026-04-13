import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Check, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'deposit',
    asset: 'EUR',
    amount: 5000,
    status: 'completed',
    time: '2 min ago',
    reference: 'DEP-2024-001',
  },
  {
    id: 2,
    type: 'exchange',
    asset: 'EUR → USD',
    amount: 2500,
    status: 'completed',
    time: '15 min ago',
    reference: 'EXC-2024-003',
  },
  {
    id: 3,
    type: 'withdrawal',
    asset: 'BTC',
    amount: 0.05,
    status: 'pending',
    time: '1 hour ago',
    reference: 'WTH-2024-002',
  },
  {
    id: 4,
    type: 'deposit',
    asset: 'USDT',
    amount: 10000,
    status: 'completed',
    time: '3 hours ago',
    reference: 'DEP-2024-004',
  },
  {
    id: 5,
    type: 'withdrawal',
    asset: 'EUR',
    amount: 1500,
    status: 'failed',
    time: '5 hours ago',
    reference: 'WTH-2024-001',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return ArrowDownRight;
    case 'withdrawal':
      return ArrowUpRight;
    case 'exchange':
      return ArrowLeftRight;
    default:
      return ArrowLeftRight;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return Check;
    case 'pending':
      return Clock;
    case 'failed':
      return X;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-success bg-success/10';
    case 'pending':
      return 'text-warning bg-warning/10';
    case 'failed':
      return 'text-destructive bg-destructive/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export function RecentActivity() {
  return (
    <div className="glass-panel">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-lg">Recent Activity</h2>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="divide-y divide-border">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const StatusIcon = getStatusIcon(activity.status);
          
          return (
            <div
              key={activity.id}
              className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    activity.type === 'deposit'
                      ? 'bg-success/10 text-success'
                      : activity.type === 'withdrawal'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm capitalize">{activity.type}</p>
                    <span className="text-xs text-muted-foreground font-mono">
                      {activity.reference}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>

                <div className="text-right">
                  <p className="font-mono font-medium text-sm">
                    {activity.type === 'withdrawal' ? '-' : '+'}
                    {activity.amount.toLocaleString()} {activity.asset.split(' ')[0]}
                  </p>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(activity.status)
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {activity.status}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
