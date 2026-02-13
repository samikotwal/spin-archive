import { motion } from 'framer-motion';
import { Home, Compass, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'explore', label: 'Explore', icon: Compass, path: '/explore' },
    { id: 'favorites', label: 'Favorites', icon: Heart, path: '/favorites' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleClick = (path: string) => {
    if (path === '/favorites' && !user) {
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-white/10"
    >
      <div className="flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleClick(tab.path)}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <motion.div
                animate={active ? { scale: 1.2 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <tab.icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} />
              </motion.div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
