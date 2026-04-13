import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InvestInAgentProps {
  agentId: string;
  agentName: string;
  tokenSymbol: string | null;
}

export function InvestInAgent({ agentId, agentName, tokenSymbol }: InvestInAgentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');

  // Fetch user's existing investments in this agent
  const { data: investments } = useQuery({
    queryKey: ['user-investments', agentId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_investment_ledger')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', agentId)
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount_usd), 0) || 0;

  const investMutation = useMutation({
    mutationFn: async (amountUsd: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('user_investment_ledger').insert({
        user_id: user.id,
        agent_id: agentId,
        amount_usd: amountUsd,
        current_value: amountUsd,
        entry_price: 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-investments', agentId] });
      setAmount('');
      toast.success(`Successfully invested in ${agentName}!`, {
        description: `Your funds are now under ${agentName}'s management.`,
      });
    },
    onError: (err: Error) => {
      toast.error('Investment failed', { description: err.message });
    },
  });

  const handleInvest = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 10) {
      toast.error('Minimum investment is $10');
      return;
    }
    if (val > 100000) {
      toast.error('Maximum single investment is $100,000');
      return;
    }
    investMutation.mutate(val);
  };

  if (!user) {
    return (
      <Card className="glass-panel border-green-500/20">
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          <p>Sign in to invest with {agentName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-green-400" />
          Invest with {agentName}
          {tokenSymbol && <Badge variant="outline" className="text-xs">{tokenSymbol}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalInvested > 0 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Active Investment</span>
              <span className="font-bold text-green-400 mono-text">${totalInvested.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min $10)"
              className="pl-9"
              min={10}
              max={100000}
            />
          </div>
          <Button 
            onClick={handleInvest} 
            disabled={investMutation.isPending || !amount}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
          >
            {investMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                INVEST NOW
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          {[100, 500, 1000, 5000].map((v) => (
            <Button key={v} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setAmount(String(v))}>
              ${v.toLocaleString()}
            </Button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Funds managed by {agentName}'s {tokenSymbol ? `${tokenSymbol} ` : ''}strategy. Min $10 • Max $100K per transaction.
        </p>
      </CardContent>
    </Card>
  );
}
