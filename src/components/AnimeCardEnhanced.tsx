import { motion } from 'framer-motion';
import { Star, Play, Clock, Film, Tv, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import WatchlistButton from './WatchlistButton';

interface AnimeCardEnhancedProps {
  id?: number;
  title: string;
  imageUrl: string;
  score?: number;
  year?: number;
  type?: string;
  status?: string;
  episodes?: number | null;
  index?: number;
  showWatchlist?: boolean;
}

const AnimeCardEnhanced = ({ 
  id, 
  title, 
  imageUrl, 
  score, 
  year, 
  type, 
  status,
  episodes,
  index = 0,
  showWatchlist = false,
}: AnimeCardEnhancedProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/anime/${id}`);
    }
  };

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'currently airing':
      case 'airing':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'finished airing':
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'not yet aired':
      case 'upcoming':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-secondary/50 text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case 'currently airing':
      case 'airing':
        return <Clock className="w-3 h-3" />;
      case 'finished airing':
      case 'completed':
        return <CalendarCheck className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTypeIcon = () => {
    if (type === 'Movie') return <Film className="w-3 h-3" />;
    return <Tv className="w-3 h-3" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.03, 
        duration: 0.4,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-card cursor-pointer"
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4))',
        }}
      />

      {/* Card Content */}
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Play Button on Hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <motion.div 
              className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center glow-primary"
              whileHover={{ scale: 1.1 }}
            >
              <Play className="w-7 h-7 text-white ml-0.5" fill="white" />
            </motion.div>
          </motion.div>

          {/* Top Row - Score & Type */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Score Badge */}
            {score && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 + 0.1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10"
              >
                <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                <span className="text-xs font-bold text-white">{score.toFixed(1)}</span>
              </motion.div>
            )}

            {/* Type Badge */}
            {type && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 + 0.15 }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-primary/80 to-accent/80 backdrop-blur-md"
              >
                {getTypeIcon()}
                <span className="text-xs font-bold text-white">{type}</span>
              </motion.div>
            )}
          </div>

          {/* Status Badge */}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 + 0.2 }}
              className="absolute bottom-14 left-2"
            >
              <Badge className={`text-[10px] gap-1 ${getStatusColor()}`}>
                {getStatusIcon()}
                {status === 'Currently Airing' ? 'Airing' : status === 'Finished Airing' ? 'Completed' : status}
              </Badge>
            </motion.div>
          )}

          {/* Watchlist Button */}
          {showWatchlist && id && status?.toLowerCase().includes('airing') && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 + 0.25 }}
              className="absolute bottom-14 right-2"
            >
              <WatchlistButton
                anime={{
                  mal_id: id,
                  title,
                  image_url: imageUrl,
                  currentEpisode: episodes || 0,
                }}
                variant="icon"
              />
            </motion.div>
          )}
        </div>

        {/* Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <motion.h3 
            className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {title}
          </motion.h3>
          <div className="flex items-center gap-2 mt-1">
            {year && (
              <span className="text-xs text-white/60">{year}</span>
            )}
            {episodes && (
              <span className="text-xs text-white/60">• {episodes} eps</span>
            )}
          </div>
        </div>

        {/* Border Glow on Hover */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        >
          <div className="absolute inset-0 rounded-xl ring-2 ring-primary/50" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnimeCardEnhanced;
