import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingParticles from '@/components/FloatingParticles';
import AnimeCard from '@/components/AnimeCard';
import { useLenis } from '@/hooks/useLenis';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

const Favorites = () => {
  useLenis();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingParticles />
        
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Login to View Favorites
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Create an account or login to save your favorite anime and access them anytime.
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-primary to-accent rounded-full px-8"
            >
              Login / Sign Up
            </Button>
          </motion.div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-xl font-black">
                  <span className="text-foreground">NERO</span>
                  <span className="text-primary">FINDER</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-foreground flex items-center gap-3">
            <Heart className="w-10 h-10 text-accent" fill="currentColor" />
            My Favorites
          </h1>
          <p className="text-muted-foreground mt-2">
            {favorites.length} anime saved
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring and add some anime to your favorites!
            </p>
            <Button
              onClick={() => navigate('/explore')}
              className="bg-gradient-to-r from-primary to-accent rounded-full"
            >
              Explore Anime
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {favorites.map((anime, index) => (
              <div key={anime.id} className="relative group">
                <AnimeCard
                  id={anime.mal_id}
                  title={anime.title}
                  imageUrl={anime.image_url || ''}
                  score={anime.score || undefined}
                  index={index}
                />
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(anime.mal_id);
                  }}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
