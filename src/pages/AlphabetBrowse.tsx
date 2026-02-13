import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Star, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimeCardEnhanced from '@/components/AnimeCardEnhanced';
import FloatingParticles from '@/components/FloatingParticles';

interface AnimeResult {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score: number;
  year: number | null;
  type: string;
}

const ITEMS_PER_PAGE = 10;

const AlphabetBrowse = () => {
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState<AnimeResult[]>([]);
  const [topAnime, setTopAnime] = useState<AnimeResult[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingTop, setIsLoadingTop] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchAnime = async (pageNum: number, append = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const query = letter === '#' ? '1' : letter;
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?letter=${query}&order_by=title&sort=asc&limit=${ITEMS_PER_PAGE}&page=${pageNum}`
      );
      const json = await res.json();
      const data: AnimeResult[] = json.data || [];
      setHasMore(json.pagination?.has_next_page ?? false);

      if (append) {
        setAnimeList((prev) => [...prev, ...data]);
      } else {
        setAnimeList(data);
      }
    } catch (err) {
      console.error('Error fetching anime:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch top 10 anime starting with this letter (sorted by score)
  const fetchTopAnime = async () => {
    setIsLoadingTop(true);
    try {
      const query = letter === '#' ? '1' : letter;
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?letter=${query}&order_by=score&sort=desc&limit=10&page=1`
      );
      const json = await res.json();
      setTopAnime(json.data || []);
    } catch (err) {
      console.error('Error fetching top anime:', err);
    } finally {
      setIsLoadingTop(false);
    }
  };

  useEffect(() => {
    if (letter) {
      setPage(1);
      setAnimeList([]);
      setTopAnime([]);
      fetchAnime(1);
      // Small delay to avoid Jikan rate limit
      setTimeout(() => fetchTopAnime(), 500);
    }
  }, [letter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnime(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-background bg-animated-gradient pb-16 md:pb-0">
      <FloatingParticles />

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Anime "<span className="text-primary">{letter?.toUpperCase()}</span>"
          </h1>
        </motion.div>

        {/* Top 10 Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Top 10 "{letter?.toUpperCase()}" Anime
            </h2>
          </div>

          {isLoadingTop ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : topAnime.length === 0 ? (
            <p className="text-muted-foreground text-sm">No top anime found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {topAnime.map((anime, index) => (
                <AnimeCardEnhanced
                  key={anime.mal_id}
                  id={anime.mal_id}
                  title={anime.title}
                  imageUrl={anime.images.jpg.large_image_url}
                  score={anime.score}
                  year={anime.year}
                  type={anime.type}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* All Anime A-Z Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              All "{letter?.toUpperCase()}" Anime
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <motion.div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-card"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : animeList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-muted-foreground text-lg">
                No anime found starting with "{letter?.toUpperCase()}"
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {animeList.map((anime, index) => (
                  <AnimeCardEnhanced
                    key={`${anime.mal_id}-${index}`}
                    id={anime.mal_id}
                    title={anime.title}
                    imageUrl={anime.images.jpg.large_image_url}
                    score={anime.score}
                    year={anime.year}
                    type={anime.type}
                    index={index}
                  />
                ))}
              </div>

              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-8"
                >
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-8 py-3 rounded-xl font-bold"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default AlphabetBrowse;
