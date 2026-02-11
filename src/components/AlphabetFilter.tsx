import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AlphabetFilter = () => {
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl p-4 border border-white/5 sticky top-24"
    >
      <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">
        Browse A-Z
      </h3>
      <div className="grid grid-cols-3 gap-1.5">
        {ALPHABET.map((letter) => (
          <motion.button
            key={letter}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/browse/${letter}`)}
            className="w-full aspect-square rounded-lg text-sm font-bold transition-all flex items-center justify-center bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            {letter}
          </motion.button>
        ))}
      </div>
    </motion.aside>
  );
};

export default AlphabetFilter;
