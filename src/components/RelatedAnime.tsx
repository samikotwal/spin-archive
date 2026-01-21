import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimeCard from './AnimeCard';

interface RelatedAnimeProps {
  animeId: number;
  genres: { name: string }[];
}

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
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const RelatedAnime = ({ animeId, genres }: RelatedAnimeProps) => {
  const [relatedAnime, setRelatedAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchRelatedAnime = async () => {
      if (!genres.length) return;

      setIsLoading(true);
      try {
        // Get the first genre for recommendations
        const genreName = genres[0]?.name;
        if (!genreName) return;

        // Fetch recommendations based on the anime
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
        const response = await fetch(`${JIKAN_API}/anime/${animeId}/recommendations`);
        const json = await response.json();
        
        const recommendations = json.data?.slice(0, 12).map((rec: any) => rec.entry) || [];
        
        if (recommendations.length > 0) {
          setRelatedAnime(recommendations);
        } else {
          // Fallback to genre-based search
          await new Promise(resolve => setTimeout(resolve, 500));
          const genreResponse = await fetch(`${JIKAN_API}/anime?genres=${genreName}&limit=12&order_by=score&sort=desc`);
          const genreJson = await genreResponse.json();
          setRelatedAnime(genreJson.data?.filter((a: Anime) => a.mal_id !== animeId) || []);
        }
      } catch (error) {
        console.error('Error fetching related anime:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedAnime();
  }, [animeId, genres]);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('related-anime-container');
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Related Anime
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-56 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (relatedAnime.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 border border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Related Anime
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full border-white/10 hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full border-white/10 hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        id="related-anime-container"
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {relatedAnime.map((anime, index) => (
          <motion.div
            key={anime.mal_id}
            className="flex-shrink-0 w-40"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AnimeCard
              id={anime.mal_id}
              title={anime.title}
              imageUrl={anime.images?.jpg?.large_image_url || ''}
              score={anime.score}
              type={anime.type}
              index={index}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RelatedAnime;
