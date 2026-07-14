import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queuedFetch, readLocalCache, readStaleLocalCache, writeLocalCache } from '@/lib/jikanQueue';

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
  genres?: { mal_id: number; name: string }[];
}

interface UseAnimeDataReturn {
  popularAnime: Anime[];
  animeMovies: Anime[];
  upcomingAnime: Anime[];
  featuredAnime: Anime[];
  topAiringAnime: Anime[];
  tvSeriesAnime: Anime[];
  recommendedAnime: Anime[];
  recentlyAddedAnime: Anime[];
  isLoadingPopular: boolean;
  isLoadingMovies: boolean;
  isLoadingUpcoming: boolean;
  isLoadingAiring: boolean;
  isLoadingTV: boolean;
  isLoadingRecommended: boolean;
  isLoadingRecent: boolean;
  hasMorePopular: boolean;
  hasMoreMovies: boolean;
  hasMoreUpcoming: boolean;
  hasMoreAiring: boolean;
  hasMoreTV: boolean;
  hasMoreRecent: boolean;
  loadMorePopular: () => void;
  loadMoreMovies: () => void;
  loadMoreUpcoming: () => void;
  loadMoreAiring: () => void;
  loadMoreTV: () => void;
  loadMoreRecent: () => void;
  searchAnime: (query: string) => Promise<Anime[]>;
  searchResults: Anime[];
  isSearching: boolean;
}

const JIKAN_API = 'https://api.jikan.moe/v4';
const CACHE_DURATION = 30 * 60 * 1000;


export const useAnimeData = (): UseAnimeDataReturn => {
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Anime[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [topAiringAnime, setTopAiringAnime] = useState<Anime[]>([]);
  const [tvSeriesAnime, setTvSeriesAnime] = useState<Anime[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);
  const [recentlyAddedAnime, setRecentlyAddedAnime] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);

  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingAiring, setIsLoadingAiring] = useState(true);
  const [isLoadingTV, setIsLoadingTV] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [popularPage, setPopularPage] = useState(1);
  const [moviesPage, setMoviesPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);

  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [hasMoreAiring, setHasMoreAiring] = useState(true);
  const [hasMoreTV, setHasMoreTV] = useState(true);
  const [hasMoreRecent, setHasMoreRecent] = useState(true);

  const fetchFromApi = async (
    endpoint: string,
    category: string,
    onInstant?: (data: Anime[]) => void,
  ): Promise<Anime[]> => {
    // 1) Instant paint from localStorage if fresh
    const local = readLocalCache<Anime[]>(category);
    if (local && local.length > 0) {
      onInstant?.(local);
      return local;
    }

    // 2) Check Supabase cache (fresh only)
    try {
      const { data: cachedData } = await supabase
        .from('anime_cache')
        .select('*')
        .eq('category', category)
        .maybeSingle();

      if (cachedData) {
        const fetchedAt = new Date(cachedData.fetched_at).getTime();
        if (Date.now() - fetchedAt < CACHE_DURATION) {
          const fresh = (cachedData.data as unknown) as Anime[];
          writeLocalCache(category, fresh);
          return fresh;
        }
      }

      // 3) Live fetch (rate-limited + retried)
      const response = await queuedFetch(`${JIKAN_API}${endpoint}`);
      if (!response.ok) throw new Error(`API ${response.status}`);

      const json = await response.json();
      const animes: Anime[] = json.data || [];

      if (animes.length > 0) writeLocalCache(category, animes);

      // Cache write (fire-and-forget)
      const jsonData = animes as unknown as any;
      if (cachedData) {
        supabase.from('anime_cache').update({ data: jsonData, fetched_at: new Date().toISOString() }).eq('category', category).then(() => {});
      } else {
        supabase.from('anime_cache').insert([{ category, data: jsonData }]).then(() => {});
      }


      return animes;
    } catch (error) {
      console.error('Error fetching anime:', error);
      // 4) Fallback: any stale localStorage data beats empty grid
      const stale = readStaleLocalCache<Anime[]>(category);
      return stale ?? [];
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
    if (page === 1) setAnimeMovies(data);
    else setAnimeMovies(prev => [...prev, ...data]);
    setHasMoreMovies(data.length === 18);
    setIsLoadingMovies(false);
  };

  const loadUpcoming = async (page: number) => {
    setIsLoadingUpcoming(true);
    const data = await fetchFromApi(`/seasons/upcoming?page=${page}&limit=18`, `upcoming_${page}`);
    if (page === 1) setUpcomingAnime(data);
    else setUpcomingAnime(prev => [...prev, ...data]);
    setHasMoreUpcoming(data.length === 18);
    setIsLoadingUpcoming(false);
  };

  const loadAiring = async (page: number) => {
    setIsLoadingAiring(true);
    const data = await fetchFromApi(`/top/anime?filter=airing&page=${page}&limit=18`, `airing_${page}`);
    if (page === 1) setTopAiringAnime(data);
    else setTopAiringAnime(prev => [...prev, ...data]);
    setHasMoreAiring(data.length === 18);
    setIsLoadingAiring(false);
  };

  const loadTV = async (page: number) => {
    setIsLoadingTV(true);
    const data = await fetchFromApi(`/top/anime?type=tv&page=${page}&limit=18`, `tv_${page}`);
    if (page === 1) setTvSeriesAnime(data);
    else setTvSeriesAnime(prev => [...prev, ...data]);
    setHasMoreTV(data.length === 18);
    setIsLoadingTV(false);
  };

  const loadRecommended = async () => {
    setIsLoadingRecommended(true);
    const data = await fetchFromApi(`/top/anime?filter=bypopularity&limit=20`, 'recommended');
    setRecommendedAnime(data);
    setIsLoadingRecommended(false);
  };

  const loadRecent = async (page: number) => {
    setIsLoadingRecent(true);
    const data = await fetchFromApi(`/seasons/now?page=${page}&limit=18&order_by=start_date&sort=desc`, `recent_${page}`);
    if (page === 1) setRecentlyAddedAnime(data);
    else setRecentlyAddedAnime(prev => [...prev, ...data]);
    setHasMoreRecent(data.length === 18);
    setIsLoadingRecent(false);
  };

  const searchAnime = async (query: string): Promise<Anime[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    setIsSearching(true);
    try {
      const response = await queuedFetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=24&order_by=score&sort=desc`);
      const json = await response.json();
      let results: Anime[] = json.data || [];
      
      const isHentai = (anime: any) =>
        anime.genres?.some((g: any) => g.mal_id === 12 || g.name?.toLowerCase() === 'hentai');
      
      results = [...results.filter((a: any) => !isHentai(a)), ...results.filter((a: any) => isHentai(a))];
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
    // Fire all initial loads - the queue handles rate limiting
    loadPopular(1);
    loadAiring(1);
    loadMovies(1);
    loadUpcoming(1);
    loadTV(1);
    loadRecommended();
    loadRecent(1);
  }, []);

  const loadMorePopular = () => { const p = popularPage + 1; setPopularPage(p); loadPopular(p); };
  const loadMoreMovies = () => { const p = moviesPage + 1; setMoviesPage(p); loadMovies(p); };
  const loadMoreUpcoming = () => { const p = upcomingPage + 1; setUpcomingPage(p); loadUpcoming(p); };
  const loadMoreAiring = () => { const p = airingPage + 1; setAiringPage(p); loadAiring(p); };
  const loadMoreTV = () => { const p = tvPage + 1; setTvPage(p); loadTV(p); };
  const loadMoreRecent = () => { const p = recentPage + 1; setRecentPage(p); loadRecent(p); };

  return {
    popularAnime, animeMovies, upcomingAnime, featuredAnime, topAiringAnime,
    tvSeriesAnime, recommendedAnime, recentlyAddedAnime,
    isLoadingPopular, isLoadingMovies, isLoadingUpcoming, isLoadingAiring,
    isLoadingTV, isLoadingRecommended, isLoadingRecent,
    hasMorePopular, hasMoreMovies, hasMoreUpcoming, hasMoreAiring, hasMoreTV, hasMoreRecent,
    loadMorePopular, loadMoreMovies, loadMoreUpcoming, loadMoreAiring, loadMoreTV, loadMoreRecent,
    searchAnime, searchResults, isSearching,
  };
};
