import { motion } from 'framer-motion';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimeCard from './AnimeCard';

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
}

interface AnimeSectionProps {
  title: string;
  animes: Anime[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const AnimeSection = ({ title, animes, isLoading, hasMore, onLoadMore }: AnimeSectionProps) => {
  return (
    <section className="mb-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-4">
          <motion.span 
            className="w-1.5 h-10 bg-gradient-to-b from-primary via-accent to-glow-cyan rounded-full"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {title}
        </h2>
        <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary group"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {animes.map((anime, index) => (
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

      {/* Load More */}
      {hasMore && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-10"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              className="bg-gradient-to-r from-secondary to-muted hover:from-primary/20 hover:to-accent/20 text-foreground px-10 py-3 rounded-full font-bold border border-white/10 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Load More
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && animes.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="aspect-[3/4] rounded-2xl bg-card"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AnimeSection;
