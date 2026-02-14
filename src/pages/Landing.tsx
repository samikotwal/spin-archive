import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Film, Tv, TrendingUp, Flame, ArrowRight, User, LogOut, Sparkles, Play, Disc3, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingParticles from '@/components/FloatingParticles';
import HeroBackground from '@/components/HeroBackground';
import { AuthModal } from '@/components/AuthModal';
import GenrePicker from '@/components/GenrePicker';
import NotificationBell from '@/components/NotificationBell';
import SearchSuggestions from '@/components/SearchSuggestions';
import { useLenis } from '@/hooks/useLenis';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Landing = () => {
  useLenis();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const { user, signOut } = useAuth();
  const { scrollY } = useScroll();
  
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 300], [0, 50]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully!");
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    switch(tabId) {
      case 'home':
        navigate('/');
        break;
      case 'movies':
        navigate('/explore?type=movie');
        break;
      case 'tv':
        navigate('/explore?type=tv');
        break;
      case 'popular':
        navigate('/explore?sort=popular');
        break;
      case 'airing':
        navigate('/explore?status=airing');
        break;
    }
  };

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Series', icon: Tv },
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'airing', label: 'Top Airing', icon: Flame },
  ];

  const features = [
    {
      id: 'search',
      icon: Search,
      title: 'Smart Search',
      description: 'Find any anime instantly with our powerful search',
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/explore'),
    },
    {
      id: 'movies',
      icon: Film,
      title: 'Movies & Series',
      description: 'Browse through thousands of anime movies and series',
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/explore?type=movie'),
    },
    {
      id: 'trending',
      icon: TrendingUp,
      title: 'Trending Now',
      description: 'Discover what everyone is watching right now',
      color: 'from-orange-500 to-red-500',
      action: () => navigate('/explore?sort=popular'),
    },
    {
      id: 'wheel',
      icon: Disc3,
      title: 'Random Picker',
      description: "Can't decide? Let the wheel choose for you!",
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/wheel'),
    },
    {
      id: 'favorites',
      icon: Heart,
      title: 'My Favorites',
      description: 'Save and organize your favorite anime',
      color: 'from-red-500 to-pink-500',
      action: () => user ? navigate('/favorites') : setShowAuthModal(true),
    },
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
    <div className="min-h-screen bg-background overflow-x-hidden pb-16 md:pb-0">
      <FloatingParticles />

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
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
              <span className="text-xl font-black">
                <span className="text-foreground">NERO</span>
                <span className="text-gradient-primary">FINDER</span>
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
                  onClick={() => handleNavClick(tab.id)}
                  className={`text-sm font-medium relative group flex items-center gap-1.5 transition-colors ${
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <motion.span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      activeTab === tab.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            
            {/* Auth & Actions */}
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => user ? navigate('/favorites') : setShowAuthModal(true)}
                  className="text-muted-foreground hover:text-accent"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Notifications */}
              <NotificationBell />

              {/* Genre Picker */}
              <GenrePicker />

              {user ? (
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-white/10"
                    whileHover={{ scale: 1.05, borderColor: 'hsl(262 83% 58% / 0.5)' }}
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground hidden sm:inline">
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
        </div>
      </motion.header>

      {/* Hero Section with Background */}
      <motion.section 
        style={{ scale: heroScale, y: heroY }}
        className="relative min-h-[85vh] flex items-center overflow-hidden"
      >
        <HeroBackground />
        
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
                className="text-5xl sm:text-6xl md:text-7xl font-black"
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
                  NERO
                </motion.span>
                <motion.span 
                  className="text-gradient-primary inline-block ml-2"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  FINDER
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-muted-foreground mt-2 text-lg"
                variants={itemVariants}
              >
                Your ultimate destination for anime discovery
              </motion.p>
            </motion.div>

            {/* Search Box with Autocomplete */}
            <motion.div variants={itemVariants} className="mb-6">
              <SearchSuggestions onSearch={(q) => navigate(`/explore?q=${encodeURIComponent(q)}`)} />
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
                  Explore Anime
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
                  <Disc3 className="w-5 h-5 mr-2" />
                  Random Pick
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
              Discover Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Everything you need to find your next favorite anime
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={feature.action}
                className="glass rounded-xl p-4 border border-white/5 hover:border-primary/30 cursor-pointer group relative overflow-hidden"
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                
                <motion.div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 relative z-10`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </motion.div>
                
                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs relative z-10 line-clamp-2">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-10 border border-white/5"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '50K+', label: 'Anime Titles', icon: '🎬' },
                { value: '1M+', label: 'Episodes', icon: '📺' },
                { value: '10K+', label: 'Daily Users', icon: '👥' },
                { value: '4.9', label: 'User Rating', icon: '⭐' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.span
                    className="text-3xl block mb-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {stat.icon}
                  </motion.span>
                  <motion.p
                    className="text-2xl md:text-3xl font-black text-gradient-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">NERO FINDER</span>
          </div>
          <p className="text-sm">
            © 2026 NERO FINDER. All rights reserved.
          </p>
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
