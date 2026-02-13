import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, Heart, Dices, Star, Flame, Film, Tv, Calendar, Clock, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimeCardEnhanced from '@/components/AnimeCardEnhanced';
import AnimeSectionGrid from '@/components/AnimeSectionGrid';
import GenreQuickFilters from '@/components/GenreQuickFilters';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import AlphabetFilter from '@/components/AlphabetFilter';
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

  const { user } = useAuth();

  const {
    popularAnime,
    topAiringAnime,
    upcomingAnime,
    animeMovies,
    tvSeriesAnime,
    recommendedAnime,
    recentlyAddedAnime,
    isLoadingPopular,
    isLoadingAiring,
    isLoadingUpcoming,
    isLoadingMovies,
    isLoadingTV,
    isLoadingRecommended,
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
      searchAnime(query);
    }
  }, 500);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      searchAnime(q);
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isSearchMode = searchQuery.length > 0;

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
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search anime..."
                className="pl-10 pr-10 py-2.5 bg-secondary/80 border-white/10 rounded-full focus:ring-2 focus:ring-primary transition-all"
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
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Search Results Mode */}
        {isSearchMode ? (
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Results for "<span className="text-primary">{searchQuery}</span>"
              </h2>
              <p className="text-muted-foreground text-sm">Found {searchResults.length} anime</p>
            </motion.div>

            {apiSearching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} className="aspect-[3/4] rounded-xl bg-muted" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }} />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-muted-foreground text-xl">No anime found for "{searchQuery}"</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((anime, index) => (
                  <AnimeCardEnhanced
                    key={anime.mal_id}
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
            )}
          </div>
        ) : (
          /* Browse Mode */
          <div>
            {/* Featured Slideshow */}
            <FeaturedSlideshow anime={topAiringAnime} isLoading={isLoadingAiring} />

            {/* Genre Quick Filters */}
            <GenreQuickFilters />

            {/* Trending Section */}
            <AnimeSectionGrid
              title="🔥 Trending Now"
              icon={<TrendingUp className="w-5 h-5 text-white" />}
              anime={topAiringAnime}
              isLoading={isLoadingAiring}
              onLoadMore={loadMoreAiring}
              hasMore={hasMoreAiring}
              showWatchlist
            />

            {/* Continue Watching */}
            <ContinueWatchingSection />

            {/* Main Content with Sidebar */}
            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <AlphabetFilter />
              </div>

              {/* Content Sections */}
              <div className="flex-1 min-w-0">
                <AnimeSectionGrid
                  title="⭐ Top Anime"
                  icon={<Star className="w-5 h-5 text-white" />}
                  anime={popularAnime}
                  isLoading={isLoadingPopular}
                  onLoadMore={loadMorePopular}
                  hasMore={hasMorePopular}
                  showWatchlist
                />

                <AnimeSectionGrid
                  title="🆕 Recently Added"
                  icon={<Clock className="w-5 h-5 text-white" />}
                  anime={recentlyAddedAnime}
                  isLoading={isLoadingRecent}
                  onLoadMore={loadMoreRecent}
                  hasMore={hasMoreRecent}
                  showWatchlist
                />

                <AnimeSectionGrid
                  title="✨ Recommended"
                  icon={<Sparkles className="w-5 h-5 text-white" />}
                  anime={recommendedAnime}
                  isLoading={isLoadingRecommended}
                  showWatchlist
                />

                <AnimeSectionGrid
                  title="🎬 Movies"
                  icon={<Film className="w-5 h-5 text-white" />}
                  anime={animeMovies}
                  isLoading={isLoadingMovies}
                  onLoadMore={loadMoreMovies}
                  hasMore={hasMoreMovies}
                  showWatchlist
                />

                <AnimeSectionGrid
                  title="📡 TV Series"
                  icon={<Tv className="w-5 h-5 text-white" />}
                  anime={tvSeriesAnime}
                  isLoading={isLoadingTV}
                  onLoadMore={loadMoreTV}
                  hasMore={hasMoreTV}
                  showWatchlist
                />

                <AnimeSectionGrid
                  title="📅 Upcoming"
                  icon={<Calendar className="w-5 h-5 text-white" />}
                  anime={upcomingAnime}
                  isLoading={isLoadingUpcoming}
                  onLoadMore={loadMoreUpcoming}
                  hasMore={hasMoreUpcoming}
                  showWatchlist
                />

                <AnimeSectionGrid
                  title="🏆 Most Popular"
                  icon={<Award className="w-5 h-5 text-white" />}
                  anime={popularAnime.slice(0, 10)}
                  isLoading={isLoadingPopular}
                  showWatchlist
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-8">
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
