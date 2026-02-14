import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const allGenres = [
  'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
  'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Historical',
  'Horror', 'Isekai', 'Josei', 'Kids', 'Magic', 'Martial Arts',
  'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police',
  'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi',
  'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Space',
  'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire',
];

const GenreSidebar = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const displayedGenres = showAll ? allGenres : allGenres.slice(0, 18);
  const highlightedGenres = ['Action', 'Adventure', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Isekai', 'Kids', 'Magic'];

  return (
    <div>
      <h3 className="text-lg font-bold text-accent mb-3">Genres</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {displayedGenres.map((genre) => (
          <motion.button
            key={genre}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/genre/${encodeURIComponent(genre.toLowerCase())}`)}
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
