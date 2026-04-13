import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface DailyMission {
  id: string;
  mission_type: string;
  title: string;
  description: string | null;
  reward_noor: number;
  is_completed: boolean;
  completed_at: string | null;
  expires_at: string;
}

const MISSION_TEMPLATES = [
  { type: 'share_signal', title: '📡 Share a Tesla AI Signal', description: 'Visit the Tesla agent page and share one trading signal', reward: 0.5 },
  { type: 'check_market', title: '📊 Check Market Depth', description: 'Review the market overview on the dashboard', reward: 0.3 },
  { type: 'verify_friend', title: '👥 Invite a Friend', description: 'Share your referral link with someone new', reward: 1.0 },
  { type: 'review_portfolio', title: '💼 Review Portfolio', description: 'Check your wallet balances and recent trades', reward: 0.2 },
  { type: 'ai_consultation', title: '🤖 Consult AI Assistant', description: 'Ask the AI assistant for a market analysis', reward: 0.5 },
  { type: 'explore_agent', title: '🌌 Explore an Agent', description: 'Visit any AI agent page and review their strategy', reward: 0.3 },
];

export const useDailyMissions = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissions = useCallback(async () => {
    if (!user) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', today.toISOString())
      .order('created_at', { ascending: true });

    if (data && data.length >= 3) {
      setMissions(data);
    } else {
      // Generate 3 random missions for today
      const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const newMissions = shuffled.map(m => ({
        user_id: user.id,
        mission_type: m.type,
        title: m.title,
        description: m.description,
        reward_noor: m.reward,
        expires_at: tomorrow.toISOString(),
      }));

      const { data: inserted } = await supabase
        .from('daily_missions')
        .insert(newMissions)
        .select();

      if (inserted) setMissions(inserted);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) fetchMissions();
  }, [isAuthenticated, user, fetchMissions]);

  const completeMission = useCallback(async (missionId: string) => {
    const { error } = await supabase
      .from('daily_missions')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', missionId);
    
    if (!error) await fetchMissions();
    return !error;
  }, [fetchMissions]);

  const completedCount = missions.filter(m => m.is_completed).length;
  const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

  return { missions, isLoading, completeMission, completedCount, progress, totalMissions: missions.length };
};
