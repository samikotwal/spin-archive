import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  score?: number;
  year?: number;
  type?: string;
  synopsis?: string;
}

interface UseAnimeDataReturn {
  popularAnime: Anime[];
  animeMovies: Anime[];
  upcomingAnime: Anime[];
  featuredAnime: Anime[];
  isLoadingPopular: boolean;
  isLoadingMovies: boolean;
  isLoadingUpcoming: boolean;
  hasMorePopular: boolean;
  hasMoreMovies: boolean;
  hasMoreUpcoming: boolean;
  loadMorePopular: () => void;
  loadMoreMovies: () => void;
  loadMoreUpcoming: () => void;
  searchAnime: (query: string) => Promise<Anime[]>;
  searchResults: Anime[];
  isSearching: boolean;
}

const JIKAN_API = 'https://api.jikan.moe/v4';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useAnimeData = (): UseAnimeDataReturn => {
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Anime[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);

  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [popularPage, setPopularPage] = useState(1);
  const [moviesPage, setMoviesPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);

  const fetchFromApi = async (endpoint: string, category: string): Promise<Anime[]> => {
    // Check cache first
    const { data: cachedData } = await supabase
      .from('anime_cache')
      .select('*')
      .eq('category', category)
      .single();

    if (cachedData) {
      const fetchedAt = new Date(cachedData.fetched_at).getTime();
      if (Date.now() - fetchedAt < CACHE_DURATION) {
        return (cachedData.data as unknown) as Anime[];
      }
    }

    // Fetch from API with rate limiting
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      const response = await fetch(`${JIKAN_API}${endpoint}`);
      if (!response.ok) throw new Error('API request failed');
      
      const json = await response.json();
      const animes = json.data || [];

      // Update cache
      if (cachedData) {
        await supabase
          .from('anime_cache')
          .update({ data: animes, fetched_at: new Date().toISOString() })
          .eq('category', category);
      } else {
        await supabase
          .from('anime_cache')
          .insert({ category, data: animes });
      }

      return animes;
    } catch (error) {
      console.error('Error fetching anime:', error);
      return cachedData ? ((cachedData.data as unknown) as Anime[]) : [];
    }
  };

  const loadPopular = async (page: number) => {
    setIsLoadingPopular(true);
    const data = await fetchFromApi(`/top/anime?page=${page}&limit=12`, `popular_${page}`);
    if (page === 1) {
      setPopularAnime(data);
      setFeaturedAnime(data.slice(0, 5));
    } else {
      setPopularAnime(prev => [...prev, ...data]);
    }
    setHasMorePopular(data.length === 12);
    setIsLoadingPopular(false);
  };

  const loadMovies = async (page: number) => {
    setIsLoadingMovies(true);
    const data = await fetchFromApi(`/top/anime?type=movie&page=${page}&limit=12`, `movies_${page}`);
    if (page === 1) {
      setAnimeMovies(data);
    } else {
      setAnimeMovies(prev => [...prev, ...data]);
    }
    setHasMoreMovies(data.length === 12);
    setIsLoadingMovies(false);
  };

  const loadUpcoming = async (page: number) => {
    setIsLoadingUpcoming(true);
    const data = await fetchFromApi(`/seasons/upcoming?page=${page}&limit=12`, `upcoming_${page}`);
    if (page === 1) {
      setUpcomingAnime(data);
    } else {
      setUpcomingAnime(prev => [...prev, ...data]);
    }
    setHasMoreUpcoming(data.length === 12);
    setIsLoadingUpcoming(false);
  };

  const searchAnime = async (query: string): Promise<Anime[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const response = await fetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=24`);
      const json = await response.json();
      const results = json.data || [];
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadPopular(1);
    setTimeout(() => loadMovies(1), 500);
    setTimeout(() => loadUpcoming(1), 1000);
  }, []);

  const loadMorePopular = () => {
    const nextPage = popularPage + 1;
    setPopularPage(nextPage);
    loadPopular(nextPage);
  };

  const loadMoreMovies = () => {
    const nextPage = moviesPage + 1;
    setMoviesPage(nextPage);
    loadMovies(nextPage);
  };

  const loadMoreUpcoming = () => {
    const nextPage = upcomingPage + 1;
    setUpcomingPage(nextPage);
    loadUpcoming(nextPage);
  };

  return {
    popularAnime,
    animeMovies,
    upcomingAnime,
    featuredAnime,
    isLoadingPopular,
    isLoadingMovies,
    isLoadingUpcoming,
    hasMorePopular,
    hasMoreMovies,
    hasMoreUpcoming,
    loadMorePopular,
    loadMoreMovies,
    loadMoreUpcoming,
    searchAnime,
    searchResults,
    isSearching,
  };
};
