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
  '#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#a855f7', '#0ea5e9', '#ef4444',
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
      const adjusted = (360 - norm + 270) % 360;
      const idx = Math.floor(adjusted / sliceAngle) % items.length;
      setIsSpinning(false);
      onSpinEnd(items[idx], idx);
    }, 4500);
  }, [isSpinning, items, rotation, onSpinEnd, setIsSpinning, onSpinStart]);

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

      const key = item.toLowerCase().trim();
      const animeImg = imageMap[key]?.image;
      const animeTitle = imageMap[key]?.title;

      // Image position - place in middle of slice
      const imgR = r * 0.55;
      const imgX = cx + imgR * Math.cos(midRad);
      const imgY = cy + imgR * Math.sin(midRad);
      const imgSize = Math.max(22, Math.min(44, angle * 0.9));

      // Text position
      const textR = animeImg ? r * 0.82 : r * 0.62;
      const textX = cx + textR * Math.cos(midRad);
      const textY = cy + textR * Math.sin(midRad);
      const maxLen = Math.max(4, Math.floor(angle / 7));
      const displayName = animeTitle || item;
      const label = displayName.length > maxLen ? displayName.substring(0, maxLen - 1) + '…' : displayName;
      const fs = Math.max(7, Math.min(13, 260 / total));
      const clipId = `slice-clip-${index}`;

      return (
        <g key={index}>
          {/* Slice */}
          <path d={path} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          {/* Slight inner highlight */}
          <path d={path} fill="url(#sliceShine)" opacity="0.15" />

          {/* Anime image inside slice */}
          {animeImg && (
            <>
              <defs>
                <clipPath id={clipId}>
                  <circle cx={imgX} cy={imgY} r={imgSize / 2} />
                </clipPath>
              </defs>
              <image
                href={animeImg}
                x={imgX - imgSize / 2}
                y={imgY - imgSize / 2}
                width={imgSize}
                height={imgSize}
                clipPath={`url(#${clipId})`}
                style={{ pointerEvents: 'none' }}
                preserveAspectRatio="xMidYMid slice"
              />
              <circle cx={imgX} cy={imgY} r={imgSize / 2} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            </>
          )}

          {/* Text label */}
          <text
            x={textX} y={textY} fill="white" fontSize={fs} fontWeight="700"
            textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${mid}, ${textX}, ${textY})`}
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)', fontFamily: "'Inter', system-ui" }}
          >
            {label}
          </text>
        </g>
      );
    });
  }, [items, imageMap]);

  const size = 'min(70vw, 480px)';

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div className="absolute inset-[-14px] rounded-full" style={{
        background: isSpinning
          ? 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))'
          : 'conic-gradient(from 0deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.2))',
        filter: isSpinning ? 'blur(18px)' : 'blur(12px)',
        opacity: isSpinning ? 0.5 : 0.25,
        transition: 'opacity 0.5s, filter 0.5s',
      }} />

      {/* Outer ring border */}
      <div className="absolute inset-[-5px] rounded-full border-2 border-border/30" />

      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.4))' }}
        animate={{ rotate: rotation }}
        transition={{ duration: 4.5, ease: [0.12, 0.8, 0.05, 1] }}
        onClick={spinWheel}
      >
        <defs>
          {/* Shine gradient for slices */}
          <radialGradient id="sliceShine" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

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
          const tx1 = 200 + 186 * Math.cos(a);
          const ty1 = 200 + 186 * Math.sin(a);
          const tx2 = 200 + 195 * Math.cos(a);
          const ty2 = 200 + 195 * Math.sin(a);
          return <line key={i} x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />;
        })}

        {/* Center hub */}
        <circle cx="200" cy="200" r="34" fill="hsl(var(--card))" />
        <circle cx="200" cy="200" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="200" cy="200" r="30" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.2" />

        {!isSpinning && items.length > 0 && (
          <>
            <text x="200" y="193" fill="hsl(var(--foreground))" fontSize="7" fontWeight="700" textAnchor="middle" dominantBaseline="middle" opacity="0.4"
              style={{ fontFamily: "'Inter', system-ui", textTransform: 'uppercase', letterSpacing: '1.5px' }}>TAP TO</text>
            <text x="200" y="208" fill="hsl(var(--primary))" fontSize="13" fontWeight="900" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'Inter', system-ui" }}>SPIN</text>
          </>
        )}
        {isSpinning && (
          <motion.circle cx="200" cy="200" r="5" fill="hsl(var(--primary))"
            animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
        )}
      </motion.svg>

      {/* Top pointer - pointing down toward wheel */}
      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20">
        <motion.svg width="40" height="40" viewBox="0 0 40 40"
          animate={isSpinning ? { y: [-2, 3, -2] } : {}}
          transition={{ duration: 0.12, repeat: isSpinning ? Infinity : 0 }}
        >
          <defs>
            <linearGradient id="ptrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBC04" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
            <filter id="ptrShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
            </filter>
          </defs>
          <polygon points="20,40 2,4 38,4" fill="url(#ptrGrad)" filter="url(#ptrShadow)" />
          <polygon points="20,36 6,8 34,8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </motion.svg>
      </div>
    </div>
  );
};

export default SpinningWheel;
