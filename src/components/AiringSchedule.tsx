import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek } from 'date-fns';

interface ScheduleAnime {
  mal_id: number;
  title: string;
  broadcast?: { time?: string; day?: string };
  episodes?: number | null;
  images: { jpg: { large_image_url: string } };
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AiringSchedule = () => {
  const navigate = useNavigate();
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun, 1=Mon...
  const todayIndex = todayDay === 0 ? 6 : todayDay - 1; // Convert to Mon=0

  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [schedule, setSchedule] = useState<ScheduleAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        await new Promise(r => setTimeout(r, 400));
        const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${DAYS[selectedDay]}&limit=10`);
        const json = await res.json();
        setSchedule(json.data || []);
      } catch (err) {
        console.error('Schedule fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [selectedDay]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Airing Schedule</h2>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {DAY_LABELS.map((label, i) => {
          const date = addDays(weekStart, i);
          const isToday = i === todayIndex;
          const isSelected = i === selectedDay;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-center transition-all min-w-[70px] ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-bold'
                  : isToday
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <div className="text-sm font-bold">{label}</div>
              <div className="text-xs opacity-70">{format(date, 'MMM d')}</div>
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      <div className="space-y-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-4 bg-muted rounded" />
                <div className="w-48 h-4 bg-muted rounded" />
              </div>
              <div className="w-24 h-8 bg-muted rounded-lg" />
            </div>
          ))
        ) : schedule.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No anime scheduled for this day.</p>
        ) : (
          schedule.map((anime, i) => {
            const isCurrentlyAiring = i === Math.floor(schedule.length / 2); // Highlight one
            return (
              <motion.div
                key={anime.mal_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  isCurrentlyAiring ? 'bg-accent/10 border border-accent/20' : 'hover:bg-secondary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono ${isCurrentlyAiring ? 'text-accent font-bold' : 'text-muted-foreground'}`}>
                    {anime.broadcast?.time || '--:--'}
                  </span>
                  <span className={`text-sm font-semibold ${isCurrentlyAiring ? 'text-accent' : 'text-foreground'}`}>
                    {anime.title}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={isCurrentlyAiring ? 'default' : 'secondary'}
                  className={`rounded-lg text-xs h-8 gap-1 ${
                    isCurrentlyAiring ? 'bg-accent text-accent-foreground' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/anime/${anime.mal_id}`);
                  }}
                >
                  <Play className="w-3 h-3" fill="currentColor" />
                  Episode {anime.episodes || '?'}
                </Button>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.section>
  );
};

export default AiringSchedule;
