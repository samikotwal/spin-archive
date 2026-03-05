import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Disc3, FolderHeart, Sparkles, TrendingUp, ListChecks, Clock, Target, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingParticles from '@/components/FloatingParticles';
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';

const Dashboard = () => {
  useLenis();
  const navigate = useNavigate();
  const { wheelItems, lists, isLoading } = useWheelData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Wheel Items', value: wheelItems.length, icon: Target, color: 'from-primary to-accent', desc: 'Items in your wheel' },
    { label: 'Saved Lists', value: lists.length, icon: FolderHeart, color: 'from-green-500 to-emerald-500', desc: 'Lists you created' },
    { label: 'Total Spins', value: '∞', icon: Disc3, color: 'from-purple-500 to-pink-500', desc: 'Unlimited spins!' },
  ];

  const quickActions = [
    { label: 'Spin the Wheel', icon: Disc3, path: '/wheel', color: 'from-primary to-accent', desc: 'Try your luck!' },
    { label: 'View Saved Lists', icon: FolderHeart, path: '/saved', color: 'from-green-500 to-emerald-500', desc: 'See your saved items' },
    { label: 'Explore Anime', icon: Sparkles, path: '/', color: 'from-purple-500 to-pink-500', desc: 'Discover new anime' },
  ];

  const recentActivity = [
    { action: 'Wheel has', detail: `${wheelItems.length} items ready to spin`, time: 'Now', icon: Target },
    { action: 'You have', detail: `${lists.length} saved lists`, time: 'Active', icon: ListChecks },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="glass sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/wheel')} className="text-muted-foreground hover:text-foreground">
              <Disc3 className="w-4 h-4 mr-2" /> Wheel
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
              <Sparkles className="w-4 h-4 mr-2" /> Home
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-white/5 relative overflow-hidden"
        >
          <motion.div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">Welcome back! 👋</h2>
          <p className="text-muted-foreground mb-4">Ready to spin the wheel and discover something new?</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => navigate('/wheel')} className="bg-gradient-to-r from-primary to-accent text-white rounded-full px-6">
              <Disc3 className="w-4 h-4 mr-2" /> Go to Wheel
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass rounded-2xl p-6 border border-white/5 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                  <BarChart3 className="w-5 h-5 text-muted-foreground/30" />
                </motion.div>
              </div>
              <motion.p
                className="text-3xl font-black text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: index * 0.1 + 0.3 }}
              >
                {isLoading ? '...' : stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(action.path)}
                  className="glass rounded-2xl p-5 border border-white/5 hover:border-primary/30 cursor-pointer group relative overflow-hidden"
                >
                  <motion.div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{action.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 absolute bottom-4 right-4 group-hover:text-primary transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Activity
            </h3>
            <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
              {recentActivity.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/60 shrink-0">{item.time}</span>
                </motion.div>
              ))}

              {wheelItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-3 border-t border-white/5"
                >
                  <p className="text-xs text-muted-foreground mb-2">Current wheel items:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {wheelItems.slice(0, 8).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{item}</span>
                    ))}
                    {wheelItems.length > 8 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">+{wheelItems.length - 8} more</span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
