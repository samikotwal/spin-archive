import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Film, Tv, TrendingUp, Flame, ArrowRight, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingParticles from '@/components/FloatingParticles';
import { AuthModal } from '@/components/AuthModal';
import { useLenis } from '@/hooks/useLenis';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Landing = () => {
  useLenis();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully!");
  };

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Series', icon: Tv },
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'airing', label: 'Top Airing', icon: Flame },
  ];

  const topSearches = [
    "Solo Leveling Season 2: Arise from the Shadow",
    "Sakamoto Days",
    "Solo Leveling",
    "One Piece",
    "The Apothecary Diaries Season 2",
    "Shangri-La Frontier",
    "Blue Lock",
    "Frieren: Beyond Journey's End",
  ];

  const trendingPosts = [
    {
      id: 1,
      tag: "#Suggestion",
      time: "7 hours ago",
      comments: 155,
      title: "Do you guys have any tips on how to wake up early? like at 9-10 Am ?",
      content: "As the title says",
      author: "SGNK-43_xD",
    },
    {
      id: 2,
      tag: "#Recommendation",
      time: "2 days ago",
      comments: 80,
      title: "YOU NEED TO WATCH THEM BEFORE YOU DIE!!! Here are some Greatest Anime of All Time which I would Like to Suggest (after my 5 years of anime journey)!!",
      content: "Categories: Romance: Clannad Action: Attack On Titan Adventure: One Piece Sports: Haikyuu!! Isekai: Mushoku Tensei...",
      author: "AnimeLover_99",
    },
    {
      id: 3,
      tag: "#Discussion",
      time: "5 hours ago",
      comments: 245,
      title: "What anime got you into watching anime?",
      content: "For me it was Death Note back in 2008...",
      author: "OtakuMaster",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />

      {/* Header Navigation */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-4">
            {navTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {tab.label}
              </motion.button>
            ))}
            
            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Background Image Effect */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/30 z-10" />
        
        {/* Background Anime Image Effect (using gradient as placeholder) */}
        <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l from-primary/20 via-accent/10 to-transparent opacity-50" />
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent opacity-40 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            {/* Logo */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-black mb-8"
            >
              <span className="text-foreground">h!</span>
              <span className="text-primary">anime</span>
            </motion.h1>

            {/* Search Box */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="mb-6"
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anime..."
                    className="h-14 pl-6 pr-4 bg-card border-white/10 rounded-xl text-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button 
                  type="submit"
                  className="h-14 px-6 bg-primary hover:bg-primary/90 rounded-xl"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </motion.form>

            {/* Top Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <p className="text-muted-foreground text-sm mb-2">
                <span className="text-primary font-semibold">Top search:</span>
                {topSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(search);
                      navigate(`/explore?q=${encodeURIComponent(search)}`);
                    }}
                    className="hover:text-primary transition-colors"
                  >
                    {search}{i < topSearches.length - 1 ? '.' : '...'}
                  </button>
                ))}
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => navigate('/explore')}
                className="h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-full text-lg font-bold group"
              >
                Watch anime
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Share Section */}
              <div className="glass rounded-xl p-6 border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-2xl">🎌</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Share HIANIME</p>
                    <p className="text-sm text-muted-foreground">to your friends</p>
                  </div>
                  <span className="text-muted-foreground ml-auto">520k Shares</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Telegram', 'X', 'Facebook', 'Discord'].map((platform) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 hover:bg-primary/10"
                    >
                      Share
                    </Button>
                  ))}
                </div>
              </div>

              {/* About Content */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">
                  HiAnimes.cz - The best site to watch anime online for Free
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Do you know that according to Google, the monthly search volume for anime related topics is up to 
                  over 1 Billion times? Anime is famous worldwide and it is no wonder we've seen a sharp rise in the 
                  number of free anime streaming sites.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Just like free online movie streaming sites, anime watching sites are not created equally, some are 
                  better than the rest, so we've decided to build HiAnime.cz to be one of the best free anime streaming 
                  site for all anime fans on the world.
                </p>

                <h3 className="text-xl font-bold text-foreground">What is HiAnime.cz?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  HiAnime.cz is a free site to watch anime and you can even download subbed or dubbed anime in 
                  ultra HD quality without any registration or payment. By having only one ads in all kinds, we are trying 
                  to make it the safest site for free anime.
                </p>

                <h3 className="text-xl font-bold text-foreground">Is HiAnimes.cz safe?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes we are, we do have only one Ads to cover the server cost and we keep scanning the ads 24/7 to 
                  make sure all are clean. If you find any ads that is suspicious, please forward us the info and we will 
                  remove it.
                </p>
              </div>
            </motion.div>

            {/* Trending Posts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Trending Posts</h2>
              
              {trendingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-green-400">{post.tag}</span>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    <span className="text-xs text-muted-foreground ml-auto">💬 {post.comments}</span>
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-accent/50" />
                    <span className="text-xs text-muted-foreground">{post.author}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Anime Finder. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Landing;
