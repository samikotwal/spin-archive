import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Flame, Calendar, Film, Tv, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimeCardEnhanced from './AnimeCardEnhanced';

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
  status?: string;
  episodes?: number | null;
}

interface AnimeSectionEnhancedProps {
  title: string;
  icon?: React.ReactNode;
  anime: Anime[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showWatchlist?: boolean;
}

const AnimeSectionEnhanced = ({ 
  title, 
  icon,
  anime, 
  isLoading = false,
  onLoadMore,
  hasMore = false,
  showWatchlist = false,
}: AnimeSectionEnhancedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [anime]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = direction === 'left' ? -400 : 400;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (isLoading && anime.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 aspect-[3/4] rounded-xl bg-muted animate-pulse"
            />
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
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && (
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              {icon}
            </motion.div>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {title}
          </h2>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="rounded-full border-white/10 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight && !hasMore}
            className="rounded-full border-white/10 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Anime Slider */}
      <div className="relative">
        {/* Left Fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right Fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {anime.map((item, index) => (
            <motion.div
              key={item.mal_id}
              className="flex-shrink-0 w-36 sm:w-40 md:w-44"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <AnimeCardEnhanced
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
            </motion.div>
          ))}

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <motion.div
              className="flex-shrink-0 w-36 sm:w-40 md:w-44 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoading}
                className="h-full min-h-[200px] w-full rounded-xl border-white/10 border-dashed hover:bg-white/5 flex flex-col gap-2"
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-sm">{isLoading ? 'Loading...' : 'Load More'}</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default AnimeSectionEnhanced;
