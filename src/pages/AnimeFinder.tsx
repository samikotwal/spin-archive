import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, ArrowLeft, Heart, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimeCard from '@/components/AnimeCard';
import FloatingParticles from '@/components/FloatingParticles';
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
    isLoadingPopular,
    searchAnime,
    searchResults,
    isSearching: apiSearching,
  } = useAnimeData();

  const debouncedSearch = useDebouncedCallback((query: string) => {
    if (query.trim()) {
      searchAnime(query);
    }
  }, 500);

  // Handle initial search from URL params
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

  const handleFavorites = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // Navigate to saved lists or handle favorites
    navigate('/saved');
  };

  const displayAnime = searchQuery.length > 0 ? searchResults : popularAnime;
  const isLoading = searchQuery.length > 0 ? apiSearching : isLoadingPopular;

  return (
    <div className="min-h-screen bg-background bg-animated-gradient overflow-x-hidden">
      <FloatingParticles />

      {/* Header - Simplified with only Search, Wheel, Favorites */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 border-b border-white/5"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Logo */}
            <motion.h1 
              className="text-xl font-black text-foreground shrink-0 flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/')}
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Explore</span>
            </motion.h1>

            {/* Search Box */}
            <div className="flex-1 max-w-2xl relative">
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for any anime..."
                className="pl-12 pr-12 py-3 bg-secondary/80 border-white/10 rounded-full focus:ring-2 focus:ring-primary transition-all text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {searchQuery && (
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
              )}
            </div>

            {/* Wheel Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate('/wheel')}
                variant="outline"
                className="border-white/10 rounded-full gap-2"
              >
                <Dices className="w-4 h-4" />
                <span className="hidden sm:inline">Wheel</span>
              </Button>
            </motion.div>

            {/* Favorites Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleFavorites}
                variant="outline"
                className="border-white/10 rounded-full gap-2"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favorites</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {searchQuery ? (
              <>Results for "<span className="text-primary">{searchQuery}</span>"</>
            ) : (
              'Browse All Anime'
            )}
          </h2>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `Found ${searchResults.length} anime` 
              : 'Discover thousands of anime titles'}
          </p>
        </motion.div>

        {/* Anime Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div 
                key={i} 
                className="aspect-[3/4] rounded-2xl bg-card"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : displayAnime.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-muted-foreground text-xl">
              {searchQuery 
                ? `No anime found for "${searchQuery}"` 
                : 'No anime available'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayAnime.map((anime, index) => (
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
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
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

export default AnimeFinder;
