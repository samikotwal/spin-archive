import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Tag, Sparkles, Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimeCardEnhanced from '@/components/AnimeCardEnhanced';
import FloatingParticles from '@/components/FloatingParticles';
import { useLenis } from '@/hooks/useLenis';

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  score?: number;
  year?: number;
  type?: string;
  status?: string;
  episodes?: number | null;
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const GenrePage = () => {
  useLenis();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const genreId = searchParams.get('id');
  const genreName = searchParams.get('name');
  const typeParam = searchParams.get('type');
  
  const [anime, setAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'title' | 'score' | 'year'>('score');

  const title = genreName || typeParam?.toUpperCase() || 'All Anime';

  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
        
        let endpoint = `${JIKAN_API}/anime?page=${page}&limit=24&order_by=score&sort=desc`;
        
        if (genreId) {
          endpoint += `&genres=${genreId}`;
        }
        if (typeParam) {
          endpoint += `&type=${typeParam}`;
        }
        
        const response = await fetch(endpoint);
        const json = await response.json();
        
        if (page === 1) {
          setAnime(json.data || []);
        } else {
          setAnime(prev => [...prev, ...(json.data || [])]);
        }
        
        setHasMore(json.pagination?.has_next_page || false);
      } catch (error) {
        console.error('Error fetching genre anime:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, [genreId, typeParam, page]);

  // Filter and sort anime
  const processedAnime = anime
    .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortOrder) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'score':
        default:
          return (b.score || 0) - (a.score || 0);
      }
    });

  // Group by first letter for A-Z display
  const groupedAnime = processedAnime.reduce((acc, anime) => {
    const letter = anime.title[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(anime);
    return acc;
  }, {} as Record<string, Anime[]>);

  const alphabet = Object.keys(groupedAnime).sort();

  return (
    <div className="min-h-screen bg-background bg-animated-gradient overflow-x-hidden">
      <FloatingParticles />

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 border-b border-white/5"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md relative ml-auto">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this genre..."
                className="pl-10 bg-secondary/50 border-white/10 rounded-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-secondary/50 rounded-full p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="w-8 h-8 rounded-full"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="w-8 h-8 rounded-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Sort Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-muted-foreground">
            Found <span className="text-primary font-bold">{processedAnime.length}</span> anime
          </p>
          <div className="flex gap-2">
            {(['score', 'title', 'year'] as const).map(sort => (
              <Button
                key={sort}
                variant={sortOrder === sort ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder(sort)}
                className="rounded-full text-xs capitalize"
              >
                {sort}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Alphabet Quick Nav */}
        {sortOrder === 'title' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1 mb-6"
          >
            {alphabet.map(letter => (
              <Button
                key={letter}
                variant="outline"
                size="sm"
                onClick={() => {
                  document.getElementById(`section-${letter}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-8 h-8 p-0 rounded-lg text-xs border-white/10 hover:bg-primary/20 hover:text-primary"
              >
                {letter}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && page === 1 ? (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div 
                key={i} 
                className="aspect-[3/4] rounded-xl bg-card"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : sortOrder === 'title' ? (
          /* A-Z Grouped View */
          <div className="space-y-8">
            {alphabet.map(letter => (
              <motion.section
                key={letter}
                id={`section-${letter}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-black text-primary mb-4 flex items-center gap-3">
                  <span className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    {letter}
                  </span>
                  <span className="text-sm text-muted-foreground font-normal">
                    ({groupedAnime[letter].length} anime)
                  </span>
                </h2>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  {groupedAnime[letter].map((anime, index) => (
                    <AnimeCardEnhanced
                      key={anime.mal_id}
                      id={anime.mal_id}
                      title={anime.title}
                      imageUrl={anime.images.jpg.large_image_url}
                      score={anime.score}
                      year={anime.year}
                      type={anime.type}
                      status={anime.status}
                      episodes={anime.episodes}
                      index={index}
                      showWatchlist
                    />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        ) : (
          /* Regular Grid View */
          <>
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                : 'grid-cols-1 sm:grid-cols-2'
            }`}>
              {processedAnime.map((anime, index) => (
                <AnimeCardEnhanced
                  key={anime.mal_id}
                  id={anime.mal_id}
                  title={anime.title}
                  imageUrl={anime.images.jpg.large_image_url}
                  score={anime.score}
                  year={anime.year}
                  type={anime.type}
                  status={anime.status}
                  episodes={anime.episodes}
                  index={index}
                  showWatchlist
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-8"
              >
                <Button
                  onClick={() => setPage(p => p + 1)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-accent rounded-full px-8"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">NERO FINDER</span>
          </div>
          <p>© 2026 NERO FINDER. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default GenrePage;
