import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score?: number;
  type?: string;
  episodes?: number | null;
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const MostViewedSidebar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [dayAnime, setDayAnime] = useState<Anime[]>([]);
  const [weekAnime, setWeekAnime] = useState<Anime[]>([]);
  const [monthAnime, setMonthAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'day' as const, label: 'Day' },
    { id: 'week' as const, label: 'Week' },
    { id: 'month' as const, label: 'Month' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch 25 items for each tab from different endpoints
        const [dayRes, weekRes, monthRes] = await Promise.all([
          fetch(`${JIKAN_API}/top/anime?filter=airing&limit=20`),
          fetch(`${JIKAN_API}/top/anime?filter=bypopularity&limit=20`),
          fetch(`${JIKAN_API}/top/anime?limit=20`),
        ]);

        const [dayJson, weekJson, monthJson] = await Promise.all([
          dayRes.json(),
          weekRes.json(),
          monthRes.json(),
        ]);

        setDayAnime(dayJson.data || []);
        setWeekAnime(weekJson.data || []);
        setMonthAnime(monthJson.data || []);
      } catch (error) {
        console.error('Error fetching most viewed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayed = activeTab === 'day' ? dayAnime : activeTab === 'week' ? weekAnime : monthAnime;

  return (
    <div>
      <h3 className="text-lg font-bold text-accent mb-3">Most Viewed</h3>

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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
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
          {displayed.slice(0, 20).map((item, index) => (
            <motion.div
              key={`${activeTab}-${item.mal_id}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ x: -4 }}
              onClick={() => navigate(`/anime/${item.mal_id}`)}
              className="flex gap-3 cursor-pointer group items-start"
            >
              <span className="text-2xl font-black text-muted-foreground/40 w-8 text-right flex-shrink-0 mt-1">
                {String(index + 1).padStart(2, '0')}
              </span>
              <img
                src={item.images.jpg.large_image_url}
                alt={item.title}
                className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
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
