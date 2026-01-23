import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AiringAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  episodes: number | null;
  status: string;
  airing?: boolean;
  broadcast?: {
    day: string;
    time: string;
    timezone: string;
  };
}

interface WatchlistItem {
  mal_id: number;
  title: string;
  image_url: string;
  lastEpisode: number;
  addedAt: string;
}

interface Notification {
  id: string;
  mal_id: number;
  title: string;
  message: string;
  episode?: number;
  image_url: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'nero_watchlist';
const NOTIFICATIONS_KEY = 'nero_notifications';
const LAST_CHECK_KEY = 'nero_last_episode_check';

export const useAiringNotifications = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [airingSchedule, setAiringSchedule] = useState<AiringAnime[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem(STORAGE_KEY);
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
    
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save watchlist to localStorage
  const saveWatchlist = useCallback((items: WatchlistItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setWatchlist(items);
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((items: Notification[]) => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
    setNotifications(items);
  }, []);

  // Add to watchlist
  const addToWatchlist = useCallback((anime: {
    mal_id: number;
    title: string;
    image_url: string;
    currentEpisode?: number;
  }) => {
    const exists = watchlist.find(item => item.mal_id === anime.mal_id);
    if (exists) {
      toast.info(`${anime.title} is already in your watchlist`);
      return false;
    }

    const newItem: WatchlistItem = {
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.image_url,
      lastEpisode: anime.currentEpisode || 0,
      addedAt: new Date().toISOString(),
    };

    saveWatchlist([...watchlist, newItem]);
    toast.success(`Added ${anime.title} to watchlist! You'll be notified of new episodes.`);
    return true;
  }, [watchlist, saveWatchlist]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback((mal_id: number) => {
    const item = watchlist.find(w => w.mal_id === mal_id);
    saveWatchlist(watchlist.filter(w => w.mal_id !== mal_id));
    if (item) {
      toast.success(`Removed ${item.title} from watchlist`);
    }
  }, [watchlist, saveWatchlist]);

  // Check if in watchlist
  const isInWatchlist = useCallback((mal_id: number) => {
    return watchlist.some(item => item.mal_id === mal_id);
  }, [watchlist]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.mal_id}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
    saveNotifications(updated);

    // Show toast notification
    toast.success(notification.message, {
      description: notification.title,
      duration: 5000,
    });
  }, [notifications, saveNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch airing schedule
  const fetchAiringSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
      const response = await fetch('https://api.jikan.moe/v4/schedules?filter=monday,tuesday,wednesday,thursday,friday,saturday,sunday&limit=24');
      const json = await response.json();
      setAiringSchedule(json.data || []);
    } catch (error) {
      console.error('Error fetching airing schedule:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for new episodes in watchlist
  const checkForNewEpisodes = useCallback(async () => {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const now = Date.now();
    
    // Only check every 30 minutes
    if (lastCheck && now - parseInt(lastCheck) < 30 * 60 * 1000) {
      return;
    }

    localStorage.setItem(LAST_CHECK_KEY, now.toString());

    for (const item of watchlist) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
        const response = await fetch(`https://api.jikan.moe/v4/anime/${item.mal_id}`);
        const json = await response.json();
        const anime = json.data;

        if (anime?.episodes && anime.episodes > item.lastEpisode) {
          // New episode available!
          addNotification({
            mal_id: item.mal_id,
            title: item.title,
            message: `Episode ${anime.episodes} is now available!`,
            episode: anime.episodes,
            image_url: item.image_url,
          });

          // Update last episode in watchlist
          const updatedWatchlist = watchlist.map(w =>
            w.mal_id === item.mal_id ? { ...w, lastEpisode: anime.episodes } : w
          );
          saveWatchlist(updatedWatchlist);
        }
      } catch (error) {
        console.error(`Error checking ${item.title}:`, error);
      }
    }
  }, [watchlist, addNotification, saveWatchlist]);

  // Initial check
  useEffect(() => {
    if (watchlist.length > 0) {
      checkForNewEpisodes();
    }
  }, [watchlist.length]);

  return {
    watchlist,
    notifications,
    airingSchedule,
    isLoading,
    unreadCount,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    fetchAiringSchedule,
    checkForNewEpisodes,
  };
};
