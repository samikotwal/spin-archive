import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Film, Tv, TrendingUp, Flame, ArrowRight, User, LogOut, Sparkles, Play, Star, ChevronRight } from 'lucide-react';
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
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const { user, signOut } = useAuth();
  const { scrollY } = useScroll();
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 300], [0, 50]);

  // Rotating background colors
  const bgGradients = [
    'from-primary/30 via-accent/20 to-transparent',
    'from-accent/30 via-primary/20 to-transparent',
    'from-blue-500/30 via-primary/20 to-transparent',
    'from-green-500/30 via-accent/20 to-transparent',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgGradients.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    "Solo Leveling Season 2",
    "Sakamoto Days",
    "One Piece",
    "The Apothecary Diaries",
    "Blue Lock",
    "Frieren",
    "Jujutsu Kaisen",
    "Demon Slayer",
  ];

  const trendingPosts = [
    {
      id: 1,
      tag: "#Suggestion",
      tagColor: "text-green-400",
      time: "7 hours ago",
      comments: 155,
      title: "Do you guys have any tips on how to wake up early? like at 9-10 Am ?",
      content: "As the title says",
      author: "SGNK-43_xD",
    },
    {
      id: 2,
      tag: "#Recommendation",
      tagColor: "text-yellow-400",
      time: "2 days ago",
      comments: 80,
      title: "YOU NEED TO WATCH THEM BEFORE YOU DIE!!! Greatest Anime of All Time",
      content: "Categories: Romance: Clannad Action: Attack On Titan Adventure: One Piece...",
      author: "AnimeLover_99",
    },
    {
      id: 3,
      tag: "#Discussion",
      tagColor: "text-blue-400",
      time: "5 hours ago",
      comments: 245,
      title: "What anime got you into watching anime?",
      content: "For me it was Death Note back in 2008...",
      author: "OtakuMaster",
    },
  ];

  const featuredAnime = [
    { id: 1, title: "Solo Leveling", score: 8.9, type: "TV" },
    { id: 2, title: "Frieren", score: 9.1, type: "TV" },
    { id: 3, title: "Blue Lock", score: 8.4, type: "TV" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBgIndex}
            className={`absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l ${bgGradients[currentBgIndex]} opacity-30 blur-3xl`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 0.3, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 2 }}
          />
        </AnimatePresence>
        <motion.div 
          className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header Navigation */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-black">
                <span className="text-foreground">Anime</span>
                <span className="text-primary">Finder</span>
              </span>
            </motion.div>

            {/* Nav Tabs */}
            <div className="hidden md:flex items-center gap-6">
              {navTabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
                >
                  {tab.label}
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                  />
                </motion.button>
              ))}
            </div>
            
            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                  whileHover={{ scale: 1.05, borderColor: 'hsl(262 83% 58% / 0.5)' }}
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">
                    {user.email?.split("@")[0]}
                  </span>
                </motion.div>
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
                  className="bg-gradient-to-r from-primary to-accent text-white rounded-full px-6"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        style={{ scale: heroScale, y: heroY }}
        className="relative min-h-[75vh] flex items-center overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-20">
          <motion.div 
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo */}
            <motion.div 
              variants={itemVariants}
              className="mb-8"
            >
              <motion.h1
                className="text-6xl md:text-7xl font-black"
                animate={{
                  y: [-5, 5, -5],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.span 
                  className="text-foreground inline-block"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  h!
                </motion.span>
                <motion.span 
                  className="text-gradient-primary inline-block"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  anime
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-muted-foreground mt-2"
                variants={itemVariants}
              >
                Your ultimate destination for anime discovery
              </motion.p>
            </motion.div>

            {/* Search Box */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="mb-6"
            >
              <motion.div 
                className="flex gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex-1 relative group">
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsTyping(true);
                    }}
                    onBlur={() => setIsTyping(false)}
                    placeholder="Search anime..."
                    className="h-14 pl-6 pr-4 bg-card/50 border-white/10 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <motion.div 
                    className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.2), hsl(338 90% 56% / 0.2))',
                    }}
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    type="submit"
                    className="h-14 w-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            {/* Top Searches */}
            <motion.div variants={itemVariants} className="mb-8">
              <p className="text-sm text-muted-foreground mb-3">
                <span className="text-primary font-semibold">🔥 Trending:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {topSearches.map((search, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05, type: 'spring' }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchQuery(search);
                      navigate(`/explore?q=${encodeURIComponent(search)}`);
                    }}
                    className="px-3 py-1.5 rounded-full text-sm bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-white/5 hover:border-primary/30 transition-all"
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/explore')}
                  className="h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-full text-lg font-bold group relative overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '100%', opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <Play className="w-5 h-5 mr-2" fill="white" />
                  Watch anime
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/wheel')}
                  variant="outline"
                  className="h-14 px-8 border-white/10 rounded-full text-lg font-bold hover:bg-white/5"
                >
                  🎲 Random Pick
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Featured Cards */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
          {featuredAnime.map((anime, index) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, x: 100, rotate: 10 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                rotate: index * 5 - 5,
                y: index * 20,
              }}
              transition={{ delay: 0.8 + index * 0.2, type: 'spring' }}
              whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}
              className="absolute w-48 h-64 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 backdrop-blur-sm p-4 cursor-pointer"
              style={{ 
                right: index * 30, 
                top: index * 40,
                transformOrigin: 'center center',
              }}
              onClick={() => navigate('/explore')}
            >
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                <span className="text-sm font-bold text-foreground">{anime.score}</span>
              </div>
              <p className="text-xs text-muted-foreground">{anime.type}</p>
              <p className="text-sm font-bold text-foreground mt-auto">{anime.title}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Content Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 50 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Share Section */}
              <motion.div 
                className="glass rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-colors"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-2xl">🎌</span>
                  </motion.div>
                  <div>
                    <p className="font-bold text-foreground">Share HIANIME</p>
                    <p className="text-sm text-muted-foreground">to your friends</p>
                  </div>
                  <motion.span 
                    className="text-muted-foreground ml-auto text-lg font-bold"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    520k
                  </motion.span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Telegram', 'X', 'Facebook', 'Discord'].map((platform, i) => (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/10 hover:bg-primary/10 hover:border-primary/30"
                      >
                        Share
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* About Content */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-foreground">
                  HiAnimes.cz - The best site to watch anime online for Free
                </h2>
                <motion.p 
                  className="text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Do you know that according to Google, the monthly search volume for anime related topics is up to 
                  over 1 Billion times? Anime is famous worldwide and it is no wonder we've seen a sharp rise in the 
                  number of free anime streaming sites.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-6 border border-primary/20"
                >
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="text-2xl">✨</span> What is HiAnime.cz?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    HiAnime.cz is a free site to watch anime and you can even download subbed or dubbed anime in 
                    ultra HD quality without any registration or payment.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-xl p-6 border border-green-500/20"
                >
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="text-2xl">🛡️</span> Is HiAnimes.cz safe?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Yes we are! We keep scanning our platform 24/7 to make sure everything is clean and safe for 
                    all anime fans worldwide.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Trending Posts */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 50 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Trending Posts
              </h2>
              
              {trendingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${post.tagColor}`}>{post.tag}</span>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                      💬 {post.comments}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-accent/50"
                      whileHover={{ scale: 1.2 }}
                    />
                    <span className="text-xs text-muted-foreground">{post.author}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl border-white/10 hover:bg-white/5"
                >
                  View All Posts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t border-white/10 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <motion.p
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
          >
            © 2026 Anime Finder. All rights reserved.
          </motion.p>
        </div>
      </motion.footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Landing;
