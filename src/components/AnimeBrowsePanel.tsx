import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Check, ChevronLeft, ChevronRight, Flame, Tv, Film, CalendarClock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimeData } from '@/hooks/useAnimeData';

interface AnimeBrowsePanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  existingItems: string[];
  onAdd: (name: string) => void;
}

type Tab = 'popular' | 'airing' | 'movies' | 'upcoming' | 'tv';

const TABS: { id: Tab; label: string; Icon: typeof Flame }[] = [
  { id: 'popular', label: 'Top', Icon: Flame },
  { id: 'airing', label: 'Airing', Icon: Tv },
  { id: 'movies', label: 'Movies', Icon: Film },
  { id: 'upcoming', label: 'Soon', Icon: CalendarClock },
  { id: 'tv', label: 'TV', Icon: Sparkles },
];

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };

const AnimeBrowsePanel = ({ collapsed, onToggleCollapse, existingItems, onAdd }: AnimeBrowsePanelProps) => {
  const [tab, setTab] = useState<Tab>('popular');
  const data = useAnimeData();
  const existingLower = useMemo(() => new Set(existingItems.map(i => i.toLowerCase().trim())), [existingItems]);

  const current = (() => {
    switch (tab) {
      case 'popular': return { list: data.popularAnime, loading: data.isLoadingPopular, hasMore: data.hasMorePopular, loadMore: data.loadMorePopular };
      case 'airing': return { list: data.topAiringAnime, loading: data.isLoadingAiring, hasMore: data.hasMoreAiring, loadMore: data.loadMoreAiring };
      case 'movies': return { list: data.animeMovies, loading: data.isLoadingMovies, hasMore: data.hasMoreMovies, loadMore: data.loadMoreMovies };
      case 'upcoming': return { list: data.upcomingAnime, loading: data.isLoadingUpcoming, hasMore: data.hasMoreUpcoming, loadMore: data.loadMoreUpcoming };
      case 'tv': return { list: data.tvSeriesAnime, loading: data.isLoadingTV, hasMore: data.hasMoreTV, loadMore: data.loadMoreTV };
    }
  })();

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 0 }} animate={{ width: 36 }} transition={spring}
        className="shrink-0 bg-card/60 border-r border-border/10 flex flex-col items-center py-2 gap-2"
      >
        <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
          title="Open anime browser">
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
        {TABS.map(({ id, Icon }) => (
          <motion.button key={id} whileTap={{ scale: 0.9 }}
            onClick={() => { setTab(id); onToggleCollapse(); }}
            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
            title={id}>
            <Icon className="w-3.5 h-3.5" />
          </motion.button>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
      transition={spring}
      className="shrink-0 bg-card/95 backdrop-blur-xl border-r border-border/10 flex flex-col overflow-hidden"
    >
      <div className="h-12 flex items-center justify-between px-3 border-b border-border/10 shrink-0">
        <span className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-primary" /> Browse Anime
        </span>
        <motion.button onClick={onToggleCollapse} whileTap={{ scale: 0.9 }}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/60 hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="flex shrink-0 border-b border-border/10 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 min-w-0 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 relative transition-colors ${
              tab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon className="w-3 h-3" />
            <span className="truncate">{label}</span>
            {tab === id && (
              <motion.div layoutId="browse-tab-ind" className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" transition={spring} />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {current.loading && current.list.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {current.list.map((anime, i) => {
                  const title = anime.title;
                  const added = existingLower.has(title.toLowerCase().trim());
                  return (
                    <motion.button
                      key={`${tab}-${anime.mal_id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.01, 0.2) }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !added && onAdd(title)}
                      disabled={added}
                      className={`group relative rounded-lg overflow-hidden border text-left transition-all ${
                        added
                          ? 'border-primary/50 bg-primary/10 cursor-default'
                          : 'border-border/20 hover:border-primary/40 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-muted/30 relative">
                        {anime.images?.jpg?.large_image_url ? (
                          <img src={anime.images.jpg.large_image_url} alt={title}
                            loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/30">🎬</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 pt-6">
                          <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">{title}</p>
                          {anime.score && (
                            <p className="text-[9px] text-yellow-300 font-semibold mt-0.5">★ {anime.score}</p>
                          )}
                        </div>
                        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          added
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-black/60 text-white opacity-0 group-hover:opacity-100'
                        }`}>
                          {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {current.hasMore && (
              <Button
                size="sm" variant="outline"
                onClick={current.loadMore}
                disabled={current.loading}
                className="w-full mt-3 h-8 text-xs rounded-lg border-dashed border-border/30 hover:border-primary/40 hover:bg-primary/5"
              >
                {current.loading ? (
                  <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Loading…</>
                ) : (
                  <>Load more</>
                )}
              </Button>
            )}
            {!current.hasMore && current.list.length > 0 && (
              <p className="text-center text-[10px] text-muted-foreground/40 py-3">— end —</p>
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-border/10 px-3 py-1.5">
        <p className="text-[9px] text-muted-foreground/60 text-center">
          Tap a card to add to wheel
        </p>
      </div>
    </motion.div>
  );
};

export default AnimeBrowsePanel;
