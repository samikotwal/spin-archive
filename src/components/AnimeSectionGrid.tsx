import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimeCardEnhanced from './AnimeCardEnhanced';

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score?: number;
  year?: number;
  type?: string;
  status?: string;
  episodes?: number | null;
}

interface AnimeSectionGridProps {
  title: string;
  icon?: React.ReactNode;
  anime: Anime[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showWatchlist?: boolean;
}

const AnimeSectionGrid = ({
  title,
  icon,
  anime,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  showWatchlist = false,
}: AnimeSectionGridProps) => {
  if (isLoading && anime.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </motion.section>
    );
  }

  if (anime.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {icon && (
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            {icon}
          </motion.div>
        )}
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">({anime.length})</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {anime.map((item, index) => (
          <AnimeCardEnhanced
            key={item.mal_id}
            id={item.mal_id}
            title={item.title}
            imageUrl={item.images?.jpg?.large_image_url || ''}
            score={item.score}
            year={item.year}
            type={item.type}
            status={item.status}
            episodes={item.episodes}
            index={index}
            showWatchlist={showWatchlist}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-8"
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
    </motion.section>
  );
};

export default AnimeSectionGrid;
