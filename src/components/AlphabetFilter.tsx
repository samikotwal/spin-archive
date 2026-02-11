import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimeCardEnhanced from '@/components/AnimeCardEnhanced';

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AnimeResult {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score: number;
  year: number | null;
  type: string;
}

const AlphabetFilter = () => {
  const navigate = useNavigate();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLetterClick = async (letter: string) => {
    if (activeLetter === letter) {
      setActiveLetter(null);
      setResults([]);
      return;
    }

    setActiveLetter(letter);
    setIsLoading(true);

    try {
      const query = letter === '#' ? '1' : letter;
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?letter=${query}&order_by=title&sort=asc&limit=25`
      );
      const json = await res.json();
      setResults(json.data || []);
    } catch (err) {
      console.error('Error fetching anime by letter:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl p-4 border border-white/5 sticky top-24"
    >
      <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">
        Browse A-Z
      </h3>
      <div className="grid grid-cols-3 gap-1.5">
        {ALPHABET.map((letter) => (
          <motion.button
            key={letter}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLetterClick(letter)}
            className={`
              w-full aspect-square rounded-lg text-sm font-bold transition-all flex items-center justify-center
              ${activeLetter === letter
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }
            `}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Results panel */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-white/10 pt-4"
          >
            <h4 className="text-sm font-bold text-foreground mb-3">
              Anime starting with "{activeLetter}"
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-10 rounded-lg bg-muted"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            ) : results.length === 0 ? (
              <p className="text-muted-foreground text-xs">No anime found</p>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                {results.map((anime) => (
                  <motion.button
                    key={anime.mal_id}
                    whileHover={{ x: 3 }}
                    onClick={() => navigate(`/anime/${anime.mal_id}`)}
                    className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <img
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className="w-8 h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{anime.title}</p>
                      <p className="text-xs text-muted-foreground/60">
                        {anime.type} {anime.year ? `• ${anime.year}` : ''}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default AlphabetFilter;
