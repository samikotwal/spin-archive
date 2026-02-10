import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const JIKAN_API = 'https://api.jikan.moe/v4';

interface SuggestionAnime {
  mal_id: number;
  title: string;
  images: { jpg: { small_image_url: string } };
  score?: number;
  type?: string;
}

const TRENDING = [
  "Solo Leveling Season 2", "Sakamoto Days", "One Piece",
  "The Apothecary Diaries", "Blue Lock", "Frieren",
  "Jujutsu Kaisen", "Demon Slayer",
];

interface SearchSuggestionsProps {
  onSearch: (query: string) => void;
}

const SearchSuggestions = ({ onSearch }: SearchSuggestionsProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionAnime[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=6`);
        const json = await res.json();
        setSuggestions(json.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query.trim());
    }
  };

  const goToAnime = (id: number) => {
    setShowDropdown(false);
    navigate(`/anime/${id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <motion.div
          className="flex-1 relative group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search anime..."
            className="h-14 pl-6 pr-4 bg-card/50 border-white/10 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <motion.div
            className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))' }}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
          <Button type="submit" className="h-14 w-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl">
            <Search className="w-5 h-5" />
          </Button>
        </motion.div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-14 mt-2 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
          >
            {/* Suggestions from API */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-1 flex items-center gap-1">
                  <Search className="w-3 h-3" /> Results
                </p>
                {suggestions.map((anime) => (
                  <motion.button
                    key={anime.mal_id}
                    whileHover={{ x: 4, backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
                    onClick={() => goToAnime(anime.mal_id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                  >
                    <img
                      src={anime.images.jpg.small_image_url}
                      alt={anime.title}
                      className="w-10 h-14 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{anime.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {anime.type && <span>{anime.type}</span>}
                        {anime.score && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            {anime.score}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
            )}

            {/* Trending when no query */}
            {!query.trim() && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending
                </p>
                {TRENDING.map((name) => (
                  <motion.button
                    key={name}
                    whileHover={{ x: 4, backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
                    onClick={() => {
                      setQuery(name);
                      setShowDropdown(false);
                      onSearch(name);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <TrendingUp className="w-3 h-3 text-primary" />
                    {name}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSuggestions;
