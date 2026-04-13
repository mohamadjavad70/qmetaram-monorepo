import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAIAgents() {
  return useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useAIAgent(slug: string) {
  return useQuery({
    queryKey: ['ai-agent', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useAgentTradeLogs(agentId: string | undefined) {
  return useQuery({
    queryKey: ['ai-trade-logs', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_trade_logs')
        .select('*')
        .eq('agent_id', agentId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
    refetchInterval: 10000,
  });
}

export function useAgentLearning(agentId: string | undefined) {
  return useQuery({
    queryKey: ['ai-learning', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_learning_vault')
        .select('*')
        .eq('agent_id', agentId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });
}

export function useRaceSnapshots() {
  return useQuery({
    queryKey: ['ai-race-snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_race_snapshots')
        .select('*, ai_agents(name, icon_emoji, token_symbol)')
        .order('snapshot_at', { ascending: false })
        .limit(9);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
}
