import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getStyleById, WheelStyle } from '@/lib/wheelStyles';

interface SpinningWheelProps {
  items: string[];
  onSpinEnd: (selectedItem: string, index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  onSpinStart?: () => void;
  imageMap?: Record<string, { image: string | null; title: string | null }>;
  styleId?: string;
}

const Pointer = ({ style, isSpinning }: { style: WheelStyle; isSpinning: boolean }) => {
  const [a, b] = style.pointerColors;
  const commonSvg = (
    <motion.svg width="40" height="40" viewBox="0 0 40 40"
      animate={isSpinning ? { y: [-2, 3, -2] } : {}}
      transition={{ duration: 0.12, repeat: isSpinning ? Infinity : 0 }}>
      <defs>
        <linearGradient id={`ptrGrad-${style.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <filter id={`ptrShadow-${style.id}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.45" />
        </filter>
      </defs>
      {style.pointer === 'flame' && (
        <>
          <polygon points="20,40 2,4 38,4" fill={`url(#ptrGrad-${style.id})`} filter={`url(#ptrShadow-${style.id})`} />
          <polygon points="20,36 6,8 34,8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </>
      )}
      {style.pointer === 'arrow' && (
        <>
          <path d="M20 40 L8 14 Q8 6 20 6 Q32 6 32 14 Z" fill={`url(#ptrGrad-${style.id})`} filter={`url(#ptrShadow-${style.id})`} />
          <circle cx="20" cy="14" r="3" fill="rgba(255,255,255,0.35)" />
        </>
      )}
      {style.pointer === 'diamond' && (
        <>
          <polygon points="20,40 6,20 20,4 34,20" fill={`url(#ptrGrad-${style.id})`} filter={`url(#ptrShadow-${style.id})`} />
          <polygon points="20,36 10,20 20,8 30,20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        </>
      )}
      {style.pointer === 'chevron' && (
        <>
          <path d="M20 40 L4 16 L14 16 L20 6 L26 16 L36 16 Z" fill={`url(#ptrGrad-${style.id})`} filter={`url(#ptrShadow-${style.id})`} />
        </>
      )}
      {style.pointer === 'blade' && (
        <>
          <path d="M20 40 L10 8 L20 12 L30 8 Z" fill={`url(#ptrGrad-${style.id})`} filter={`url(#ptrShadow-${style.id})`} />
          <line x1="20" y1="12" x2="20" y2="36" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        </>
      )}
    </motion.svg>
  );
  return <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20">{commonSvg}</div>;
};

const HubDecoration = ({ style, isSpinning }: { style: WheelStyle; isSpinning: boolean }) => {
  const cx = 200, cy = 200;
  return (
    <>
      <circle cx={cx} cy={cy} r={34} fill="hsl(var(--card))" />
      <circle cx={cx} cy={cy} r={34} fill="none" stroke={style.glow} strokeOpacity="0.4" strokeWidth="1.5" />
      {style.hub === 'classic' && (
        <circle cx={cx} cy={cy} r={30} fill="none" stroke={style.glow} strokeOpacity="0.25" strokeWidth="0.6" />
      )}
      {style.hub === 'ring' && (
        <>
          <circle cx={cx} cy={cy} r={28} fill="none" stroke={style.glow} strokeOpacity="0.6" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={22} fill="none" stroke={style.glow} strokeOpacity="0.3" strokeWidth="0.8" />
        </>
      )}
      {style.hub === 'dot' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45) * Math.PI / 180;
            const x = cx + 26 * Math.cos(a), y = cy + 26 * Math.sin(a);
            return <circle key={i} cx={x} cy={y} r={2} fill={style.glow} opacity="0.7" />;
          })}
        </>
      )}
      {style.hub === 'star' && (
        <polygon
          points={Array.from({ length: 10 }).map((_, i) => {
            const a = (i * 36 - 90) * Math.PI / 180;
            const rr = i % 2 === 0 ? 22 : 10;
            return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
          }).join(' ')}
          fill={style.glow} opacity="0.85"
        />
      )}
      {style.hub === 'gem' && (
        <>
          <polygon points={`${cx},${cy - 20} ${cx + 18},${cy} ${cx},${cy + 20} ${cx - 18},${cy}`} fill={style.glow} opacity="0.85" />
          <polygon points={`${cx},${cy - 12} ${cx + 10},${cy} ${cx},${cy + 12} ${cx - 10},${cy}`} fill="rgba(255,255,255,0.4)" />
        </>
      )}
    </>
  );
};

const SpinningWheel = ({ items, onSpinEnd, isSpinning, setIsSpinning, onSpinStart, imageMap = {}, styleId = 'classic' }: SpinningWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const style = getStyleById(styleId);
  const textFill = style.textColor || 'white';
  const textShadow = style.textColor ? '0 1px 2px rgba(255,255,255,0.6)' : '0 1px 4px rgba(0,0,0,0.7)';

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
      const color = style.palette[index % style.palette.length];

      const key = item.toLowerCase().trim();
      const animeImg = imageMap[key]?.image;
      const animeTitle = imageMap[key]?.title;

      const imgR = r * 0.55;
      const imgX = cx + imgR * Math.cos(midRad);
      const imgY = cy + imgR * Math.sin(midRad);
      const imgSize = Math.max(22, Math.min(44, angle * 0.9));

      const textR = animeImg ? r * 0.82 : r * 0.62;
      const textX = cx + textR * Math.cos(midRad);
      const textY = cy + textR * Math.sin(midRad);
      const maxLen = Math.max(4, Math.floor(angle / 7));
      const displayName = animeTitle || item;
      const label = displayName.length > maxLen ? displayName.substring(0, maxLen - 1) + '…' : displayName;
      const fs = Math.max(7, Math.min(13, 260 / total));
      const clipId = `slice-clip-${styleId}-${index}`;

      return (
        <g key={index}>
          <path d={path} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <path d={path} fill="url(#sliceShine)" opacity="0.15" />

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

          <text
            x={textX} y={textY} fill={textFill} fontSize={fs} fontWeight="700"
            textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${mid}, ${textX}, ${textY})`}
            style={{ textShadow, fontFamily: "'Inter', system-ui" }}
          >
            {label}
          </text>
        </g>
      );
    });
  }, [items, imageMap, style, styleId, textFill, textShadow]);

  const size = 'min(70vw, 480px)';

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <div className="absolute inset-[-14px] rounded-full" style={{
        background: isSpinning
          ? `conic-gradient(from 0deg, ${style.glow}, ${style.palette[Math.floor(style.palette.length / 2)]}, ${style.glow})`
          : `conic-gradient(from 0deg, ${style.glow}33, ${style.palette[Math.floor(style.palette.length / 2)]}33, ${style.glow}33)`,
        filter: isSpinning ? 'blur(18px)' : 'blur(12px)',
        opacity: isSpinning ? 0.55 : 0.3,
        transition: 'opacity 0.5s, filter 0.5s',
      }} />

      <div className="absolute inset-[-5px] rounded-full border-2" style={{ borderColor: `${style.glow}55` }} />

      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer"
        style={{ filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.4))' }}
        animate={{ rotate: rotation }}
        transition={{ duration: 4.5, ease: [0.12, 0.8, 0.05, 1] }}
        onClick={spinWheel}
      >
        <defs>
          <radialGradient id="sliceShine" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="195" fill="hsl(var(--card))" stroke={style.glow} strokeWidth="1" strokeOpacity="0.25" />

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

        {items.length > 0 && items.map((_, i) => {
          const a = (i * 360 / items.length) * Math.PI / 180;
          const tx1 = 200 + 186 * Math.cos(a);
          const ty1 = 200 + 186 * Math.sin(a);
          const tx2 = 200 + 195 * Math.cos(a);
          const ty2 = 200 + 195 * Math.sin(a);
          return <line key={i} x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={style.tickColor} strokeWidth="1.5" />;
        })}

        <HubDecoration style={style} isSpinning={isSpinning} />

        {!isSpinning && items.length > 0 && (
          <>
            <text x="200" y="193" fill="hsl(var(--foreground))" fontSize="7" fontWeight="700" textAnchor="middle" dominantBaseline="middle" opacity="0.5"
              style={{ fontFamily: "'Inter', system-ui", textTransform: 'uppercase', letterSpacing: '1.5px' }}>TAP TO</text>
            <text x="200" y="208" fontSize="13" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fill={style.glow}
              style={{ fontFamily: "'Inter', system-ui" }}>SPIN</text>
          </>
        )}
        {isSpinning && (
          <motion.circle cx="200" cy="200" r="5" fill={style.glow}
            animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
        )}
      </motion.svg>

      <Pointer style={style} isSpinning={isSpinning} />
    </div>
  );
};

export default SpinningWheel;
