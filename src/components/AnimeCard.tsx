import { motion } from 'framer-motion';
import { Star, Play } from 'lucide-react';

interface AnimeCardProps {
  title: string;
  imageUrl: string;
  score?: number;
  year?: number;
  type?: string;
  index?: number;
}

const AnimeCard = ({ title, imageUrl, score, year, type, index = 0 }: AnimeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ y: -12, scale: 1.03 }}
      className="group relative overflow-hidden rounded-2xl bg-card cursor-pointer"
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.4), hsl(338 90% 56% / 0.4))',
        }}
      />

      {/* Card Content */}
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
          
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
          
          {/* Play Button on Hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 glow-primary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </motion.div>
          </motion.div>

          {/* Score Badge */}
          {score && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
              className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10"
            >
              <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
              <span className="text-xs font-bold text-white">{score.toFixed(1)}</span>
            </motion.div>
          )}

          {/* Type Badge */}
          {type && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
              className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-md"
            >
              <span className="text-xs font-bold text-white">{type}</span>
            </motion.div>
          )}
        </div>

        {/* Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <motion.h3 
            className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            {title}
          </motion.h3>
          {year && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              className="text-xs text-white/60 mt-1"
            >
              {year}
            </motion.p>
          )}
        </div>

        {/* Border Glow on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
          <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/60" />
        </div>
      </div>
    </motion.div>
  );
};

export default AnimeCard;
