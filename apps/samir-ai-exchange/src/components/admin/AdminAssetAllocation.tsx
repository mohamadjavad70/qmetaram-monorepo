import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Loader2, Server, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const AdminAssetAllocation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'to_agent' | 'to_master'>('to_agent');

  const { data: reserves, isLoading: reservesLoading } = useQuery({
    queryKey: ['system-reserves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_reserves')
        .select('*')
        .eq('label', 'Master Node')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['ai-agents-allocation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('id, name, slug, current_balance, initial_capital, icon_emoji, status')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const transferMutation = useMutation({
    mutationFn: async ({ agentId, transferAmount, dir }: { agentId: string; transferAmount: number; dir: 'to_agent' | 'to_master' }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('execute_safe_transfer', {
        p_agent_id: agentId,
        p_amount: transferAmount,
        p_direction: dir,
        p_admin_id: user.id,
      });

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-reserves'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents-allocation'] });
      toast.success('Atomic transfer completed successfully');
      setAmount('');
      setSelectedAgent(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleTransfer = () => {
    if (!selectedAgent || !amount) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    transferMutation.mutate({ agentId: selectedAgent, transferAmount: num, dir: direction });
  };

  const isLoading = reservesLoading || agentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const surplusAgents = agents?.filter(a => a.current_balance > a.initial_capital) || [];

  return (
    <div className="space-y-6">
      {/* Master Node */}
      <Card className="bg-card/50 backdrop-blur border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Master Node
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">
            ${reserves?.balance?.toLocaleString() ?? '0'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">System Reserve Pool</p>
        </CardContent>
      </Card>

      {/* Transfer Panel */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Atomic Transfer (Safe RPC)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={direction === 'to_agent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDirection('to_agent')}
            >
              <ArrowDown className="h-4 w-4 mr-1" /> Master → Agent
            </Button>
            <Button
              variant={direction === 'to_master' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDirection('to_master')}
            >
              <ArrowUp className="h-4 w-4 mr-1" /> Agent → Master
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={selectedAgent || ''}
              onChange={e => setSelectedAgent(e.target.value || null)}
            >
              <option value="">Select Agent</option>
              {agents?.map(a => (
                <option key={a.id} value={a.id}>
                  {a.icon_emoji} {a.name} (${a.current_balance.toLocaleString()})
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Amount (USD)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
            />
            <Button
              onClick={handleTransfer}
              disabled={!selectedAgent || !amount || transferMutation.isPending}
            >
              {transferMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Execute Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Surplus Agents Alert */}
      {surplusAgents.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-400">⚠️ Agents with Surplus Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {surplusAgents.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <span>{a.icon_emoji}</span>
                    <span className="font-medium">{a.name}</span>
                    <Badge variant="outline" className="text-yellow-400">
                      +${(a.current_balance - a.initial_capital).toLocaleString()} surplus
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAgent(a.id);
                      setAmount(String(a.current_balance - a.initial_capital));
                      setDirection('to_master');
                    }}
                  >
                    Consolidate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Sub-nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents?.map(a => (
          <Card key={a.id} className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{a.icon_emoji}</div>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {a.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-mono">${a.current_balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initial</span>
                  <span className="font-mono">${a.initial_capital.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
