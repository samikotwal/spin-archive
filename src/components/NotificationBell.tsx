import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiringNotifications } from '@/hooks/useAiringNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useAiringNotifications();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    navigate(`/anime/${notification.mal_id}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 sm:w-96 glass rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      {unreadCount} new
                    </Badge>
                  )}
                </h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs mt-1">Follow anime to get notified of new episodes</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all mb-2 ${
                          notification.read
                            ? 'bg-secondary/30 hover:bg-secondary/50'
                            : 'bg-primary/10 hover:bg-primary/20 border border-primary/20'
                        }`}
                      >
                        <img
                          src={notification.image_url}
                          alt=""
                          className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-primary text-sm font-semibold">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="w-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
