import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const genres = [
  { name: 'Action', emoji: '⚔️' },
  { name: 'Adventure', emoji: '🗺️' },
  { name: 'Comedy', emoji: '😂' },
  { name: 'Drama', emoji: '🎭' },
  { name: 'Fantasy', emoji: '🧙' },
  { name: 'Romance', emoji: '💕' },
  { name: 'Sci-Fi', emoji: '🚀' },
  { name: 'Slice of Life', emoji: '☀️' },
  { name: 'Supernatural', emoji: '👻' },
  { name: 'Mystery', emoji: '🔍' },
  { name: 'Thriller', emoji: '😱' },
  { name: 'Horror', emoji: '🧟' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Mecha', emoji: '🤖' },
  { name: 'Isekai', emoji: '🌀' },
  { name: 'Shounen', emoji: '💪' },
  { name: 'Seinen', emoji: '🎯' },
  { name: 'Magic', emoji: '✨' },
];

const GenreQuickFilters = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('genre-filters-container');
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -200 : 200;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-foreground">🏷️ Quick Genres</span>
      </div>
      
      <div className="relative group">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Genre Pills */}
        <div
          id="genre-filters-container"
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {genres.map((genre, index) => (
            <motion.button
              key={genre.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/genre/${encodeURIComponent(genre.name.toLowerCase())}`)}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-secondary/50 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>{genre.emoji}</span>
              <span>{genre.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default GenreQuickFilters;
