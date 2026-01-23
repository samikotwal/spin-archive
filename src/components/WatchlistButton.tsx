import { motion } from 'framer-motion';
import { Bell, BellRing, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiringNotifications } from '@/hooks/useAiringNotifications';

interface WatchlistButtonProps {
  anime: {
    mal_id: number;
    title: string;
    image_url: string;
    currentEpisode?: number;
  };
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
}

const WatchlistButton = ({ anime, variant = 'default', className = '' }: WatchlistButtonProps) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAiringNotifications();
  
  const inWatchlist = isInWatchlist(anime.mal_id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist(anime);
    }
  };

  if (variant === 'icon') {
    return (
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          size="icon"
          variant={inWatchlist ? 'default' : 'outline'}
          onClick={handleClick}
          className={`rounded-full ${inWatchlist ? 'bg-primary' : 'border-white/10'} ${className}`}
        >
          {inWatchlist ? (
            <BellRing className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </Button>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="sm"
          variant={inWatchlist ? 'default' : 'outline'}
          onClick={handleClick}
          className={`rounded-full gap-1.5 ${inWatchlist ? 'bg-primary' : 'border-white/10'} ${className}`}
        >
          {inWatchlist ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs">Following</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs">Follow</span>
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant={inWatchlist ? 'default' : 'outline'}
        onClick={handleClick}
        className={`rounded-full gap-2 ${
          inWatchlist 
            ? 'bg-gradient-to-r from-primary to-accent text-white' 
            : 'border-white/10 hover:border-primary/50'
        } ${className}`}
      >
        {inWatchlist ? (
          <>
            <BellRing className="w-4 h-4" />
            Following
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Follow for Updates
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default WatchlistButton;
