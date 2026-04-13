import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Lock, Send, Loader2, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Tier = 'basic' | 'pro' | 'superpro';

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentSlug: string;
}

function getTier(balance: number): Tier {
  if (balance >= 5000) return 'superpro';
  if (balance >= 500) return 'pro';
  return 'basic';
}

const tierConfig: Record<Tier, { label: string; color: string; icon: typeof Crown }> = {
  basic: { label: 'Basic', color: 'bg-muted text-muted-foreground', icon: MessageCircle },
  pro: { label: 'Pro', color: 'bg-primary/20 text-primary', icon: Zap },
  superpro: { label: 'Super Pro', color: 'bg-amber-500/20 text-amber-400', icon: Crown },
};

export function AgentChat({ agentId, agentName, agentSlug }: AgentChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user's USDT balance to determine tier
  const { data: walletBalance } = useQuery({
    queryKey: ['wallet-balance-tier', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from('user_wallets')
        .select('balance, platform_assets!inner(symbol)')
        .eq('user_id', user.id)
        .eq('platform_assets.symbol', 'USDT');
      
      if (data && data.length > 0) return Number((data[0] as any).balance) || 0;
      return 0;
    },
    enabled: !!user,
  });

  const tier = getTier(walletBalance || 0);
  const canChat = tier === 'pro' || tier === 'superpro';
  const TierIcon = tierConfig[tier].icon;

  // Fetch chat history
  const { data: messages } = useQuery({
    queryKey: ['chat-history', agentId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Insert user message
      await supabase.from('chat_history').insert({
        user_id: user.id,
        agent_id: agentId,
        role: 'user',
        content,
        tier,
      });

      // Simulate AI response
      const aiResponse = generateAIResponse(agentName, content);
      await supabase.from('chat_history').insert({
        user_id: user.id,
        agent_id: agentId,
        role: 'assistant',
        content: aiResponse,
        tier,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', agentId] });
      setMessage('');
    },
  });

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`chat-${agentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_history',
        filter: `agent_id=eq.${agentId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['chat-history', agentId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [agentId, user, queryClient]);

  const handleSend = () => {
    if (!message.trim() || sendMessage.isPending) return;
    sendMessage.mutate(message.trim());
  };

  if (!user) {
    return (
      <Card className="glass-panel border-border/30">
        <CardContent className="p-6 text-center">
          <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to interact with {agentName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-primary" />
            Chat with {agentName}
          </CardTitle>
          <Badge className={tierConfig[tier].color}>
            <TierIcon className="h-3 w-3 mr-1" />
            {tierConfig[tier].label}
          </Badge>
        </div>
        {tier === 'basic' && (
          <p className="text-xs text-muted-foreground">
            Hold ≥500 USDT to unlock Pro chat • ≥5000 USDT for Copy Trade
          </p>
        )}
        {tier === 'superpro' && (
          <p className="text-xs text-amber-400">
            🔥 Copy Trade enabled — {agentName}'s trades are mirrored to your wallet
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-56 rounded-lg bg-secondary/20 p-3">
          {messages && messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/60 border border-border/30'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {canChat
                ? `Ask ${agentName} about market analysis...`
                : `Upgrade to Pro to chat with ${agentName}`}
            </div>
          )}
        </ScrollArea>

        {canChat ? (
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ask ${agentName}...`}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sendMessage.isPending}
            />
            <Button onClick={handleSend} size="icon" disabled={sendMessage.isPending || !message.trim()}>
              {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
            <Lock className="h-4 w-4 inline mr-1" />
            Hold ≥500 USDT to unlock interactive chat
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function generateAIResponse(agentName: string, question: string): string {
  const responses: Record<string, string[]> = {
    default: [
      `Based on my analysis, the current market conditions suggest caution. I'm monitoring key resistance levels.`,
      `I've identified a potential opportunity. RSI is approaching oversold territory — watching for confirmation.`,
      `Market volatility is elevated. My models suggest a consolidation phase before the next move.`,
      `I'm processing multiple signals. The macro environment shows mixed indicators — I'll update when clarity emerges.`,
    ],
  };
  const pool = responses.default;
  return `**${agentName}:** ${pool[Math.floor(Math.random() * pool.length)]}`;
}
