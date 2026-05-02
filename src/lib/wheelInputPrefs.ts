// Persisted UI preferences for the WheelInput component.
import type { SplitMode } from './parseEntries';

const DRIP_KEY = 'wheel.dripSpeedMs';
const SPLIT_KEY = 'wheel.splitMode';

export const DRIP_PRESETS = [
  { label: 'Instant', value: 0 },
  { label: 'Fast', value: 70 },
  { label: 'Normal', value: 140 },
  { label: 'Slow', value: 280 },
  { label: 'Cinematic', value: 500 },
];

export function getDripSpeed(): number {
  if (typeof window === 'undefined') return 140;
  const raw = window.localStorage.getItem(DRIP_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= 2000 ? n : 140;
}

export function setDripSpeed(ms: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRIP_KEY, String(ms));
}

export function getSplitMode(): SplitMode {
  if (typeof window === 'undefined') return 'smart';
  return window.localStorage.getItem(SPLIT_KEY) === 'lines' ? 'lines' : 'smart';
}

export function setSplitMode(mode: SplitMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SPLIT_KEY, mode);
}
