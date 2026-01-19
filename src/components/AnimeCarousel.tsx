import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselItem {
  id: number;
  title: string;
  imageUrl: string;
  synopsis?: string;
  score?: number;
}

interface AnimeCarouselProps {
  items: CarouselItem[];
}

const AnimeCarousel = ({ items }: AnimeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goNext = () => {
    setDirection(1);
    goToSlide((currentIndex + 1) % items.length);
  };
  
  const goPrev = () => {
    setDirection(-1);
    goToSlide((currentIndex - 1 + items.length) % items.length);
  };

  if (items.length === 0) {
    return (
      <div className="relative h-[550px] w-full bg-card/50 rounded-3xl flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Loading featured anime...
        </motion.div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div 
      className="relative h-[550px] w-full overflow-hidden rounded-3xl neon-border"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image with Parallax */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ 
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.4 },
          }}
          className="absolute inset-0"
        >
          <motion.img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10 }}
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)`,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl"
            >
              {/* Featured Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm mb-4 border border-primary/30"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary">Featured</span>
              </motion.div>

              {/* Score Badge */}
              {currentItem.score && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 backdrop-blur-sm mb-4 ml-3 border border-yellow-500/30"
                >
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  <span className="text-sm font-bold text-yellow-400">{currentItem.score.toFixed(1)}</span>
                </motion.div>
              )}

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
              >
                {currentItem.title}
              </motion.h2>
              
              {currentItem.synopsis && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground text-lg line-clamp-3 mb-8"
                >
                  {currentItem.synopsis}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold px-10 py-6 text-lg rounded-full shadow-2xl btn-glow"
                >
                  <Play className="w-6 h-6 mr-2" fill="white" />
                  Watch Now
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10"
          onClick={goPrev}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10"
          onClick={goNext}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {items.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-500 ${
              index === currentIndex 
                ? 'bg-gradient-to-r from-primary to-accent w-12' 
                : 'bg-white/30 hover:bg-white/50 w-3'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-accent to-glow-cyan"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          key={currentIndex}
        />
      </div>
    </div>
  );
};

export default AnimeCarousel;
