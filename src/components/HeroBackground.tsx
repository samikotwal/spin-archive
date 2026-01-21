import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Popular anime images for hero background rotation
const heroImages = [
  'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', // Solo Leveling
  'https://cdn.myanimelist.net/images/anime/1015/121054l.jpg', // Chainsaw Man
  'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',  // Demon Slayer
  'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',  // Attack on Titan
  'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg', // Frieren
  'https://cdn.myanimelist.net/images/anime/1708/133435l.jpg', // Blue Lock
];

const HeroBackground = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <motion.img
            src={heroImages[currentIndex]}
            alt="Hero background"
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 6, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      
      {/* Animated Color Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 80% 50%, hsl(262 83% 58% / 0.15), transparent 60%)',
            'radial-gradient(ellipse at 70% 40%, hsl(338 90% 56% / 0.15), transparent 60%)',
            'radial-gradient(ellipse at 80% 50%, hsl(262 83% 58% / 0.15), transparent 60%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary w-6' : 'bg-white/30 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBackground;
