import { useState, useEffect, useCallback } from 'react';

export type EpisodeStatus = 'unwatched' | 'watching' | 'watched';

interface EpisodeProgress {
  [episodeNumber: number]: EpisodeStatus;
}

interface AnimeProgress {
  [animeId: number]: EpisodeProgress;
}

const STORAGE_KEY = 'nero_finder_episode_progress';

export const useEpisodeProgress = (animeId: number) => {
  const [progress, setProgress] = useState<EpisodeProgress>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allProgress: AnimeProgress = JSON.parse(stored);
        setProgress(allProgress[animeId] || {});
      }
    } catch (error) {
      console.error('Error loading episode progress:', error);
    }
  }, [animeId]);

  const updateEpisodeStatus = useCallback((episodeNumber: number, status: EpisodeStatus) => {
    setProgress(prev => {
      const newProgress = { ...prev, [episodeNumber]: status };
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allProgress: AnimeProgress = stored ? JSON.parse(stored) : {};
        allProgress[animeId] = newProgress;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      } catch (error) {
        console.error('Error saving episode progress:', error);
      }
      
      return newProgress;
    });
  }, [animeId]);

  const getEpisodeStatus = useCallback((episodeNumber: number): EpisodeStatus => {
    return progress[episodeNumber] || 'unwatched';
  }, [progress]);

  const cycleStatus = useCallback((episodeNumber: number) => {
    const currentStatus = getEpisodeStatus(episodeNumber);
    const nextStatus: EpisodeStatus = 
      currentStatus === 'unwatched' ? 'watching' :
      currentStatus === 'watching' ? 'watched' : 'unwatched';
    updateEpisodeStatus(episodeNumber, nextStatus);
  }, [getEpisodeStatus, updateEpisodeStatus]);

  const getWatchedCount = useCallback(() => {
    return Object.values(progress).filter(status => status === 'watched').length;
  }, [progress]);

  return {
    progress,
    getEpisodeStatus,
    updateEpisodeStatus,
    cycleStatus,
    getWatchedCount,
  };
};
