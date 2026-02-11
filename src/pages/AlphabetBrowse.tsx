import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  useEffect(() => {
    if (letter) {
      setPage(1);
      setAnimeList([]);
      fetchAnime(1);
    }
  }, [letter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnime(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-background bg-animated-gradient">
      <FloatingParticles />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-black text-foreground">
            Anime starting with "<span className="text-primary">{letter?.toUpperCase()}</span>"
          </h1>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-card"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : animeList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-muted-foreground text-xl">
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

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-3 rounded-xl font-bold"
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
      </div>
    </div>
  );
};

export default AlphabetBrowse;
