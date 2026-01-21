import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface FavoriteAnime {
  id: string;
  mal_id: number;
  title: string;
  image_url: string | null;
  score: number | null;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFavorites(data || []);
      setFavoriteIds(new Set(data?.map(f => f.mal_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (anime: {
    mal_id: number;
    title: string;
    image_url?: string;
    score?: number;
  }) => {
    if (!user) {
      toast.error('Please login to add favorites');
      return false;
    }

    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.image_url || null,
        score: anime.score || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Already in favorites');
          return false;
        }
        throw error;
      }

      setFavoriteIds(prev => new Set([...prev, anime.mal_id]));
      await fetchFavorites();
      toast.success(`Added "${anime.title}" to favorites!`);
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Failed to add favorite');
      return false;
    }
  };

  const removeFavorite = async (mal_id: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('mal_id', mal_id);

      if (error) throw error;

      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mal_id);
        return newSet;
      });
      await fetchFavorites();
      toast.success('Removed from favorites');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
      return false;
    }
  };

  const isFavorite = (mal_id: number) => favoriteIds.has(mal_id);

  const toggleFavorite = async (anime: {
    mal_id: number;
    title: string;
    image_url?: string;
    score?: number;
  }) => {
    if (isFavorite(anime.mal_id)) {
      return removeFavorite(anime.mal_id);
    } else {
      return addFavorite(anime);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
};
