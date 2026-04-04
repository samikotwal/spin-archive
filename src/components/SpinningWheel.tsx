import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const wheelRef = useRef<SVGSVGElement>(null);
  const [tickSound] = useState(() => {
    try {
      const ctx = new AudioContext();
      return ctx;
    } catch { return null; }
  });

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);

    const baseSpins = 5 + Math.random() * 5;
    const randomOffset = Math.random() * 360;
    const totalRotation = rotation + (baseSpins * 360) + randomOffset;
    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const sliceAngle = 360 / items.length;
      // Pointer is at the right side (0 degrees in SVG = 3 o'clock)
      const adjustedRotation = (360 - normalizedRotation) % 360;
      const selectedIdx = Math.floor(adjustedRotation / sliceAngle) % items.length;
      setIsSpinning(false);
      onSpinEnd(items[selectedIdx], selectedIdx);
    }, 5000);
  };

  const renderSlice = (item: string, index: number, total: number) => {
    const sliceAngle = 360 / total;
    const startAngle = index * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

    const startRad = (startAngle) * (Math.PI / 180);
    const endRad = (endAngle) * (Math.PI / 180);
    const midRad = (midAngle) * (Math.PI / 180);

    const radius = 190;
    const cx = 200, cy = 200;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = WHEEL_COLORS[index % WHEEL_COLORS.length];

    // Text along radius
    const textR = radius * 0.62;
    const textX = cx + textR * Math.cos(midRad);
    const textY = cy + textR * Math.sin(midRad);
    const textAngle = midAngle;

    const maxChars = Math.max(6, Math.floor(sliceAngle / 8));
    const displayText = item.length > maxChars ? item.substring(0, maxChars) + '…' : item;
    const fontSize = Math.max(10, Math.min(22, 400 / total));

    return (
      <g key={index}>
        <path d={path} fill={color} stroke="white" strokeWidth="1.5" />
        <text
          x={textX}
          y={textY}
          fill="white"
          fontSize={fontSize}
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          style={{
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {displayText}
        </text>
      </g>
    );
  };

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 'min(80vw, 500px)', height: 'min(80vw, 500px)' }}>
      {/* Wheel SVG */}
      <motion.svg
        ref={wheelRef}
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer drop-shadow-xl"
        animate={{ rotate: rotation }}
        transition={{ duration: 5, ease: [0.15, 0.85, 0.1, 1] }}
        onClick={spinWheel}
      >
        {/* Outer ring */}
        <circle cx="200" cy="200" r="198" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.3" />

        {items.length > 0 ? (
          items.map((item, i) => renderSlice(item, i, items.length))
        ) : (
          <>
            <circle cx="200" cy="200" r="190" fill="hsl(var(--muted))" />
            <text x="200" y="200" fill="hsl(var(--muted-foreground))" fontSize="16" textAnchor="middle" dominantBaseline="middle">
              Add items to spin
            </text>
          </>
        )}

        {/* Center circle - white */}
        <circle cx="200" cy="200" r="40" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />

        {/* Click to spin text in center */}
        {!isSpinning && items.length > 0 && (
          <>
            <text x="200" y="193" fill="hsl(var(--foreground))" fontSize="11" fontWeight="800" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "'Inter', system-ui" }}>
              Click to
            </text>
            <text x="200" y="210" fill="hsl(var(--foreground))" fontSize="13" fontWeight="900" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "'Inter', system-ui" }}>
              spin
            </text>
          </>
        )}
        {isSpinning && (
          <text x="200" y="200" fill="hsl(var(--primary))" fontSize="11" fontWeight="800" textAnchor="middle" dominantBaseline="middle">
            Spinning...
          </text>
        )}
      </motion.svg>

      {/* Right-side pointer (arrow) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-20">
        <svg width="30" height="40" viewBox="0 0 30 40">
          <polygon points="0,0 30,20 0,40" fill="#4285F4" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default SpinningWheel;
