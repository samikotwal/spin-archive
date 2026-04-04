import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SpinningWheelProps {
  items: string[];
  onSpinEnd: (selectedItem: string, index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const WHEEL_COLORS = [
  '#4285F4', // blue
  '#EA4335', // red
  '#FBBC04', // yellow
  '#34A853', // green
  '#FF6D01', // orange
  '#46BDC6', // teal
  '#7B1FA2', // purple
  '#E91E63', // pink
  '#00ACC1', // cyan
  '#FF7043', // deep orange
];

const SpinningWheel = ({ items, onSpinEnd, isSpinning, setIsSpinning }: SpinningWheelProps) => {
  const [rotation, setRotation] = useState(0);

  const spinWheel = useCallback(() => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);

    const spins = 5 + Math.random() * 5;
    const randomOffset = Math.random() * 360;
    const total = rotation + spins * 360 + randomOffset;
    setRotation(total);

    setTimeout(() => {
      const norm = total % 360;
      const sliceAngle = 360 / items.length;
      // Pointer at right (3 o'clock = 0°)
      const adjusted = (360 - norm) % 360;
      const idx = Math.floor(adjusted / sliceAngle) % items.length;
      setIsSpinning(false);
      onSpinEnd(items[idx], idx);
    }, 4500);
  }, [isSpinning, items, rotation, onSpinEnd, setIsSpinning]);

  const renderSlice = (item: string, index: number, total: number) => {
    const angle = 360 / total;
    const start = index * angle;
    const end = start + angle;
    const mid = start + angle / 2;
    const r = 190;
    const cx = 200, cy = 200;

    const startRad = start * Math.PI / 180;
    const endRad = end * Math.PI / 180;
    const midRad = mid * Math.PI / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
    const color = WHEEL_COLORS[index % WHEEL_COLORS.length];

    const textR = r * 0.65;
    const textX = cx + textR * Math.cos(midRad);
    const textY = cy + textR * Math.sin(midRad);

    const maxLen = Math.max(6, Math.floor(angle / 7));
    const label = item.length > maxLen ? item.substring(0, maxLen - 1) + '…' : item;
    const fs = Math.max(9, Math.min(20, 360 / total));

    return (
      <g key={index}>
        <path d={path} fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text
          x={textX} y={textY}
          fill="white"
          fontSize={fs}
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${mid}, ${textX}, ${textY})`}
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', fontFamily: "'Inter', system-ui" }}
        >
          {label}
        </text>
      </g>
    );
  };

  const size = 'min(75vw, 520px)';

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer dark ring */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle, transparent 46%, rgba(0,0,0,0.4) 48%, rgba(0,0,0,0.15) 50%, transparent 52%)',
      }} />

      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
        animate={{ rotate: rotation }}
        transition={{ duration: 4.5, ease: [0.15, 0.85, 0.05, 1] }}
        onClick={spinWheel}
      >
        {/* Outer ring */}
        <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />

        {items.length > 0 ? (
          items.map((item, i) => renderSlice(item, i, items.length))
        ) : (
          <>
            <circle cx="200" cy="200" r="190" fill="#333" />
            <text x="200" y="200" fill="#888" fontSize="14" textAnchor="middle" dominantBaseline="middle">
              Add entries to spin
            </text>
          </>
        )}

        {/* White center circle */}
        <circle cx="200" cy="200" r="38" fill="white" />
        <circle cx="200" cy="200" r="38" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

        {/* Center text */}
        {!isSpinning && items.length > 0 && (
          <>
            <text x="200" y="194" fill="#333" fontSize="10" fontWeight="700" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'Inter', system-ui" }}>Tap to</text>
            <text x="200" y="208" fill="#333" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'Inter', system-ui" }}>spin</text>
          </>
        )}
        {isSpinning && (
          <text x="200" y="200" fill="#4285F4" fontSize="10" fontWeight="800" textAnchor="middle" dominantBaseline="middle">
            ●●●
          </text>
        )}
      </motion.svg>

      {/* Right pointer (golden triangle) */}
      <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 z-20">
        <svg width="28" height="36" viewBox="0 0 28 36">
          <polygon points="0,0 28,18 0,36" fill="#FBBC04" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default SpinningWheel;
