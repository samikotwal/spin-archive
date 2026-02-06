import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WatchingAnime {
  animeId: number;
  title: string;
  imageUrl: string;
  currentEpisode: number;
  totalEpisodes: number | null;
  lastWatched: string;
}

const STORAGE_KEY = 'nero_finder_episode_progress';
const ANIME_CACHE_KEY = 'nero_finder_watching_anime';

const ContinueWatchingSection = () => {
  const navigate = useNavigate();
  const [watchingList, setWatchingList] = useState<WatchingAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWatchingAnime();
  }, []);

  const loadWatchingAnime = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setWatchingList([]);
        setIsLoading(false);
        return;
      }

      const allProgress = JSON.parse(stored);
      const animeIds = Object.keys(allProgress);
      
      // Get cached anime data
      const cachedData = localStorage.getItem(ANIME_CACHE_KEY);
      const cache: Record<number, WatchingAnime> = cachedData ? JSON.parse(cachedData) : {};
      
      const watchingAnime: WatchingAnime[] = [];

      for (const animeId of animeIds) {
        const progress = allProgress[animeId];
        const episodes = Object.entries(progress);
        
        // Find the highest episode being watched or watched
        const watchingEpisodes = episodes
          .filter(([_, status]) => status === 'watching' || status === 'watched')
          .map(([ep]) => parseInt(ep))
          .sort((a, b) => b - a);
        
        if (watchingEpisodes.length === 0) continue;

        const currentEpisode = watchingEpisodes[0];
        const id = parseInt(animeId);

        // Check cache first
        if (cache[id]) {
          watchingAnime.push({
            ...cache[id],
            currentEpisode,
            lastWatched: new Date().toISOString(),
          });
        } else {
          // Fetch anime details
          try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
            if (response.ok) {
              const data = await response.json();
              const anime = data.data;
              
              const watchingItem: WatchingAnime = {
                animeId: id,
                title: anime.title,
                imageUrl: anime.images?.jpg?.large_image_url || '',
                currentEpisode,
                totalEpisodes: anime.episodes,
                lastWatched: new Date().toISOString(),
              };
              
              watchingAnime.push(watchingItem);
              cache[id] = watchingItem;
            }
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 350));
          } catch (error) {
            console.error('Error fetching anime:', error);
          }
        }
      }

      // Save cache
      localStorage.setItem(ANIME_CACHE_KEY, JSON.stringify(cache));
      setWatchingList(watchingAnime);
    } catch (error) {
      console.error('Error loading watching anime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatching = (animeId: number) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allProgress = JSON.parse(stored);
      delete allProgress[animeId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      setWatchingList(prev => prev.filter(a => a.animeId !== animeId));
    }
  };

  const getProgress = (current: number, total: number | null) => {
    if (!total) return 0;
    return Math.round((current / total) * 100);
  };

  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </motion.section>
    );
  }

  if (watchingList.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <Clock className="w-5 h-5 text-white" />
          </motion.div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Continue Watching
          </h2>
          <span className="text-sm text-muted-foreground">({watchingList.length})</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none' }}>
        {watchingList.map((anime, index) => (
          <motion.div
            key={anime.animeId}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-72 md:w-80 group"
          >
            <div 
              className="relative rounded-xl overflow-hidden bg-card border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => navigate(`/anime/${anime.animeId}`)}
            >
              {/* Image & Overlay */}
              <div className="relative h-36 md:h-40">
                <img
                  src={anime.imageUrl}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Play Button */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" fill="white" />
                  </div>
                </motion.div>

                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatching(anime.animeId);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </motion.button>

                {/* Episode Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                    {anime.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span>Episode {anime.currentEpisode}</span>
                    {anime.totalEpisodes && (
                      <span>/ {anime.totalEpisodes}</span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <Progress 
                    value={getProgress(anime.currentEpisode, anime.totalEpisodes)} 
                    className="h-1 bg-white/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ContinueWatchingSection;
