import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const letters = ['All', '#', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const AZFooter = () => {
  const navigate = useNavigate();

  const handleClick = (letter: string) => {
    if (letter === 'All') {
      navigate('/explore');
    } else {
      navigate(`/browse/${encodeURIComponent(letter)}`);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-8 border-t border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold text-foreground">A-Z LIST</h3>
          <span className="text-sm text-muted-foreground">| Searching anime order by alphabet name A to Z</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {letters.map((letter) => (
            <motion.button
              key={letter}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(letter)}
              className="w-10 h-10 rounded-lg bg-secondary/50 border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-sm font-bold text-muted-foreground hover:text-primary transition-all flex items-center justify-center"
            >
              {letter}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default AZFooter;
