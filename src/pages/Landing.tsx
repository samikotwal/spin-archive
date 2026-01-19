import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, Home, Film, Tv, TrendingUp, Flame, Heart, Dices, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimeCarousel from '@/components/AnimeCarousel';
import AnimeSection from '@/components/AnimeSection';
import AnimeCard from '@/components/AnimeCard';
import FloatingParticles from '@/components/FloatingParticles';
import { AuthModal } from '@/components/AuthModal';
import { useAnimeData } from '@/hooks/useAnimeData';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useLenis } from '@/hooks/useLenis';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Landing = () => {
  useLenis();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, signOut } = useAuth();

  const {
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
    isSearching: apiSearching,
  } = useAnimeData();

  const debouncedSearch = useDebouncedCallback((query: string) => {
    if (query.trim()) {
      searchAnime(query);
    }
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleProtectedAction = (action: string) => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully!");
  };

  const featuredItems = featuredAnime.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    imageUrl: anime.images.jpg.large_image_url,
    synopsis: anime.synopsis,
    score: anime.score,
  }));

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Series', icon: Tv },
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'airing', label: 'Top Airing', icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-background bg-animated-gradient overflow-x-hidden">
      <FloatingParticles />

      {/* Sticky Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 border-b border-white/5"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <motion.h1 
              className="text-2xl font-black text-foreground shrink-0 flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/')}
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <span>Anime Finder</span>
            </motion.h1>

            {/* Search Box */}
            <div className="flex-1 max-w-lg relative">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search anime..."
                  className="pl-4 pr-12 py-3 bg-secondary/80 border-white/10 rounded-full focus:ring-2 focus:ring-primary transition-all"
                />
                {searchQuery ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                )}
              </motion.div>
            </div>

            {/* Right Nav Items */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/explore')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Explore
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleProtectedAction("favorites")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/wheel')}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Dices className="w-4 h-4 mr-2" />
                  Wheel
                </Button>
              </motion.div>
              
              {/* Auth Button */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-primary to-accent text-white font-bold rounded-full px-6"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Search Results */}
        {isSearching ? (
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Search Results for "<span className="text-primary">{searchQuery}</span>"
                </h2>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Clear Search
                  </Button>
                </motion.div>
              </div>

              {apiSearching ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="aspect-[3/4] rounded-2xl bg-card"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-muted-foreground text-xl">
                    No anime found for "{searchQuery}"
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {searchResults.map((anime, index) => (
                    <AnimeCard
                      key={anime.mal_id}
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
            </motion.div>
          </div>
        ) : (
          <>
            {/* Hero Carousel with Nav Tabs */}
            <div className="relative">
              {/* Featured Carousel */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <AnimeCarousel items={featuredItems} />
              </motion.div>

              {/* Navigation Tabs Overlay */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-1 glass rounded-full px-2 py-1.5"
                >
                  {navTabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium
                        ${activeTab === tab.id 
                          ? 'bg-white/15 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Trending Posts & About Section */}
            <div className="container mx-auto px-4 py-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 border border-white/10"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-4">Trending Posts</h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleProtectedAction("post")}
                      >
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-foreground">Amazing anime experience!</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            The animation quality in this series is absolutely stunning...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 border border-white/10"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-4">About AnimeFinder</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">What is AnimeFinder?</h3>
                      <p className="text-muted-foreground text-sm">
                        AnimeFinder is your ultimate destination for discovering and exploring anime. 
                        Browse through thousands of titles, save your favorites, and get personalized 
                        recommendations based on your taste.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Features</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Extensive anime database</li>
                        <li>• Personalized recommendations</li>
                        <li>• Save and organize favorites</li>
                        <li>• Spin the wheel for random picks</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Anime Sections */}
            <div className="container mx-auto px-4 pb-8 space-y-4">
              {/* Popular Anime Section */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <AnimeSection
                  title="🔥 Popular Anime"
                  animes={popularAnime}
                  isLoading={isLoadingPopular}
                  hasMore={hasMorePopular}
                  onLoadMore={loadMorePopular}
                />
              </motion.div>

              {/* Anime Movies Section */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <AnimeSection
                  title="🎬 Anime Movies"
                  animes={animeMovies}
                  isLoading={isLoadingMovies}
                  hasMore={hasMoreMovies}
                  onLoadMore={loadMoreMovies}
                />
              </motion.div>

              {/* Upcoming Anime Section */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <AnimeSection
                  title="📅 Upcoming Anime"
                  animes={upcomingAnime}
                  isLoading={isLoadingUpcoming}
                  hasMore={hasMoreUpcoming}
                  onLoadMore={loadMoreUpcoming}
                />
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Anime Finder. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Landing;
