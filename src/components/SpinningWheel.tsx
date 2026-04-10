import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SpinningWheelProps {
  items: string[];
  onSpinEnd: (selectedItem: string, index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  onSpinStart?: () => void;
  imageMap?: Record<string, { image: string | null; title: string | null }>;
}

const WHEEL_COLORS = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01',
  '#46BDC6', '#7B1FA2', '#E91E63', '#00ACC1', '#FF7043',
  '#8BC34A', '#9C27B0', '#00BCD4', '#FF5722',
];

const SpinningWheel = ({ items, onSpinEnd, isSpinning, setIsSpinning, onSpinStart, imageMap = {} }: SpinningWheelProps) => {
  const [rotation, setRotation] = useState(0);

  const spinWheel = useCallback(() => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    onSpinStart?.();
    const spins = 5 + Math.random() * 5;
    const randomOffset = Math.random() * 360;
    const total = rotation + spins * 360 + randomOffset;
    setRotation(total);

    setTimeout(() => {
      const norm = total % 360;
      const sliceAngle = 360 / items.length;
      // Pointer is at top (270deg / -90deg), so adjust accordingly
      const adjusted = (360 - norm + 270) % 360;
      const idx = Math.floor(adjusted / sliceAngle) % items.length;
      setIsSpinning(false);
      onSpinEnd(items[idx], idx);
    }, 4500);
  }, [isSpinning, items, rotation, onSpinEnd, setIsSpinning]);

  const slices = useMemo(() => {
    if (items.length === 0) return null;
    const total = items.length;
    const angle = 360 / total;
    const r = 185;
    const cx = 200, cy = 200;

    return items.map((item, index) => {
      const start = index * angle;
      const end = start + angle;
      const mid = start + angle / 2;
      const startRad = (start * Math.PI) / 180;
      const endRad = (end * Math.PI) / 180;
      const midRad = (mid * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];

      const textR = r * 0.62;
      const textX = cx + textR * Math.cos(midRad);
      const textY = cy + textR * Math.sin(midRad);
      const maxLen = Math.max(5, Math.floor(angle / 8));
      const label = item.length > maxLen ? item.substring(0, maxLen - 1) + '…' : item;
      const fs = Math.max(8, Math.min(16, 300 / total));

      return (
        <g key={index}>
          <path d={path} fill={color} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <text
            x={textX} y={textY} fill="white" fontSize={fs} fontWeight="700"
            textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${mid}, ${textX}, ${textY})`}
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontFamily: "'Inter', system-ui" }}
          >
            {label}
          </text>
        </g>
      );
    });
  }, [items]);

  const size = 'min(70vw, 480px)';

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div className="absolute inset-[-12px] rounded-full opacity-40" style={{
        background: isSpinning
          ? 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))'
          : 'none',
        filter: 'blur(16px)',
        transition: 'opacity 0.5s',
      }} />

      {/* Outer ring */}
      <div className="absolute inset-[-4px] rounded-full border-2 border-border/20" />

      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
        animate={{ rotate: rotation }}
        transition={{ duration: 4.5, ease: [0.12, 0.8, 0.05, 1] }}
        onClick={spinWheel}
      >
        {/* Background circle */}
        <circle cx="200" cy="200" r="195" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" strokeOpacity="0.2" />

        {items.length > 0 ? slices : (
          <>
            <circle cx="200" cy="200" r="185" fill="hsl(var(--muted))" fillOpacity="0.3" />
            <text x="200" y="195" fill="hsl(var(--muted-foreground))" fontSize="13" textAnchor="middle" dominantBaseline="middle" fontWeight="600">
              Add entries
            </text>
            <text x="200" y="212" fill="hsl(var(--muted-foreground))" fontSize="11" textAnchor="middle" dominantBaseline="middle" opacity="0.5">
              to spin the wheel
            </text>
          </>
        )}

        {/* Tick marks around the edge */}
        {items.length > 0 && items.map((_, i) => {
          const a = (i * 360 / items.length) * Math.PI / 180;
          const x1 = 200 + 186 * Math.cos(a);
          const y1 = 200 + 186 * Math.sin(a);
          const x2 = 200 + 195 * Math.cos(a);
          const y2 = 200 + 195 * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />;
        })}

        {/* Center hub */}
        <circle cx="200" cy="200" r="32" fill="hsl(var(--card))" />
        <circle cx="200" cy="200" r="32" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeOpacity="0.3" />

        {!isSpinning && items.length > 0 && (
          <>
            <text x="200" y="195" fill="hsl(var(--foreground))" fontSize="8" fontWeight="700" textAnchor="middle" dominantBaseline="middle" opacity="0.5"
              style={{ fontFamily: "'Inter', system-ui", textTransform: 'uppercase', letterSpacing: '1px' }}>TAP TO</text>
            <text x="200" y="208" fill="hsl(var(--primary))" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'Inter', system-ui" }}>SPIN</text>
          </>
        )}
        {isSpinning && (
          <motion.circle cx="200" cy="200" r="4" fill="hsl(var(--primary))"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
        )}
      </motion.svg>

      {/* Top pointer - pointing down toward wheel */}
      <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20">
        <motion.svg width="36" height="36" viewBox="0 0 36 36"
          animate={isSpinning ? { y: [-2, 2, -2] } : {}}
          transition={{ duration: 0.15, repeat: isSpinning ? Infinity : 0 }}
        >
          <defs>
            <linearGradient id="ptrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBC04" />
              <stop offset="100%" stopColor="#F57C00" />
            </linearGradient>
            <filter id="ptrShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>
          <polygon points="18,36 0,0 36,0" fill="url(#ptrGrad)" filter="url(#ptrShadow)" />
        </motion.svg>
      </div>
    </div>
  );
};

export default SpinningWheel;
