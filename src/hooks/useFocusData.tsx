import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FocusStats {
  daily_coins: number;
  weekly_coins: number;
  monthly_coins: number;
  current_streak: number;
  total_sessions: number;
  daily_screen_time_saved: number;
  today_sessions: number;
  last_activity_date: string;
  break_glass_used: number;
  break_glass_reset_date: string;
}

export interface FocusSession {
  id: string;
  duration: number;
  session_type: 'quick' | 'deep' | 'power';
  start_time: string;
  end_time: string | null;
  completed: boolean;
  coins_earned: number;
}

export interface WhitelistItem {
  id: string;
  item_type: 'url' | 'app';
  value: string;
  description: string | null;
  category: 'educational' | 'library' | 'emergency';
}

const DEFAULT_STATS: FocusStats = {
  daily_coins: 0,
  weekly_coins: 0,
  monthly_coins: 0,
  current_streak: 0,
  total_sessions: 0,
  daily_screen_time_saved: 0,
  today_sessions: 0,
  last_activity_date: '',
  break_glass_used: 0,
  break_glass_reset_date: new Date().toISOString(),
};

export function useFocusData() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FocusStats>(DEFAULT_STATS);
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('focus_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setStats(data as unknown as FocusStats);
  }, [user]);

  const fetchWhitelist = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('focus_whitelist')
      .select('*')
      .eq('user_id', user.id);
    if (data) setWhitelist(data as unknown as WhitelistItem[]);
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([fetchStats(), fetchWhitelist()]).finally(() => setLoading(false));
  }, [user, fetchStats, fetchWhitelist]);

  const calculateCoins = (duration: number, type: string) => {
    const base = duration * 2;
    const mult = type === 'power' ? 2 : type === 'deep' ? 1.5 : 1;
    return Math.floor(base * mult);
  };

  const startSession = async (duration: number, type: 'quick' | 'deep' | 'power') => {
    if (!user) return null;
    const coins = calculateCoins(duration, type);
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        duration,
        session_type: type,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + duration * 60 * 1000).toISOString(),
        completed: false,
        coins_earned: coins,
      })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as FocusSession;
  };

  const completeSession = async (sessionId: string, coinsEarned: number, duration: number) => {
    if (!user) return;
    await supabase
      .from('focus_sessions')
      .update({ completed: true })
      .eq('id', sessionId);

    const today = new Date().toDateString();
    const isNewDay = stats.last_activity_date !== today;

    await supabase
      .from('focus_stats')
      .update({
        daily_coins: isNewDay ? coinsEarned : stats.daily_coins + coinsEarned,
        weekly_coins: stats.weekly_coins + coinsEarned,
        monthly_coins: stats.monthly_coins + coinsEarned,
        total_sessions: stats.total_sessions + 1,
        today_sessions: isNewDay ? 1 : stats.today_sessions + 1,
        current_streak: isNewDay ? 1 : stats.current_streak + 1,
        daily_screen_time_saved: isNewDay ? duration : stats.daily_screen_time_saved + duration,
        last_activity_date: today,
      })
      .eq('user_id', user.id);

    await fetchStats();
  };

  const breakSession = async () => {
    if (!user) return false;
    const currentMonth = new Date().getMonth();
    const resetMonth = stats.break_glass_reset_date
      ? new Date(stats.break_glass_reset_date).getMonth()
      : -1;

    let used = stats.break_glass_used;
    let resetDate = stats.break_glass_reset_date;

    if (currentMonth !== resetMonth) {
      used = 0;
      resetDate = new Date().toISOString();
    }

    if (used >= 2) return false;

    await supabase
      .from('focus_stats')
      .update({
        break_glass_used: used + 1,
        break_glass_reset_date: resetDate,
      })
      .eq('user_id', user.id);

    await fetchStats();
    return true;
  };

  const addWhitelistItem = async (value: string, description: string, category: 'educational' | 'library' | 'emergency' = 'educational') => {
    if (!user) return;
    await supabase.from('focus_whitelist').insert({
      user_id: user.id,
      item_type: 'url',
      value,
      description,
      category,
    });
    await fetchWhitelist();
  };

  const removeWhitelistItem = async (id: string) => {
    if (!user) return;
    await supabase.from('focus_whitelist').delete().eq('id', id);
    await fetchWhitelist();
  };

  return {
    stats,
    whitelist,
    loading,
    startSession,
    completeSession,
    breakSession,
    addWhitelistItem,
    removeWhitelistItem,
    refreshStats: fetchStats,
  };
}
