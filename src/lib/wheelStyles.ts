export interface WheelStyle {
  id: string;
  name: string;
  emoji: string;
  palette: string[];
  hub: 'classic' | 'ring' | 'dot' | 'star' | 'gem';
  pointer: 'flame' | 'arrow' | 'diamond' | 'chevron' | 'blade';
  pointerColors: [string, string]; // gradient stops
  tickColor: string;
  bg?: string; // optional slice background gradient id shortcut
  glow: string; // outer glow color
  textColor?: string;
}

export const WHEEL_STYLES: WheelStyle[] = [
  { id: 'classic',    name: 'Classic',        emoji: '🎡', palette: ['#6366f1','#f43f5e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4'], hub: 'classic', pointer: 'flame',   pointerColors: ['#FBBC04','#E65100'], tickColor: 'rgba(255,255,255,0.5)', glow: '#6366f1' },
  { id: 'sunset',     name: 'Sunset',         emoji: '🌅', palette: ['#ff6b6b','#ffa94d','#ffd43b','#ff8787','#f06595','#e64980','#fd7e14','#f76707'], hub: 'ring',    pointer: 'arrow',   pointerColors: ['#fff3bf','#e64980'], tickColor: 'rgba(255,255,255,0.6)', glow: '#f06595' },
  { id: 'ocean',      name: 'Ocean',          emoji: '🌊', palette: ['#0ea5e9','#0284c7','#0369a1','#075985','#38bdf8','#7dd3fc','#22d3ee','#06b6d4'], hub: 'dot',     pointer: 'diamond', pointerColors: ['#e0f2fe','#0284c7'], tickColor: 'rgba(255,255,255,0.7)', glow: '#0ea5e9' },
  { id: 'forest',     name: 'Forest',         emoji: '🌲', palette: ['#166534','#15803d','#16a34a','#22c55e','#4ade80','#86efac','#65a30d','#a3e635'], hub: 'classic', pointer: 'chevron', pointerColors: ['#bbf7d0','#166534'], tickColor: 'rgba(255,255,255,0.5)', glow: '#16a34a' },
  { id: 'candy',      name: 'Candy',          emoji: '🍬', palette: ['#f472b6','#fb7185','#fda4af','#fbcfe8','#c4b5fd','#a78bfa','#f9a8d4','#fca5a5'], hub: 'gem',     pointer: 'flame',   pointerColors: ['#fef3c7','#f472b6'], tickColor: 'rgba(255,255,255,0.7)', glow: '#f472b6' },
  { id: 'neon',       name: 'Neon City',      emoji: '💫', palette: ['#f0abfc','#22d3ee','#a3e635','#facc15','#fb7185','#c084fc','#34d399','#38bdf8'], hub: 'star',    pointer: 'blade',   pointerColors: ['#f0abfc','#7c3aed'], tickColor: 'rgba(255,255,255,0.9)', glow: '#a855f7' },
  { id: 'monochrome', name: 'Monochrome',     emoji: '⚫', palette: ['#0f172a','#1e293b','#334155','#475569','#64748b','#94a3b8','#cbd5e1','#e2e8f0'], hub: 'ring',    pointer: 'arrow',   pointerColors: ['#f1f5f9','#0f172a'], tickColor: 'rgba(255,255,255,0.4)', glow: '#64748b' },
  { id: 'gold',       name: 'Royal Gold',     emoji: '👑', palette: ['#78350f','#92400e','#b45309','#d97706','#f59e0b','#fbbf24','#fcd34d','#fde68a'], hub: 'gem',     pointer: 'diamond', pointerColors: ['#fef3c7','#78350f'], tickColor: 'rgba(255,255,255,0.6)', glow: '#f59e0b' },
  { id: 'galaxy',     name: 'Galaxy',         emoji: '🌌', palette: ['#1e1b4b','#312e81','#4c1d95','#6d28d9','#7c3aed','#a78bfa','#c4b5fd','#818cf8'], hub: 'star',    pointer: 'diamond', pointerColors: ['#e9d5ff','#4c1d95'], tickColor: 'rgba(255,255,255,0.8)', glow: '#7c3aed' },
  { id: 'cherry',     name: 'Cherry Blossom', emoji: '🌸', palette: ['#fecdd3','#fda4af','#f9a8d4','#f472b6','#ec4899','#db2777','#be185d','#9d174d'], hub: 'ring',    pointer: 'flame',   pointerColors: ['#fce7f3','#9d174d'], tickColor: 'rgba(255,255,255,0.7)', glow: '#ec4899' },
  { id: 'emerald',    name: 'Emerald',        emoji: '💚', palette: ['#064e3b','#065f46','#047857','#059669','#10b981','#34d399','#6ee7b7','#a7f3d0'], hub: 'gem',     pointer: 'chevron', pointerColors: ['#a7f3d0','#064e3b'], tickColor: 'rgba(255,255,255,0.6)', glow: '#10b981' },
  { id: 'crimson',    name: 'Crimson',        emoji: '🔥', palette: ['#450a0a','#7f1d1d','#991b1b','#b91c1c','#dc2626','#ef4444','#f87171','#fca5a5'], hub: 'classic', pointer: 'flame',   pointerColors: ['#fecaca','#7f1d1d'], tickColor: 'rgba(255,255,255,0.6)', glow: '#dc2626' },
  { id: 'mint',       name: 'Mint Fresh',     emoji: '🌿', palette: ['#ccfbf1','#99f6e4','#5eead4','#2dd4bf','#14b8a6','#0d9488','#0f766e','#115e59'], hub: 'dot',     pointer: 'arrow',   pointerColors: ['#ccfbf1','#0f766e'], tickColor: 'rgba(255,255,255,0.7)', glow: '#14b8a6' },
  { id: 'lavender',   name: 'Lavender',       emoji: '💜', palette: ['#ede9fe','#ddd6fe','#c4b5fd','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6'], hub: 'gem',     pointer: 'diamond', pointerColors: ['#ede9fe','#5b21b6'], tickColor: 'rgba(255,255,255,0.7)', glow: '#8b5cf6' },
  { id: 'retro',      name: 'Retro 70s',      emoji: '📻', palette: ['#a16207','#ca8a04','#eab308','#84cc16','#65a30d','#ea580c','#c2410c','#9a3412'], hub: 'classic', pointer: 'chevron', pointerColors: ['#fef08a','#9a3412'], tickColor: 'rgba(255,255,255,0.5)', glow: '#ea580c' },
  { id: 'arcade',     name: 'Arcade',         emoji: '🕹️', palette: ['#ff006e','#fb5607','#ffbe0b','#8338ec','#3a86ff','#06d6a0','#ef476f','#ffd166'], hub: 'star',    pointer: 'blade',   pointerColors: ['#ffbe0b','#ff006e'], tickColor: 'rgba(255,255,255,0.9)', glow: '#ff006e' },
  { id: 'nordic',     name: 'Nordic',         emoji: '❄️', palette: ['#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9','#94a3b8','#cbd5e1','#e2e8f0'], hub: 'ring',    pointer: 'arrow',   pointerColors: ['#f0f9ff','#0369a1'], tickColor: 'rgba(30,41,59,0.4)', glow: '#38bdf8', textColor: '#0f172a' },
  { id: 'jungle',     name: 'Jungle',         emoji: '🐆', palette: ['#365314','#4d7c0f','#65a30d','#84cc16','#a3e635','#166534','#15803d','#22c55e'], hub: 'classic', pointer: 'chevron', pointerColors: ['#d9f99d','#365314'], tickColor: 'rgba(255,255,255,0.5)', glow: '#65a30d' },
  { id: 'peach',      name: 'Peach',          emoji: '🍑', palette: ['#fed7aa','#fdba74','#fb923c','#f97316','#ea580c','#fca5a5','#f9a8d4','#fbcfe8'], hub: 'ring',    pointer: 'flame',   pointerColors: ['#ffedd5','#c2410c'], tickColor: 'rgba(255,255,255,0.7)', glow: '#fb923c' },
  { id: 'midnight',   name: 'Midnight',       emoji: '🌙', palette: ['#020617','#0f172a','#1e293b','#312e81','#3730a3','#4338ca','#4f46e5','#6366f1'], hub: 'star',    pointer: 'diamond', pointerColors: ['#c7d2fe','#312e81'], tickColor: 'rgba(255,255,255,0.7)', glow: '#4f46e5' },
];

const KEY = 'wheelStyleId';
export const getSavedStyleId = (): string => {
  try { return localStorage.getItem(KEY) || 'classic'; } catch { return 'classic'; }
};
export const setSavedStyleId = (id: string) => {
  try { localStorage.setItem(KEY, id); } catch {}
};
export const getStyleById = (id: string): WheelStyle =>
  WHEEL_STYLES.find(s => s.id === id) || WHEEL_STYLES[0];
