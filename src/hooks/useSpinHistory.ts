import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpinRecord {
  id: string;
  wheel_id: string;
  winner_value: string;
  user_id: string;
  created_at: string;
}

export const useSpinHistory = () => {
  const [history, setHistory] = useState<SpinRecord[]>([]);

  const recordSpin = async (wheelId: string, winnerValue: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('spins')
      .insert({ wheel_id: wheelId, winner_value: winnerValue, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setHistory(prev => [data as SpinRecord, ...prev]);
    }
  };

  const fetchHistory = useCallback(async (wheelId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('spins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (wheelId) query = query.eq('wheel_id', wheelId);

    const { data } = await query;
    setHistory((data as SpinRecord[]) || []);
  }, []);

  const getWinnerStats = () => {
    const counts: Record<string, number> = {};
    history.forEach(s => { counts[s.winner_value] = (counts[s.winner_value] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, wins]) => ({ name, wins }));
  };

  return { history, recordSpin, fetchHistory, getWinnerStats };
};
