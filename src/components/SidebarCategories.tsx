import { motion } from 'framer-motion';
import { TrendingUp, Flame, Star, Calendar, Film, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarCategory {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const POPULAR_ANIME = [
  "Naruto", "One Piece", "Attack on Titan", "Death Note", "Dragon Ball Z",
  "My Hero Academia", "Demon Slayer", "Jujutsu Kaisen", "Fullmetal Alchemist",
  "Hunter x Hunter", "Bleach", "Sword Art Online", "Tokyo Ghoul", "One Punch Man",
  "Mob Psycho 100", "Spy x Family", "Chainsaw Man", "Vinland Saga", "Made in Abyss",
  "Steins;Gate", "Code Geass", "Cowboy Bebop", "Neon Genesis Evangelion",
  "Your Name", "Spirited Away", "Akira", "Ghost in the Shell", "Violet Evergarden",
  "Clannad", "Re:Zero", "Konosuba", "Overlord", "The Rising of the Shield Hero",
  "That Time I Got Reincarnated as a Slime", "Black Clover"
];

const SidebarCategories = () => {
  const navigate = useNavigate();

  const categories: SidebarCategory[] = [
    {
      name: 'Trending',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => navigate('/explore?sort=trending'),
      color: 'from-orange-500 to-red-500',
    },
    {
      name: 'Top Airing',
      icon: <Flame className="w-4 h-4" />,
      action: () => navigate('/explore?status=airing'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Top Rated',
      icon: <Star className="w-4 h-4" />,
      action: () => navigate('/explore?sort=score'),
      color: 'from-yellow-500 to-orange-500',
    },
    {
      name: 'Upcoming',
      icon: <Calendar className="w-4 h-4" />,
      action: () => navigate('/explore?status=upcoming'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Movies',
      icon: <Film className="w-4 h-4" />,
      action: () => navigate('/genre?type=movie'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'TV Series',
      icon: <Tv className="w-4 h-4" />,
      action: () => navigate('/genre?type=tv'),
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const handleAnimeClick = (name: string) => {
    navigate(`/explore?q=${encodeURIComponent(name)}`);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl p-4 border border-white/5 sticky top-24"
    >
      {/* Categories */}
      <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">
        Categories
      </h3>
      <div className="space-y-2 mb-6">
        {categories.map((category, index) => (
          <motion.button
            key={category.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={category.action}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white`}>
              {category.icon}
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Popular Anime */}
      <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider border-t border-white/10 pt-4">
        Popular Anime
      </h3>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
        {POPULAR_ANIME.map((name, index) => (
          <motion.button
            key={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.02 }}
            whileHover={{ x: 3 }}
            onClick={() => handleAnimeClick(name)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all truncate"
          >
            <span className="text-xs text-primary/60 mr-2">{String(index + 1).padStart(2, '0')}</span>
            {name}
          </motion.button>
        ))}
      </div>
    </motion.aside>
  );
};

export default SidebarCategories;
