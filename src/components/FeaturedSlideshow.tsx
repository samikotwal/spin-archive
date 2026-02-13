import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  score?: number;
  year?: number;
  type?: string;
  synopsis?: string;
  genres?: { name: string }[];
}

interface FeaturedSlideshowProps {
  anime: Anime[];
  isLoading?: boolean;
}

const FeaturedSlideshow = ({ anime, isLoading }: FeaturedSlideshowProps) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const featured = anime.slice(0, 6);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (isLoading || featured.length === 0) {
    return (
      <div className="relative h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden mb-8 bg-muted animate-pulse" />
    );
  }

  const item = featured[current];

  return (
    <div className="relative h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden mb-8 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.mal_id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={item.images.jpg.large_image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.mal_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-foreground mb-2 max-w-lg">
              {item.title}
            </h2>
            <div className="flex items-center gap-3 mb-3">
              {item.score && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
                  <Star className="w-3 h-3" fill="currentColor" />
                  {item.score.toFixed(1)}
                </Badge>
              )}
              {item.type && (
                <Badge variant="secondary">{item.type}</Badge>
              )}
              {item.year && (
                <span className="text-sm text-muted-foreground">{item.year}</span>
              )}
            </div>
            {item.genres && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {item.genres.slice(0, 3).map((g) => (
                  <Badge key={g.name} variant="outline" className="border-white/20 text-xs">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              onClick={() => navigate(`/anime/${item.mal_id}`)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-full px-6 font-bold"
            >
              <Play className="w-4 h-4 mr-2" fill="white" />
              Watch Now
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCurrent((prev) => (prev - 1 + featured.length) % featured.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCurrent((prev) => (prev + 1) % featured.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-primary w-6' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedSlideshow;
