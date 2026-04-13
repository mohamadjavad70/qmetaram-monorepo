import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, XCircle, Clock, Wallet, CreditCard, 
  Shield, Loader2, DollarSign, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function AdminPayoutApprovals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  const { data: requests, isLoading } = useQuery({
    queryKey: ['payout-requests-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status,
          admin_note: note || null,
          approved_by: user?.id || null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-requests-admin'] });
      toast.success('Payout request updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const pending = requests?.filter(r => r.status === 'waiting_approval' || r.status === 'pending') || [];
  const processed = requests?.filter(r => !['waiting_approval', 'pending'].includes(r.status)) || [];

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      waiting_approval: { variant: 'destructive', icon: AlertTriangle },
      approved: { variant: 'default', icon: CheckCircle },
      completed: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'outline', icon: XCircle },
      failed: { variant: 'outline', icon: XCircle },
      processing: { variant: 'secondary', icon: Loader2 },
    };
    const cfg = map[status] || map.pending;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" /> {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card className="glass-panel border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Pending Approvals ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="p-4 rounded-lg bg-secondary/30 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {req.payout_type === 'crypto' ? (
                        <Wallet className="h-5 w-5 text-primary" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <span className="font-medium">{req.payout_type === 'crypto' ? 'Crypto' : 'Visa/MC'}</span>
                        <span className="text-xs text-muted-foreground ml-2">{req.payout_session_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(req.status)}
                      {req.risk_flag && (
                        <Badge variant="outline" className="text-xs">{req.risk_flag}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-mono font-bold">${Number(req.amount_usd).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee:</span>
                      <p className="font-mono text-amber-400">${Number(req.fee_usd).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net:</span>
                      <p className="font-mono text-green-400">${Number(req.net_amount_usd).toFixed(2)}</p>
                    </div>
                  </div>

                  {req.payout_type === 'crypto' && req.wallet_address && (
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      Wallet: {req.wallet_address}
                    </p>
                  )}
                  {req.payout_type === 'fiat' && (
                    <p className="text-xs text-muted-foreground">
                      Card: {req.card_number_masked} | {req.cardholder_name}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Admin note (optional)..."
                      value={adminNote[req.id] || ''}
                      onChange={(e) => setAdminNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="text-sm flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: req.id, status: 'approved', note: adminNote[req.id] })}
                      disabled={updateMutation.isPending}
                      className="gap-1"
                    >
                      <CheckCircle className="h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateMutation.mutate({ id: req.id, status: 'rejected', note: adminNote[req.id] })}
                      disabled={updateMutation.isPending}
                      className="gap-1"
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Processed */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Recent Payouts ({processed.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processed.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No processed requests yet</p>
          ) : (
            <div className="space-y-2">
              {processed.slice(0, 20).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    {req.payout_type === 'crypto' ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    <span className="font-mono text-sm">${Number(req.amount_usd).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{req.payout_session_id}</span>
                  </div>
                  {statusBadge(req.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
