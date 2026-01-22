import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Check, Eye, Loader2, ExternalLink, 
  Youtube, Tv, Film, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEpisodeProgress, EpisodeStatus } from '@/hooks/useEpisodeProgress';

interface Episode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  aired?: string;
  filler?: boolean;
  recap?: boolean;
}

interface EpisodeListProps {
  animeId: number;
  animeName: string;
  totalEpisodes: number | null;
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const EpisodeList = ({ animeId, animeName, totalEpisodes }: EpisodeListProps) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { getEpisodeStatus, cycleStatus, getWatchedCount } = useEpisodeProgress(animeId);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Rate limiting - Jikan API requires delays
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const response = await fetch(`${JIKAN_API}/anime/${animeId}/episodes?page=${page}`);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limited. Please try again in a moment.');
          }
          throw new Error('Failed to fetch episodes');
        }
        
        const json = await response.json();
        const newEpisodes = json.data || [];
        
        if (page === 1) {
          setEpisodes(newEpisodes);
        } else {
          setEpisodes(prev => [...prev, ...newEpisodes]);
        }
        
        setHasMore(json.pagination?.has_next_page || false);
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load episodes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodes();
  }, [animeId, page]);

  const getWatchUrl = (platform: string, episodeNumber: number) => {
    const encodedName = encodeURIComponent(animeName);
    
    switch (platform) {
      case 'youtube':
        return `https://www.youtube.com/results?search_query=${encodedName}+episode+${episodeNumber}+Muse+Asia`;
      case 'anione':
        return `https://www.youtube.com/results?search_query=${encodedName}+episode+${episodeNumber}+Ani-One+Asia`;
      case 'crunchyroll':
        return `https://www.crunchyroll.com/search?q=${encodedName}`;
      case 'hianime':
        return `https://hianime.to/search?keyword=${encodedName}`;
      default:
        return '#';
    }
  };

  const getStatusIcon = (status: EpisodeStatus) => {
    switch (status) {
      case 'watched':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'watching':
        return <Eye className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: EpisodeStatus) => {
    switch (status) {
      case 'watched':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Watched</Badge>;
      case 'watching':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Watching</Badge>;
      default:
        return null;
    }
  };

  if (isLoading && episodes.length === 0) {
    return (
      <motion.div 
        className="glass rounded-2xl p-6 border border-white/5"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Film className="w-6 h-6 text-primary" />
          Episodes
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading episodes...</span>
        </div>
      </motion.div>
    );
  }

  if (error && episodes.length === 0) {
    return (
      <motion.div 
        className="glass rounded-2xl p-6 border border-white/5"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Film className="w-6 h-6 text-primary" />
          Episodes
        </h2>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </motion.div>
    );
  }

  if (episodes.length === 0 && !isLoading) {
    return (
      <motion.div 
        className="glass rounded-2xl p-6 border border-white/5"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Film className="w-6 h-6 text-primary" />
          Episodes
        </h2>
        <p className="text-muted-foreground text-center py-8">
          No episode information available for this anime.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass rounded-2xl p-6 border border-white/5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Film className="w-6 h-6 text-primary" />
          Episodes
        </h2>
        <div className="flex items-center gap-4">
          {totalEpisodes && (
            <span className="text-muted-foreground text-sm">
              {getWatchedCount()}/{totalEpisodes} watched
            </span>
          )}
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {episodes.length} episodes
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {episodes.map((episode, index) => {
            const episodeNumber = episode.mal_id || index + 1;
            const status = getEpisodeStatus(episodeNumber);
            
            return (
              <motion.div
                key={episode.mal_id || index}
                className={`p-4 rounded-xl border transition-all hover:border-primary/30 ${
                  status === 'watched' 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : status === 'watching'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Episode Number & Status */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => cycleStatus(episodeNumber)}
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                      title="Click to change status"
                    >
                      {getStatusIcon(status) || <span className="text-primary font-bold text-sm">{episodeNumber}</span>}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">EP {episodeNumber}</span>
                        {episode.filler && (
                          <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs">Filler</Badge>
                        )}
                        {episode.recap && (
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">Recap</Badge>
                        )}
                        {getStatusBadge(status)}
                      </div>
                      <p className="text-muted-foreground text-sm truncate mt-0.5">
                        {episode.title || `Episode ${episodeNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Watch Buttons */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs h-8 px-3"
                      onClick={() => window.open(getWatchUrl('youtube', episodeNumber), '_blank')}
                    >
                      <Youtube className="w-3 h-3 mr-1" />
                      Muse Asia
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 hover:bg-white/10 rounded-lg text-xs h-8 px-3"
                      onClick={() => window.open(getWatchUrl('anione', episodeNumber), '_blank')}
                    >
                      <Tv className="w-3 h-3 mr-1" />
                      Ani-One
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 rounded-lg text-xs h-8 px-3"
                      onClick={() => window.open(getWatchUrl('crunchyroll', episodeNumber), '_blank')}
                    >
                      Crunchyroll
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-lg text-xs h-8 px-3"
                      onClick={() => window.open(getWatchUrl('hianime', episodeNumber), '_blank')}
                    >
                      HiAnime
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="pt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={isLoading}
              className="border-white/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Episodes'
              )}
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Legal Disclaimer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Redirects to official free streaming platforms
        </p>
      </div>
    </motion.div>
  );
};

export default EpisodeList;
