import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Disc3, FolderHeart, Sparkles, TrendingUp, ListChecks, Clock, Target, ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingParticles from '@/components/FloatingParticles';
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';
import { supabase } from '@/integrations/supabase/client';

interface RecentSpin {
  id: string;
  value: string;
  deleted_at: string;
}

const Dashboard = () => {
  useLenis();
  const navigate = useNavigate();
  const { wheelItems, lists, displayItems, isLoading } = useWheelData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentSpins, setRecentSpins] = useState<RecentSpin[]>([]);
  const [totalRemoved, setTotalRemoved] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch recent spin history (deleted items = removed from wheel)
  useEffect(() => {
    const fetchRecent = async () => {
      const { data, error } = await supabase
        .from('deleted_items')
        .select('*')
        .order('deleted_at', { ascending: false })
        .limit(10);
      if (!error && data) setRecentSpins(data);

      // Count total removed
      const { count } = await supabase
        .from('wheel_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', true);
      setTotalRemoved(count || 0);
    };
    fetchRecent();
  }, []);

  const stats = [
    { label: 'Wheel Items', value: wheelItems.length, icon: Target, color: 'from-primary to-accent', desc: 'Currently on wheel' },
    { label: 'Saved Lists', value: lists.length, icon: FolderHeart, color: 'from-emerald-500 to-teal-500', desc: 'Lists created' },
    { label: 'Total Removed', value: totalRemoved, icon: Disc3, color: 'from-purple-500 to-pink-500', desc: 'Items spun & removed' },
    { label: 'Win Rate', value: totalRemoved > 0 ? `${Math.round((totalRemoved / (totalRemoved + wheelItems.length)) * 100)}%` : '0%', icon: BarChart3, color: 'from-amber-500 to-orange-500', desc: 'Removal ratio' },
  ];

  const quickActions = [
    { label: 'Spin the Wheel', icon: Disc3, path: '/wheel', color: 'from-primary to-accent', desc: 'Try your luck!' },
    { label: 'Saved Lists', icon: FolderHeart, path: '/saved', color: 'from-emerald-500 to-teal-500', desc: 'View saved items' },
    { label: 'Explore Anime', icon: Sparkles, path: '/', color: 'from-purple-500 to-pink-500', desc: 'Discover new anime' },
  ];

  // Simple bar chart data
  const chartData = [
    { label: 'On Wheel', value: wheelItems.length, color: 'bg-primary' },
    { label: 'Removed', value: totalRemoved, color: 'bg-accent' },
    { label: 'Lists', value: lists.length, color: 'bg-emerald-500' },
  ];
  const maxChartVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />

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
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-border/10 relative overflow-hidden"
        >
          <motion.div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">Welcome back! 👋</h2>
          <p className="text-muted-foreground mb-4">Ready to spin the wheel and discover something new?</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => navigate('/wheel')} className="bg-gradient-to-r from-primary to-accent text-white rounded-full px-6">
              <Disc3 className="w-4 h-4 mr-2" /> Go to Wheel <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-4 md:p-5 border border-border/10 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <motion.p
                className="text-2xl md:text-3xl font-black text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: index * 0.08 + 0.2 }}
              >
                {isLoading ? '...' : stat.value}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Quick Actions + Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.path)}
                    className="glass rounded-2xl p-4 border border-border/10 hover:border-primary/30 cursor-pointer group relative overflow-hidden"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{action.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/20 absolute bottom-3 right-3 group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-5 border border-border/10"
            >
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Overview
              </h3>
              <div className="space-y-3">
                {chartData.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 shrink-0">{item.label}</span>
                    <div className="flex-1 h-8 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max((item.value / maxChartVal) * 100, 4)}%` }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                        className={`h-full ${item.color} rounded-full flex items-center justify-end pr-3`}
                      >
                        <span className="text-xs font-bold text-white">{item.value}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Current Wheel Preview */}
            {displayItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass rounded-2xl p-5 border border-border/10"
              >
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Current Wheel Items
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {displayItems.slice(0, 8).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-8 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs">🎯</div>
                      )}
                      <span className="text-xs text-foreground truncate font-medium">{item.name}</span>
                    </motion.div>
                  ))}
                  {displayItems.length > 8 && (
                    <div className="flex items-center justify-center p-2 rounded-xl bg-secondary/10">
                      <span className="text-xs text-muted-foreground">+{displayItems.length - 8} more</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Recent Spin History */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Recent Spins
            </h3>
            <div className="glass rounded-2xl p-4 border border-border/10 space-y-2">
              {recentSpins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Disc3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No spins yet!</p>
                  <p className="text-xs mt-1">Spin the wheel to see history here</p>
                </div>
              ) : (
                recentSpins.map((spin, index) => (
                  <motion.div
                    key={spin.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-xs">🏆</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{spin.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(spin.deleted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
