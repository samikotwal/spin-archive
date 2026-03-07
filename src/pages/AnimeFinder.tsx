import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, Heart, Dices, Star, Film, Tv, Calendar, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimeCardEnhanced from '@/components/AnimeCardEnhanced';
import AnimeSectionGrid from '@/components/AnimeSectionGrid';
import AnimeColumnList from '@/components/AnimeColumnList';
import GenreSidebar from '@/components/GenreSidebar';
import MostViewedSidebar from '@/components/MostViewedSidebar';
import AiringSchedule from '@/components/AiringSchedule';
import AZFooter from '@/components/AZFooter';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import FloatingParticles from '@/components/FloatingParticles';
import FeaturedSlideshow from '@/components/FeaturedSlideshow';
import { AuthModal } from '@/components/AuthModal';
import { useAnimeData } from '@/hooks/useAnimeData';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useLenis } from '@/hooks/useLenis';
import { useAuth } from '@/hooks/useAuth';

const AnimeFinder = () => {
  useLenis();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [allSearchResults, setAllSearchResults] = useState<any[]>([]);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);

  const { user } = useAuth();

  // Refs for scrolling to sections
  const moviesRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const airingRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  const {
    popularAnime,
    topAiringAnime,
    upcomingAnime,
    animeMovies,
    tvSeriesAnime,
    recentlyAddedAnime,
    isLoadingPopular,
    isLoadingAiring,
    isLoadingUpcoming,
    isLoadingMovies,
    isLoadingTV,
    isLoadingRecent,
    hasMorePopular,
    hasMoreAiring,
    hasMoreUpcoming,
    hasMoreMovies,
    hasMoreTV,
    hasMoreRecent,
    loadMorePopular,
    loadMoreAiring,
    loadMoreUpcoming,
    loadMoreMovies,
    loadMoreTV,
    loadMoreRecent,
    searchAnime,
    searchResults,
    isSearching: apiSearching,
  } = useAnimeData();

  const debouncedSearch = useDebouncedCallback((query: string) => {
    if (query.trim()) {
      setSearchPage(1);
      setAllSearchResults([]);
      searchAnime(query).then(results => {
        setAllSearchResults(results);
        setHasMoreSearch(results.length >= 24);
      });
    }
  }, 500);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      searchAnime(q).then(results => {
        setAllSearchResults(results);
        setHasMoreSearch(results.length >= 24);
      });
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAllSearchResults([]);
  };

  const loadMoreSearchResults = async () => {
    if (loadingMoreSearch || !searchQuery.trim()) return;
    setLoadingMoreSearch(true);
    try {
      const nextPage = searchPage + 1;
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=24&page=${nextPage}&order_by=score&sort=desc`);
      const json = await res.json();
      const newResults = json.data || [];
      setAllSearchResults(prev => [...prev, ...newResults]);
      setSearchPage(nextPage);
      setHasMoreSearch(newResults.length >= 24);
    } catch (e) {
      console.error('Load more search error:', e);
    }
    setLoadingMoreSearch(false);
  };

  const isSearchMode = searchQuery.length > 0;

  const completedAnime = popularAnime.filter(a =>
    a.status?.toLowerCase().includes('finished') || !a.airing
  );

  const categoryTabs = [
    { label: 'Movies', icon: Film, ref: moviesRef },
    { label: 'TV Series', icon: Tv, ref: tvRef },
    { label: 'Most Popular', icon: Star, ref: popularRef },
    { label: 'Top Airing', icon: TrendingUp, ref: airingRef },
    { label: 'Upcoming', icon: Calendar, ref: upcomingRef },
    { label: 'Recent', icon: Clock, ref: recentRef },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const displayedSearchResults = allSearchResults.length > 0 ? allSearchResults : searchResults;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-16 md:pb-0">
      <FloatingParticles />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 border-b border-white/5"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.h1
              className="text-lg font-black text-foreground shrink-0 flex items-center gap-1.5 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/')}
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="hidden sm:inline">Explore</span>
            </motion.h1>

            <div className="flex-1 max-w-2xl relative">
              <input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search anime..."
                className="w-full pl-10 pr-10 py-2.5 bg-secondary/80 border border-white/10 rounded-full focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground text-sm outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              {searchQuery && (
                <Button variant="ghost" size="icon" onClick={clearSearch} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7">
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <Button onClick={() => navigate('/wheel')} variant="outline" size="sm" className="border-white/10 rounded-full gap-1.5 hidden sm:flex">
              <Dices className="w-4 h-4" />
              Wheel
            </Button>

            <Button
              onClick={() => user ? navigate('/favorites') : setShowAuthModal(true)}
              variant="outline"
              size="sm"
              className="border-white/10 rounded-full gap-1.5 hidden sm:flex"
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Button>
          </div>

          {/* Category Quick Nav */}
          {!isSearchMode && (
            <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-none pb-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => scrollToSection(tab.ref)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap shrink-0"
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        {isSearchMode ? (
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Results for "<span className="text-primary">{searchQuery}</span>"
              </h2>
              <p className="text-muted-foreground text-sm">Found {displayedSearchResults.length} anime</p>
            </motion.div>

            {apiSearching && displayedSearchResults.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} className="aspect-[3/4] rounded-xl bg-muted" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }} />
                ))}
              </div>
            ) : displayedSearchResults.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-muted-foreground text-xl">No anime found for "{searchQuery}"</p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayedSearchResults.map((anime: any, index: number) => (
                    <AnimeCardEnhanced
                      key={`${anime.mal_id}-${index}`}
                      id={anime.mal_id}
                      title={anime.title}
                      imageUrl={anime.images.jpg.large_image_url}
                      score={anime.score}
                      year={anime.year}
                      type={anime.type}
                      index={index}
                    />
                  ))}
                </div>

                {/* Load More for search */}
                {hasMoreSearch && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={loadMoreSearchResults}
                      disabled={loadingMoreSearch}
                      variant="outline"
                      className="rounded-full px-8 border-white/10 gap-2"
                    >
                      {loadingMoreSearch ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Load More Results
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Featured Slideshow */}
            <FeaturedSlideshow anime={topAiringAnime} isLoading={isLoadingAiring} />

            {/* 4-Column Layout */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimeColumnList title="Popular" anime={popularAnime} isLoading={isLoadingPopular} titleColor="text-accent" />
                <AnimeColumnList title="New Release" anime={recentlyAddedAnime} isLoading={isLoadingRecent} titleColor="text-green-400" />
                <AnimeColumnList title="Top Airing" anime={topAiringAnime} isLoading={isLoadingAiring} titleColor="text-primary" />
                <AnimeColumnList title="Completed" anime={completedAnime} isLoading={isLoadingPopular} titleColor="text-blue-400" />
              </div>
            </motion.section>

            {/* Main Content + Sidebar */}
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <div ref={airingRef}>
                  <AnimeSectionGrid
                    title="🔥 Trending Now"
                    icon={<TrendingUp className="w-5 h-5 text-white" />}
                    anime={topAiringAnime}
                    isLoading={isLoadingAiring}
                    onLoadMore={loadMoreAiring}
                    hasMore={hasMoreAiring}
                    showWatchlist
                  />
                </div>

                <ContinueWatchingSection />

                <div ref={popularRef}>
                  <AnimeSectionGrid
                    title="⭐ Top Anime"
                    icon={<Star className="w-5 h-5 text-white" />}
                    anime={popularAnime}
                    isLoading={isLoadingPopular}
                    onLoadMore={loadMorePopular}
                    hasMore={hasMorePopular}
                    showWatchlist
                  />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-20 space-y-8 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
                  <GenreSidebar />
                  <MostViewedSidebar />
                </div>
              </div>
            </div>

            {/* Full-width sections */}
            <div className="mt-10 space-y-0">
              <div ref={recentRef}>
                <AnimeSectionGrid
                  title="🆕 Recently Added"
                  icon={<Clock className="w-5 h-5 text-white" />}
                  anime={recentlyAddedAnime}
                  isLoading={isLoadingRecent}
                  onLoadMore={loadMoreRecent}
                  hasMore={hasMoreRecent}
                  showWatchlist
                />
              </div>

              <div ref={moviesRef}>
                <AnimeSectionGrid
                  title="🎬 Movies"
                  icon={<Film className="w-5 h-5 text-white" />}
                  anime={animeMovies}
                  isLoading={isLoadingMovies}
                  onLoadMore={loadMoreMovies}
                  hasMore={hasMoreMovies}
                  showWatchlist
                />
              </div>

              <div ref={tvRef}>
                <AnimeSectionGrid
                  title="📡 TV Series"
                  icon={<Tv className="w-5 h-5 text-white" />}
                  anime={tvSeriesAnime}
                  isLoading={isLoadingTV}
                  onLoadMore={loadMoreTV}
                  hasMore={hasMoreTV}
                  showWatchlist
                />
              </div>

              <div ref={upcomingRef}>
                <AnimeSectionGrid
                  title="📅 Upcoming"
                  icon={<Calendar className="w-5 h-5 text-white" />}
                  anime={upcomingAnime}
                  isLoading={isLoadingUpcoming}
                  onLoadMore={loadMoreUpcoming}
                  hasMore={hasMoreUpcoming}
                  showWatchlist
                />
              </div>

              <AiringSchedule />
            </div>
          </div>
        )}
      </main>

      <AZFooter />

      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">NERO FINDER</span>
          </div>
          <p>© 2026 NERO FINDER. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default AnimeFinder;
