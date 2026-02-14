import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score?: number;
  year?: number;
  type?: string;
  episodes?: number | null;
  status?: string;
}

interface AnimeColumnListProps {
  title: string;
  anime: Anime[];
  isLoading?: boolean;
  titleColor?: string;
}

const AnimeColumnList = ({ title, anime, isLoading, titleColor = 'text-primary' }: AnimeColumnListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-bold ${titleColor} mb-4`}>{title}</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-12 h-16 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <h3 className={`text-lg font-bold ${titleColor} mb-4`}>{title}</h3>
      <div className="space-y-2">
        {anime.slice(0, 8).map((item, index) => (
          <motion.div
            key={item.mal_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4, backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
            onClick={() => navigate(`/anime/${item.mal_id}`)}
            className="flex gap-3 p-2 rounded-lg cursor-pointer transition-colors group"
          >
            <img
              src={item.images.jpg.large_image_url}
              alt={item.title}
              className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {item.type === 'Movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                  {item.type}
                </span>
                {item.episodes && (
                  <span className="text-xs text-accent font-medium">
                    EP {item.episodes}
                  </span>
                )}
                {item.score && (
                  <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                    <Star className="w-3 h-3" fill="currentColor" />
                    {item.score.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimeColumnList;
