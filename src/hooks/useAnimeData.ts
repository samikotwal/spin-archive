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
  status?: string;
  episodes?: number | null;
  airing?: boolean;
}

interface UseAnimeDataReturn {
  popularAnime: Anime[];
  animeMovies: Anime[];
  upcomingAnime: Anime[];
  featuredAnime: Anime[];
  topAiringAnime: Anime[];
  tvSeriesAnime: Anime[];
  recommendedAnime: Anime[];
  isLoadingPopular: boolean;
  isLoadingMovies: boolean;
  isLoadingUpcoming: boolean;
  isLoadingAiring: boolean;
  isLoadingTV: boolean;
  isLoadingRecommended: boolean;
  hasMorePopular: boolean;
  hasMoreMovies: boolean;
  hasMoreUpcoming: boolean;
  hasMoreAiring: boolean;
  hasMoreTV: boolean;
  loadMorePopular: () => void;
  loadMoreMovies: () => void;
  loadMoreUpcoming: () => void;
  loadMoreAiring: () => void;
  loadMoreTV: () => void;
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
  const [topAiringAnime, setTopAiringAnime] = useState<Anime[]>([]);
  const [tvSeriesAnime, setTvSeriesAnime] = useState<Anime[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);

  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingAiring, setIsLoadingAiring] = useState(true);
  const [isLoadingTV, setIsLoadingTV] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [popularPage, setPopularPage] = useState(1);
  const [moviesPage, setMoviesPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [tvPage, setTvPage] = useState(1);

  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [hasMoreAiring, setHasMoreAiring] = useState(true);
  const [hasMoreTV, setHasMoreTV] = useState(true);

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
    const data = await fetchFromApi(`/top/anime?page=${page}&limit=18`, `popular_${page}`);
    if (page === 1) {
      setPopularAnime(data);
      setFeaturedAnime(data.slice(0, 8));
    } else {
      setPopularAnime(prev => [...prev, ...data]);
    }
    setHasMorePopular(data.length === 18);
    setIsLoadingPopular(false);
  };

  const loadMovies = async (page: number) => {
    setIsLoadingMovies(true);
    const data = await fetchFromApi(`/top/anime?type=movie&page=${page}&limit=18`, `movies_${page}`);
    if (page === 1) {
      setAnimeMovies(data);
    } else {
      setAnimeMovies(prev => [...prev, ...data]);
    }
    setHasMoreMovies(data.length === 18);
    setIsLoadingMovies(false);
  };

  const loadUpcoming = async (page: number) => {
    setIsLoadingUpcoming(true);
    const data = await fetchFromApi(`/seasons/upcoming?page=${page}&limit=18`, `upcoming_${page}`);
    if (page === 1) {
      setUpcomingAnime(data);
    } else {
      setUpcomingAnime(prev => [...prev, ...data]);
    }
    setHasMoreUpcoming(data.length === 18);
    setIsLoadingUpcoming(false);
  };

  const loadAiring = async (page: number) => {
    setIsLoadingAiring(true);
    const data = await fetchFromApi(`/top/anime?filter=airing&page=${page}&limit=18`, `airing_${page}`);
    if (page === 1) {
      setTopAiringAnime(data);
    } else {
      setTopAiringAnime(prev => [...prev, ...data]);
    }
    setHasMoreAiring(data.length === 18);
    setIsLoadingAiring(false);
  };

  const loadTV = async (page: number) => {
    setIsLoadingTV(true);
    const data = await fetchFromApi(`/top/anime?type=tv&page=${page}&limit=18`, `tv_${page}`);
    if (page === 1) {
      setTvSeriesAnime(data);
    } else {
      setTvSeriesAnime(prev => [...prev, ...data]);
    }
    setHasMoreTV(data.length === 18);
    setIsLoadingTV(false);
  };

  const loadRecommended = async () => {
    setIsLoadingRecommended(true);
    // Get a mix of highly rated anime for recommendations
    const data = await fetchFromApi(`/top/anime?filter=bypopularity&limit=20`, 'recommended');
    setRecommendedAnime(data);
    setIsLoadingRecommended(false);
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
    setTimeout(() => loadAiring(1), 500);
    setTimeout(() => loadMovies(1), 1000);
    setTimeout(() => loadUpcoming(1), 1500);
    setTimeout(() => loadTV(1), 2000);
    setTimeout(() => loadRecommended(), 2500);
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

  const loadMoreAiring = () => {
    const nextPage = airingPage + 1;
    setAiringPage(nextPage);
    loadAiring(nextPage);
  };

  const loadMoreTV = () => {
    const nextPage = tvPage + 1;
    setTvPage(nextPage);
    loadTV(nextPage);
  };

  return {
    popularAnime,
    animeMovies,
    upcomingAnime,
    featuredAnime,
    topAiringAnime,
    tvSeriesAnime,
    recommendedAnime,
    isLoadingPopular,
    isLoadingMovies,
    isLoadingUpcoming,
    isLoadingAiring,
    isLoadingTV,
    isLoadingRecommended,
    hasMorePopular,
    hasMoreMovies,
    hasMoreUpcoming,
    hasMoreAiring,
    hasMoreTV,
    loadMorePopular,
    loadMoreMovies,
    loadMoreUpcoming,
    loadMoreAiring,
    loadMoreTV,
    searchAnime,
    searchResults,
    isSearching,
  };
};
