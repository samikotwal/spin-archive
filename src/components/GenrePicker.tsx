import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Tag, Sparkles, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const GENRES = [
  // Main Genres
  { name: 'Action', id: 1, category: 'Main' },
  { name: 'Adventure', id: 2, category: 'Main' },
  { name: 'Comedy', id: 4, category: 'Main' },
  { name: 'Drama', id: 8, category: 'Main' },
  { name: 'Fantasy', id: 10, category: 'Main' },
  { name: 'Romance', id: 22, category: 'Main' },
  { name: 'Sci-Fi', id: 24, category: 'Main' },
  { name: 'Slice of Life', id: 36, category: 'Main' },
  { name: 'Supernatural', id: 37, category: 'Main' },
  { name: 'Mystery', id: 7, category: 'Main' },
  { name: 'Thriller', id: 45, category: 'Main' },
  { name: 'Horror', id: 14, category: 'Main' },
  { name: 'Psychological', id: 40, category: 'Main' },
  { name: 'Sports', id: 30, category: 'Main' },
  
  // Demographics
  { name: 'Shounen', id: 27, category: 'Demographics' },
  { name: 'Shoujo', id: 25, category: 'Demographics' },
  { name: 'Seinen', id: 42, category: 'Demographics' },
  { name: 'Josei', id: 43, category: 'Demographics' },
  { name: 'Kids', id: 15, category: 'Demographics' },
  
  // Themes
  { name: 'Mecha', id: 18, category: 'Themes' },
  { name: 'Isekai', id: 62, category: 'Themes' },
  { name: 'Harem', id: 35, category: 'Themes' },
  { name: 'Reverse Harem', id: 69, category: 'Themes' },
  { name: 'Martial Arts', id: 17, category: 'Themes' },
  { name: 'Military', id: 38, category: 'Themes' },
  { name: 'Samurai', id: 21, category: 'Themes' },
  { name: 'Historical', id: 13, category: 'Themes' },
  { name: 'School', id: 23, category: 'Themes' },
  { name: 'Music', id: 19, category: 'Themes' },
  { name: 'Parody', id: 20, category: 'Themes' },
  { name: 'Magic', id: 16, category: 'Themes' },
  { name: 'Super Power', id: 31, category: 'Themes' },
  { name: 'Demons', id: 6, category: 'Themes' },
  { name: 'Vampire', id: 32, category: 'Themes' },
  { name: 'Police', id: 39, category: 'Themes' },
  { name: 'Space', id: 29, category: 'Themes' },
  { name: 'Survival', id: 76, category: 'Themes' },
  { name: 'Reincarnation', id: 72, category: 'Themes' },
  { name: 'Time Travel', id: 78, category: 'Themes' },
  { name: 'Racing', id: 3, category: 'Themes' },
  { name: 'Strategy Game', id: 11, category: 'Themes' },
  
  // Types
  { name: 'Movie', id: 0, category: 'Types', isType: true, typeValue: 'movie' },
  { name: 'TV', id: 0, category: 'Types', isType: true, typeValue: 'tv' },
  { name: 'OVA', id: 0, category: 'Types', isType: true, typeValue: 'ova' },
  { name: 'ONA', id: 0, category: 'Types', isType: true, typeValue: 'ona' },
  { name: 'Special', id: 0, category: 'Types', isType: true, typeValue: 'special' },
];

interface GenrePickerProps {
  variant?: 'dropdown' | 'inline';
  onSelect?: (genre: typeof GENRES[0]) => void;
}

const GenrePicker = ({ variant = 'dropdown', onSelect }: GenrePickerProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(GENRES.map(g => g.category))];
  
  const filteredGenres = GENRES.filter(genre => {
    const matchesSearch = genre.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || genre.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenreClick = (genre: typeof GENRES[0]) => {
    if (onSelect) {
      onSelect(genre);
    } else {
      if (genre.isType) {
        navigate(`/genre?type=${genre.typeValue}`);
      } else {
        navigate(`/genre?id=${genre.id}&name=${encodeURIComponent(genre.name)}`);
      }
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {GENRES.slice(0, 15).map((genre, index) => (
          <motion.button
            key={genre.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGenreClick(genre)}
            className="px-4 py-2 rounded-full text-sm bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-primary/20 border border-white/5 hover:border-primary/30 transition-all"
          >
            {genre.name}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-full text-sm bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all flex items-center gap-1"
        >
          More <ChevronDown className="w-3 h-3" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border-white/10 gap-2"
        >
          <Tag className="w-4 h-4" />
          Genres
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute left-0 top-12 w-80 sm:w-96 glass rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Browse by Genre
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search genres..."
                    className="pl-9 bg-secondary/50 border-white/10"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1 p-2 overflow-x-auto border-b border-white/10">
                <Button
                  variant={selectedCategory === null ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full text-xs flex-shrink-0"
                >
                  All
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-full text-xs flex-shrink-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Genre Grid */}
              <ScrollArea className="h-64">
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredGenres.map((genre, index) => (
                    <motion.button
                      key={genre.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGenreClick(genre)}
                      className="px-3 py-2 rounded-lg text-xs bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-primary/20 border border-white/5 hover:border-primary/30 transition-all text-left"
                    >
                      {genre.name}
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenrePicker;
