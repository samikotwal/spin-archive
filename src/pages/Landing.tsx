import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Film, Tv, TrendingUp, Flame, Dices, Play, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingParticles from '@/components/FloatingParticles';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Search Anime',
      description: 'Find your favorite anime with our powerful search engine',
    },
    {
      icon: Film,
      title: 'Movies & Series',
      description: 'Explore thousands of anime movies and TV series',
    },
    {
      icon: TrendingUp,
      title: 'Trending Now',
      description: 'Stay updated with the most popular anime',
    },
    {
      icon: Dices,
      title: 'Random Picker',
      description: 'Can\'t decide? Spin the wheel to pick your next watch',
    },
  ];

  const categories = [
    { name: 'Action', color: 'from-red-500 to-orange-500' },
    { name: 'Romance', color: 'from-pink-500 to-rose-500' },
    { name: 'Comedy', color: 'from-yellow-500 to-amber-500' },
    { name: 'Fantasy', color: 'from-purple-500 to-violet-500' },
    { name: 'Horror', color: 'from-gray-700 to-gray-900' },
    { name: 'Sci-Fi', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.3),transparent)]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Your Ultimate Anime Destination</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
              <span className="text-gradient-primary">Anime</span>
              <br />
              <span className="text-foreground">Finder</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Discover, explore, and track your favorite anime. Your journey to the anime universe starts here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => navigate('/explore')}
                  className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-6 text-lg rounded-full glow-primary"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Exploring
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/wheel')}
                  className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                >
                  <Dices className="w-5 h-5 mr-2" />
                  Try Spin Wheel
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
            >
              <div className="w-1.5 h-3 rounded-full bg-primary" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful features to enhance your anime discovery experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass rounded-2xl p-6 border border-white/10 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Browse by Genre
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Explore anime across different genres and find your next favorite
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/explore')}
                className={`
                  aspect-square rounded-2xl bg-gradient-to-br ${category.color} 
                  flex items-center justify-center cursor-pointer
                  shadow-lg hover:shadow-2xl transition-all
                `}
              >
                <span className="text-white font-bold text-lg">{category.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { value: '10K+', label: 'Anime Titles' },
                { value: '50K+', label: 'Active Users' },
                { value: '1M+', label: 'Recommendations' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-6xl font-black text-gradient-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Star className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Dive In?
            </h2>
            <p className="text-muted-foreground text-xl mb-10">
              Join thousands of anime fans and start discovering amazing anime today.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate('/explore')}
                className="bg-gradient-to-r from-primary to-accent text-white font-bold px-10 py-6 text-lg rounded-full glow-primary"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Anime Finder</span>
          </div>
          <p>© 2026 Anime Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
