import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Genre name -> Jikan genre ID mapping
const genreMap: Record<string, number> = {
  'Action': 1, 'Adventure': 2, 'Comedy': 4, 'Drama': 8,
  'Ecchi': 9, 'Fantasy': 10, 'Horror': 14, 'Mystery': 7,
  'Romance': 22, 'Sci-Fi': 24, 'Slice of Life': 36, 'Sports': 30,
  'Supernatural': 37, 'Suspense': 41, 'Mecha': 18, 'Music': 19,
  'Psychological': 40, 'Shounen': 27, 'Shoujo': 25, 'Seinen': 42,
  'Josei': 43, 'Kids': 15, 'Military': 38, 'Police': 39,
  'Space': 29, 'Vampire': 32, 'Harem': 35, 'Historical': 13,
  'Martial Arts': 17, 'Parody': 20, 'Samurai': 21, 'School': 23,
  'Demons': 6, 'Magic': 16, 'Super Power': 31, 'Game': 11,
  'Isekai': 62, 'Racing': 3, 'Hentai': 12,
};

const allGenres = Object.keys(genreMap);

const GenreSidebar = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const displayedGenres = showAll ? allGenres : allGenres.slice(0, 18);
  const highlightedGenres = ['Action', 'Adventure', 'Drama', 'Fantasy', 'Romance', 'Shounen', 'Sci-Fi', 'Comedy', 'Supernatural', 'Hentai'];

  return (
    <div>
      <h3 className="text-lg font-bold text-accent mb-3">Genres</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {displayedGenres.map((genre) => (
          <motion.button
            key={genre}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/genre/${encodeURIComponent(genre.toLowerCase())}?id=${genreMap[genre]}&name=${encodeURIComponent(genre)}`)}
            className={`text-xs py-1.5 px-2 rounded-md transition-colors text-left truncate ${
              highlightedGenres.includes(genre)
                ? 'text-accent hover:text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {genre}
          </motion.button>
        ))}
      </div>
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-3 w-full py-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground text-xs font-medium flex items-center justify-center gap-1 transition-colors"
      >
        {showAll ? (
          <>Show less <ChevronUp className="w-3 h-3" /></>
        ) : (
          <>Show more <ChevronDown className="w-3 h-3" /></>
        )}
      </button>
    </div>
  );
};

export default GenreSidebar;
