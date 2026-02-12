import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Check, Eye, Loader2, ExternalLink, 
  Youtube, Tv, Film, AlertCircle, Search, Send, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
const EPISODES_PER_RANGE = 100;

const EpisodeList = ({ animeId, animeName, totalEpisodes }: EpisodeListProps) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRange, setSelectedRange] = useState(0);
  const [showPlatforms, setShowPlatforms] = useState<number | null>(null);
  
  const { getEpisodeStatus, updateEpisodeStatus, cycleStatus, getWatchedCount } = useEpisodeProgress(animeId);

  // Calculate episode ranges
  const totalEps = totalEpisodes || allEpisodes.length || 0;
  const ranges = useMemo(() => {
    if (totalEps === 0) return [];
    const rangeList: { start: number; end: number; label: string }[] = [];
    for (let i = 0; i < totalEps; i += EPISODES_PER_RANGE) {
      const start = i + 1;
      const end = Math.min(i + EPISODES_PER_RANGE, totalEps);
      rangeList.push({ start, end, label: `${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}` });
    }
    return rangeList;
  }, [totalEps]);

  useEffect(() => {
    const fetchAllEpisodes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        let allData: Episode[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await fetch(`${JIKAN_API}/anime/${animeId}/episodes?page=${page}`);
          if (!response.ok) {
            if (response.status === 429) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            throw new Error('Failed to fetch episodes');
          }
          
          const json = await response.json();
          const newEpisodes = json.data || [];
          allData = [...allData, ...newEpisodes];
          hasMore = json.pagination?.has_next_page || false;
          page++;
          
          if (hasMore) await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        setAllEpisodes(allData);
        setEpisodes(allData);
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load episodes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEpisodes();
  }, [animeId]);

  // Filter episodes based on range and search
  const filteredEpisodes = useMemo(() => {
    let eps: number[] = [];
    
    if (ranges.length > 0 && ranges[selectedRange]) {
      const { start, end } = ranges[selectedRange];
      for (let i = start; i <= end; i++) {
        eps.push(i);
      }
    } else {
      // If no ranges, show all known episode numbers
      const count = totalEps || episodes.length;
      for (let i = 1; i <= count; i++) {
        eps.push(i);
      }
    }
    
    if (searchQuery) {
      eps = eps.filter(n => String(n).includes(searchQuery));
    }
    
    return eps;
  }, [ranges, selectedRange, searchQuery, totalEps, episodes.length]);

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
      case 'telegram':
        return `https://t.me/s/anime_library_bot?q=${encodedName}`;
      case '9anime':
        return `https://9animetv.to/search?keyword=${encodedName}`;
      case 'gogoanime':
        return `https://gogoanime3.co/search.html?keyword=${encodedName}`;
      case 'aniwatch':
        return `https://aniwatch.to/search?keyword=${encodedName}`;
      default:
        return '#';
    }
  };

  const handleWatchClick = (episodeNumber: number, platform: string) => {
    // Auto-mark as watching
    const currentStatus = getEpisodeStatus(episodeNumber);
    if (currentStatus === 'unwatched') {
      updateEpisodeStatus(episodeNumber, 'watching');
    }
    window.open(getWatchUrl(platform, episodeNumber), '_blank');
  };

  const getEpisodeColor = (episodeNumber: number) => {
    const status = getEpisodeStatus(episodeNumber);
    switch (status) {
      case 'watched':
        return 'bg-green-500/30 border-green-500/50 text-green-300 hover:bg-green-500/40';
      case 'watching':
        return 'bg-primary/30 border-primary/50 text-primary hover:bg-primary/40';
      default:
        return 'bg-secondary/50 border-white/10 text-muted-foreground hover:bg-secondary/80 hover:text-foreground';
    }
  };

  if (isLoading) {
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

  if (error) {
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

  if (totalEps === 0) {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Film className="w-6 h-6 text-primary" />
          List of episodes:
        </h2>
        <div className="flex items-center gap-4">
          {totalEpisodes && (
            <span className="text-muted-foreground text-sm">
              {getWatchedCount()}/{totalEpisodes} watched
            </span>
          )}
        </div>
      </div>

      {/* Controls Row - Range Dropdown + Search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Range Selector */}
        {ranges.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 gap-2 rounded-lg">
                <Film className="w-4 h-4" />
                {ranges[selectedRange]?.label || '001-100'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-white/10 max-h-60 overflow-y-auto">
              {ranges.map((range, i) => (
                <DropdownMenuItem 
                  key={i} 
                  onClick={() => setSelectedRange(i)}
                  className={i === selectedRange ? 'bg-primary/20 text-primary' : ''}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Episode Search */}
        <div className="relative flex-1 max-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find number"
            className="pl-9 bg-secondary/50 border-white/10 rounded-lg h-9"
          />
        </div>
      </div>

      {/* Episode Grid - Numbered Buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {filteredEpisodes.map((epNum) => (
          <motion.button
            key={epNum}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPlatforms(showPlatforms === epNum ? null : epNum)}
            className={`relative aspect-square rounded-lg border text-sm font-bold flex items-center justify-center transition-all ${getEpisodeColor(epNum)}`}
          >
            {getEpisodeStatus(epNum) === 'watched' && (
              <Check className="w-3 h-3 absolute top-0.5 right-0.5 text-green-400" />
            )}
            {getEpisodeStatus(epNum) === 'watching' && (
              <Eye className="w-3 h-3 absolute top-0.5 right-0.5 text-primary" />
            )}
            {epNum}
          </motion.button>
        ))}
      </div>

      {/* Platform Popup for selected episode */}
      {showPlatforms !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-card border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-foreground">
              Episode {showPlatforms} - Choose Platform
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => cycleStatus(showPlatforms)}
                className="text-xs"
              >
                {getEpisodeStatus(showPlatforms) === 'unwatched' ? 'Mark Watching' : 
                 getEpisodeStatus(showPlatforms) === 'watching' ? 'Mark Watched' : 'Reset'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPlatforms(null)}
                className="text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'telegram')}
            >
              <Send className="w-3 h-3 mr-1" />
              Telegram
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'youtube')}
            >
              <Youtube className="w-3 h-3 mr-1" />
              Muse Asia
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'hianime')}
            >
              HiAnime
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'crunchyroll')}
            >
              Crunchyroll
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/10 rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'anione')}
            >
              <Tv className="w-3 h-3 mr-1" />
              Ani-One
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, '9anime')}
            >
              9Anime
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'gogoanime')}
            >
              GogoAnime
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 rounded-lg text-xs h-9"
              onClick={() => handleWatchClick(showPlatforms, 'aniwatch')}
            >
              AniWatch
            </Button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded bg-secondary/50 border border-white/10" />
          <span>Unwatched</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded bg-primary/30 border border-primary/50" />
          <span>Watching</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
          <span>Watched</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
          <ExternalLink className="w-3 h-3" />
          Redirects to free streaming platforms
        </p>
      </div>
    </motion.div>
  );
};

export default EpisodeList;
