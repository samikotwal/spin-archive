import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Wheel {
  id: string;
  user_id: string;
  title: string;
  is_public: boolean;
  share_code: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  wheel_id: string;
  value: string;
  weight: number;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export const useWheels = () => {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [activeWheelId, setActiveWheelId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWheels = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWheels([]); setIsLoading(false); return; }

    const { data, error } = await supabase
      .from('wheels')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) { console.error(error); return; }
    setWheels((data as Wheel[]) || []);
    if (data && data.length > 0 && !activeWheelId) {
      setActiveWheelId(data[0].id);
    }
  }, [activeWheelId]);

  const fetchEntries = useCallback(async (wheelId: string) => {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('wheel_id', wheelId)
      .order('sort_order', { ascending: true });

    if (error) { console.error(error); return; }
    setEntries((data as Entry[]) || []);
  }, []);

  useEffect(() => {
    fetchWheels().then(() => setIsLoading(false));
  }, [fetchWheels]);

  useEffect(() => {
    if (activeWheelId) fetchEntries(activeWheelId);
    else setEntries([]);
  }, [activeWheelId, fetchEntries]);

  const createWheel = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Login required', variant: 'destructive' }); return null; }

    const { data, error } = await supabase
      .from('wheels')
      .insert({ title, user_id: user.id })
      .select()
      .single();

    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return null; }
    const wheel = data as Wheel;
    setWheels(prev => [wheel, ...prev]);
    setActiveWheelId(wheel.id);
    toast({ title: 'Wheel Created', description: `"${title}" is ready` });
    return wheel;
  };

  const deleteWheel = async (wheelId: string) => {
    const { error } = await supabase.from('wheels').delete().eq('id', wheelId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setWheels(prev => prev.filter(w => w.id !== wheelId));
    if (activeWheelId === wheelId) {
      const remaining = wheels.filter(w => w.id !== wheelId);
      setActiveWheelId(remaining.length > 0 ? remaining[0].id : null);
    }
    toast({ title: 'Wheel Deleted' });
  };

  const renameWheel = async (wheelId: string, title: string) => {
    const { error } = await supabase.from('wheels').update({ title }).eq('id', wheelId);
    if (error) return;
    setWheels(prev => prev.map(w => w.id === wheelId ? { ...w, title } : w));
  };

  const togglePublic = async (wheelId: string) => {
    const wheel = wheels.find(w => w.id === wheelId);
    if (!wheel) return;
    const { error } = await supabase.from('wheels').update({ is_public: !wheel.is_public }).eq('id', wheelId);
    if (error) return;
    setWheels(prev => prev.map(w => w.id === wheelId ? { ...w, is_public: !w.is_public } : w));
  };

  const addEntries = async (values: string[]) => {
    if (!activeWheelId) return;
    const rows = values.map((value, i) => ({
      wheel_id: activeWheelId,
      value,
      weight: 1,
      sort_order: entries.length + i,
    }));

    const { data, error } = await supabase.from('entries').insert(rows).select();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setEntries(prev => [...prev, ...((data as Entry[]) || [])]);
  };

  const removeEntry = async (entryId: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', entryId);
    if (error) return;
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const updateEntryWeight = async (entryId: string, weight: number) => {
    const { error } = await supabase.from('entries').update({ weight }).eq('id', entryId);
    if (error) return;
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, weight } : e));
  };

  const clearEntries = async () => {
    if (!activeWheelId) return;
    const { error } = await supabase.from('entries').delete().eq('wheel_id', activeWheelId);
    if (error) return;
    setEntries([]);
  };

  const updateEntries = async (newValues: string[]) => {
    if (!activeWheelId) return;
    await supabase.from('entries').delete().eq('wheel_id', activeWheelId);
    if (newValues.length > 0) {
      const rows = newValues.map((value, i) => ({
        wheel_id: activeWheelId,
        value,
        weight: 1,
        sort_order: i,
      }));
      const { data } = await supabase.from('entries').insert(rows).select();
      setEntries((data as Entry[]) || []);
    } else {
      setEntries([]);
    }
  };

  // Weighted random selection
  const getWeightedRandomIndex = () => {
    if (entries.length === 0) return -1;
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < entries.length; i++) {
      random -= entries[i].weight;
      if (random <= 0) return i;
    }
    return entries.length - 1;
  };

  const activeWheel = wheels.find(w => w.id === activeWheelId) || null;
  const entryValues = entries.map(e => e.value);

  return {
    wheels, activeWheel, activeWheelId, setActiveWheelId,
    entries, entryValues, isLoading,
    createWheel, deleteWheel, renameWheel, togglePublic,
    addEntries, removeEntry, updateEntryWeight, clearEntries, updateEntries,
    getWeightedRandomIndex, fetchWheels,
  };
};
