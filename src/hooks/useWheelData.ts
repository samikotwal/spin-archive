import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WheelItem {
  id: string;
  value: string;
  image_url?: string | null;
  created_at: string;
}

interface List {
  id: string;
  title: string;
  created_at: string;
}

interface DeletedItem {
  id: string;
  value: string;
  list_id: string;
  deleted_at: string;
}

export interface WheelDisplayItem {
  name: string;
  imageUrl?: string | null;
}

export const useWheelData = () => {
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWheelItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('wheel_items')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching wheel items:', error);
      return;
    }
    setWheelItems(data || []);
  }, []);

  const fetchLists = useCallback(async () => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lists:', error);
      return;
    }
    setLists(data || []);
    if (data && data.length > 0 && !selectedListId) {
      setSelectedListId(data[0].id);
    }
  }, [selectedListId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchWheelItems(), fetchLists()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchWheelItems, fetchLists]);

  const addWheelItems = async (items: WheelDisplayItem[]) => {
    const rows = items.map(item => ({ 
      value: item.name, 
      image_url: item.imageUrl || null,
      is_deleted: false 
    }));
    
    const { data, error } = await supabase
      .from('wheel_items')
      .insert(rows)
      .select();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add items', variant: 'destructive' });
      return;
    }

    setWheelItems(prev => [...prev, ...(data || [])]);
    toast({ title: 'Items Added', description: `Added ${items.length} item(s) to the wheel` });
  };

  const removeWheelItem = async (index: number) => {
    const item = wheelItems[index];
    if (!item) return;

    const { error } = await supabase
      .from('wheel_items')
      .update({ is_deleted: true })
      .eq('id', item.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' });
      return;
    }

    setWheelItems(prev => prev.filter((_, i) => i !== index));
  };

  const deleteAndSaveToList = async (index: number) => {
    const item = wheelItems[index];
    if (!item || !selectedListId) {
      toast({ title: 'No List Selected', description: 'Please select a list to save deleted items', variant: 'destructive' });
      return false;
    }

    // Check for duplicates in the selected list
    const { data: existingItems } = await supabase
      .from('deleted_items')
      .select('id')
      .eq('list_id', selectedListId)
      .eq('value', item.value)
      .limit(1);

    if (existingItems && existingItems.length > 0) {
      toast({ title: 'Duplicate', description: `"${item.value}" is already in this list`, variant: 'destructive' });
      // Still remove from wheel even if duplicate in list
      const { error: updateError } = await supabase
        .from('wheel_items')
        .update({ is_deleted: true })
        .eq('id', item.id);
      if (!updateError) setWheelItems(prev => prev.filter((_, i) => i !== index));
      return false;
    }

    const { error: insertError } = await supabase
      .from('deleted_items')
      .insert({ value: item.value, list_id: selectedListId });

    if (insertError) {
      toast({ title: 'Error', description: 'Failed to save item to list', variant: 'destructive' });
      return false;
    }

    const { error: updateError } = await supabase
      .from('wheel_items')
      .update({ is_deleted: true })
      .eq('id', item.id);

    if (updateError) {
      toast({ title: 'Error', description: 'Failed to remove item from wheel', variant: 'destructive' });
      return false;
    }

    setWheelItems(prev => prev.filter((_, i) => i !== index));
    const list = lists.find(l => l.id === selectedListId);
    toast({ title: 'Item Saved', description: `"${item.value}" saved to "${list?.title}"` });
    return true;
  };

  const clearAllItems = async () => {
    const { error } = await supabase
      .from('wheel_items')
      .update({ is_deleted: true })
      .eq('is_deleted', false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to clear items', variant: 'destructive' });
      return;
    }

    setWheelItems([]);
    toast({ title: 'Cleared', description: 'All items removed from the wheel' });
  };

  const createList = async (title: string) => {
    const { data, error } = await supabase
      .from('lists')
      .insert({ title })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create list', variant: 'destructive' });
      return null;
    }

    setLists(prev => [data, ...prev]);
    setSelectedListId(data.id);
    toast({ title: 'List Created', description: `Created list "${title}"` });
    return data;
  };

  const deleteList = async (listId: string) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete list', variant: 'destructive' });
      return;
    }

    setLists(prev => prev.filter(l => l.id !== listId));
    if (selectedListId === listId) {
      setSelectedListId(lists.length > 1 ? lists.find(l => l.id !== listId)?.id || null : null);
    }
    toast({ title: 'List Deleted', description: 'List and its items have been deleted' });
  };

  const getListItems = async (listId: string): Promise<DeletedItem[]> => {
    const { data, error } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('list_id', listId)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error('Error fetching list items:', error);
      return [];
    }
    return data || [];
  };

  // Build display items with name + optional image
  const displayItems: WheelDisplayItem[] = wheelItems.map(item => ({
    name: item.value,
    imageUrl: item.image_url,
  }));

  return {
    wheelItems: wheelItems.map(item => item.value),
    wheelItemsFull: wheelItems,
    displayItems,
    lists,
    selectedListId,
    setSelectedListId,
    isLoading,
    addWheelItems,
    removeWheelItem,
    deleteAndSaveToList,
    clearAllItems,
    createList,
    deleteList,
    getListItems,
    fetchLists,
  };
};
