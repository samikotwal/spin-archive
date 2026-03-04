import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Play, Clock } from 'lucide-react';

interface AiringAnime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score?: number;
  type?: string;
  episodes?: number | null;
  airing?: boolean;
  status?: string;
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const TodayAiringSection = () => {
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AiringAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAiring = async () => {
      try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        const response = await fetch(`${JIKAN_API}/schedules?filter=${today}&limit=20`);
        const json = await response.json();
        setAnime(json.data || []);
      } catch (error) {
        console.error('Error fetching today airing:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodayAiring();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        className="glass rounded-2xl p-6 border border-white/5"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Airing Today
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-xl" />
              <div className="h-3 bg-muted rounded mt-2 w-3/4" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (anime.length === 0) return null;

  return (
    <motion.div
      className="glass rounded-2xl p-6 border border-white/5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Airing Today
        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-green-400 font-medium ml-1">LIVE</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {anime.slice(0, 20).map((item, index) => (
          <motion.div
            key={item.mal_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/anime/${item.mal_id}`)}
            className="cursor-pointer group"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
              <img
                src={item.images.jpg.large_image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3 text-primary" fill="currentColor" />
                    <span className="text-xs text-white font-medium">Watch</span>
                  </div>
                </div>
              </div>
              {item.score && (
                <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  <span className="text-xs text-white font-bold">{item.score.toFixed(1)}</span>
                </div>
              )}
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors mt-2 line-clamp-2">
              {item.title}
            </h4>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TodayAiringSection;
