import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WheelItem {
  id: string;
  value: string;
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

export const useWheelData = () => {
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch wheel items
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

  // Fetch lists
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

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchWheelItems(), fetchLists()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchWheelItems, fetchLists]);

  // Add wheel items
  const addWheelItems = async (values: string[]) => {
    const items = values.map(value => ({ value, is_deleted: false }));
    
    const { data, error } = await supabase
      .from('wheel_items')
      .insert(items)
      .select();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add items',
        variant: 'destructive',
      });
      return;
    }

    setWheelItems(prev => [...prev, ...(data || [])]);
    toast({
      title: 'Items Added',
      description: `Added ${values.length} item(s) to the wheel`,
    });
  };

  // Remove wheel item (soft delete)
  const removeWheelItem = async (index: number) => {
    const item = wheelItems[index];
    if (!item) return;

    const { error } = await supabase
      .from('wheel_items')
      .update({ is_deleted: true })
      .eq('id', item.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
      return;
    }

    setWheelItems(prev => prev.filter((_, i) => i !== index));
  };

  // Delete and save to list
  const deleteAndSaveToList = async (index: number) => {
    const item = wheelItems[index];
    if (!item || !selectedListId) {
      toast({
        title: 'No List Selected',
        description: 'Please select a list to save deleted items',
        variant: 'destructive',
      });
      return false;
    }

    // Save to deleted_items
    const { error: insertError } = await supabase
      .from('deleted_items')
      .insert({
        value: item.value,
        list_id: selectedListId,
      });

    if (insertError) {
      toast({
        title: 'Error',
        description: 'Failed to save item to list',
        variant: 'destructive',
      });
      return false;
    }

    // Remove from wheel
    const { error: updateError } = await supabase
      .from('wheel_items')
      .update({ is_deleted: true })
      .eq('id', item.id);

    if (updateError) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from wheel',
        variant: 'destructive',
      });
      return false;
    }

    setWheelItems(prev => prev.filter((_, i) => i !== index));
    
    const list = lists.find(l => l.id === selectedListId);
    toast({
      title: 'Item Saved',
      description: `"${item.value}" saved to "${list?.title}"`,
    });

    return true;
  };

  // Clear all wheel items
  const clearAllItems = async () => {
    const { error } = await supabase
      .from('wheel_items')
      .update({ is_deleted: true })
      .eq('is_deleted', false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear items',
        variant: 'destructive',
      });
      return;
    }

    setWheelItems([]);
    toast({
      title: 'Cleared',
      description: 'All items removed from the wheel',
    });
  };

  // Create list
  const createList = async (title: string) => {
    const { data, error } = await supabase
      .from('lists')
      .insert({ title })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create list',
        variant: 'destructive',
      });
      return null;
    }

    setLists(prev => [data, ...prev]);
    setSelectedListId(data.id);
    toast({
      title: 'List Created',
      description: `Created list "${title}"`,
    });

    return data;
  };

  // Delete list
  const deleteList = async (listId: string) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete list',
        variant: 'destructive',
      });
      return;
    }

    setLists(prev => prev.filter(l => l.id !== listId));
    if (selectedListId === listId) {
      setSelectedListId(lists.length > 1 ? lists.find(l => l.id !== listId)?.id || null : null);
    }
    toast({
      title: 'List Deleted',
      description: 'List and its items have been deleted',
    });
  };

  // Get items for a specific list
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

  return {
    wheelItems: wheelItems.map(item => item.value),
    wheelItemsFull: wheelItems,
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
