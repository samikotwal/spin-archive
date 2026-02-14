import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score?: number;
  type?: string;
  episodes?: number | null;
}

interface MostViewedSidebarProps {
  anime: Anime[];
  isLoading?: boolean;
}

const MostViewedSidebar = ({ anime, isLoading }: MostViewedSidebarProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');

  const tabs = [
    { id: 'day' as const, label: 'Day' },
    { id: 'week' as const, label: 'Week' },
    { id: 'month' as const, label: 'Month' },
  ];

  // Use different slices for different tabs to simulate variety
  const getAnimeForTab = () => {
    switch (activeTab) {
      case 'day': return anime.slice(0, 5);
      case 'week': return anime.slice(2, 7);
      case 'month': return anime.slice(4, 9);
    }
  };

  const displayed = getAnimeForTab();

  return (
    <div>
      <h3 className="text-lg font-bold text-accent mb-3">Most Viewed</h3>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden mb-4 border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="w-12 h-16 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((item, index) => (
            <motion.div
              key={`${activeTab}-${item.mal_id}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: -4 }}
              onClick={() => navigate(`/anime/${item.mal_id}`)}
              className="flex gap-3 cursor-pointer group items-start"
            >
              {/* Rank Number */}
              <span className="text-2xl font-black text-muted-foreground/40 w-8 text-right flex-shrink-0 mt-1">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Thumbnail */}
              <img
                src={item.images.jpg.large_image_url}
                alt={item.title}
                className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
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
      )}
    </div>
  );
};

export default MostViewedSidebar;
