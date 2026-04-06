import { useCallback, useRef, useState } from 'react';

export const useSoundEffects = () => {
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<number | null>(null);

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  };

  const playTick = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800 + Math.random() * 400;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }, [muted]);

  const startTicking = useCallback((durationMs: number) => {
    if (muted) return;
    let interval = 50;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) {
        if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
        return;
      }
      playTick();
      // Slow down ticking as we approach the end
      const progress = elapsed / durationMs;
      interval = 50 + progress * 300;
      tickIntervalRef.current = window.setTimeout(tick, interval);
    };
    tick();
  }, [muted, playTick]);

  const stopTicking = useCallback(() => {
    if (tickIntervalRef.current) {
      clearTimeout(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const playWinnerSound = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {}
  }, [muted]);

  return { muted, setMuted, playTick, startTicking, stopTicking, playWinnerSound };
};
