import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinningWheelProps {
  items: string[];
  onSpinEnd: (selectedItem: string, index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const WHEEL_COLORS = [
  'hsl(262, 83%, 58%)',
  'hsl(338, 90%, 56%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 76%, 46%)',
  'hsl(45, 93%, 47%)',
  'hsl(28, 100%, 55%)',
];

const SpinningWheel = ({ items, onSpinEnd, isSpinning, setIsSpinning }: SpinningWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    
    setIsSpinning(true);
    
    const baseSpins = 8 + Math.random() * 7;
    const randomOffset = Math.random() * 360;
    const totalRotation = rotation + (baseSpins * 360) + randomOffset;
    
    setRotation(totalRotation);
    
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const sliceAngle = 360 / items.length;
      const adjustedRotation = (360 - normalizedRotation + 270) % 360;
      const selectedIdx = Math.floor(adjustedRotation / sliceAngle) % items.length;
      
      setIsSpinning(false);
      onSpinEnd(items[selectedIdx], selectedIdx);
    }, 6000);
  };

  const renderSlice = (item: string, index: number, total: number) => {
    const sliceAngle = 360 / total;
    const startAngle = index * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const midRad = (midAngle - 90) * (Math.PI / 180);
    
    const radius = 180;
    const centerX = 200;
    const centerY = 200;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    const pathData = `
      M ${centerX} ${centerY}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;
    
    const textRadius = radius * 0.55;
    const textX = centerX + textRadius * Math.cos(midRad);
    const textY = centerY + textRadius * Math.sin(midRad);
    const textRotation = midAngle;
    
    const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
    
    const maxChars = 10;
    const displayText = item.length > maxChars ? item.substring(0, maxChars) + '..' : item;
    const baseFontSize = Math.min(26, 320 / total);
    const fontSize = Math.max(16, baseFontSize);

    return (
      <g key={index}>
        <defs>
          <linearGradient id={`sliceGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill={`url(#sliceGradient-${index})`}
          stroke="hsl(230, 25%, 5%)"
          strokeWidth="3"
          className="transition-all duration-300"
          style={{
            filter: isSpinning ? 'brightness(1.2)' : 'brightness(1)',
          }}
        />
        <text
          x={textX}
          y={textY}
          fill="white"
          fontSize={fontSize}
          fontWeight="800"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${textRotation}, ${textX}, ${textY})`}
          style={{
            textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.5px',
          }}
        >
          {displayText}
        </text>
      </g>
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: isSpinning ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: isSpinning ? Infinity : 0,
        }}
      >
        <div 
          className="w-[440px] h-[440px] rounded-full"
          style={{
            background: `conic-gradient(from 0deg, 
              hsl(262 83% 58% / 0.3), 
              hsl(338 90% 56% / 0.3), 
              hsl(199 89% 48% / 0.3), 
              hsl(142 76% 46% / 0.3),
              hsl(45 93% 47% / 0.3),
              hsl(262 83% 58% / 0.3)
            )`,
            filter: 'blur(20px)',
            animation: isSpinning ? 'spin 2s linear infinite' : 'none',
          }}
        />
      </motion.div>

      {/* Pointer */}
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 -mt-2"
        animate={{
          scale: isSpinning ? [1, 1.1, 1] : 1,
          y: isSpinning ? [0, -5, 0] : 0,
        }}
        transition={{
          duration: 0.3,
          repeat: isSpinning ? Infinity : 0,
        }}
      >
        <div 
          className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[48px] border-l-transparent border-r-transparent drop-shadow-2xl"
          style={{ 
            borderTopColor: 'hsl(338, 90%, 56%)',
            filter: 'drop-shadow(0 0 15px hsl(338 90% 56% / 0.8))',
          }}
        />
      </motion.div>

      {/* Wheel Container */}
      <motion.div 
        className="relative z-10"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          scale: isHovered && !isSpinning ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.svg
          ref={wheelRef}
          width="420"
          height="420"
          viewBox="0 0 400 400"
          className="drop-shadow-2xl cursor-pointer"
          animate={{ rotate: rotation }}
          transition={{
            duration: 6,
            ease: [0.2, 0.9, 0.1, 1],
          }}
          onClick={spinWheel}
          style={{
            filter: isSpinning 
              ? 'drop-shadow(0 0 40px hsl(262 83% 58% / 0.6))' 
              : 'drop-shadow(0 0 20px hsl(262 83% 58% / 0.3))',
          }}
        >
          {/* Outer decorative ring */}
          <circle
            cx="200"
            cy="200"
            r="195"
            fill="none"
            stroke="url(#outerRingGradient)"
            strokeWidth="6"
            className={isSpinning ? 'animate-pulse' : ''}
          />
          
          {/* Inner shadow ring */}
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="hsl(230, 25%, 5%)"
            strokeWidth="2"
          />
          
          {/* Wheel slices */}
          <g>
            {items.length > 0 ? (
              items.map((item, index) => renderSlice(item, index, items.length))
            ) : (
              <>
                <circle cx="200" cy="200" r="180" fill="hsl(230, 25%, 12%)" />
                <text x="200" y="200" fill="hsl(215, 20%, 65%)" fontSize="16" textAnchor="middle" dominantBaseline="middle">
                  Add items to spin!
                </text>
              </>
            )}
          </g>

          {/* Decorative inner rings */}
          <circle cx="200" cy="200" r="50" fill="url(#innerCircleGradient)" stroke="hsl(230, 25%, 5%)" strokeWidth="4" />
          <circle cx="200" cy="200" r="35" fill="url(#centerGradient)" stroke="hsl(230, 25%, 15%)" strokeWidth="2" />
          <circle cx="200" cy="200" r="20" fill="hsl(230, 25%, 20%)" />
          
          {/* Tick marks */}
          {items.length > 0 && items.map((_, i) => {
            const angle = (i * (360 / items.length) - 90) * (Math.PI / 180);
            const x1 = 200 + 175 * Math.cos(angle);
            const y1 = 200 + 175 * Math.sin(angle);
            const x2 = 200 + 185 * Math.cos(angle);
            const y2 = 200 + 185 * Math.sin(angle);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(0, 0%, 100%)" strokeWidth="2" opacity="0.5" />
            );
          })}
          
          {/* Gradients */}
          <defs>
            <linearGradient id="outerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
              <stop offset="33%" stopColor="hsl(338, 90%, 56%)" />
              <stop offset="66%" stopColor="hsl(199, 89%, 48%)" />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
            </linearGradient>
            <radialGradient id="innerCircleGradient">
              <stop offset="0%" stopColor="hsl(230, 25%, 18%)" />
              <stop offset="100%" stopColor="hsl(230, 25%, 10%)" />
            </radialGradient>
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="hsl(262, 83%, 68%)" />
              <stop offset="50%" stopColor="hsl(262, 83%, 48%)" />
              <stop offset="100%" stopColor="hsl(262, 83%, 38%)" />
            </radialGradient>
          </defs>
        </motion.svg>

        {/* Spinning particles effect */}
        <AnimatePresence>
          {isSpinning && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length],
                    boxShadow: `0 0 10px ${WHEEL_COLORS[i % WHEEL_COLORS.length]}`,
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    x: [0, Math.cos((i * 30) * Math.PI / 180) * 250],
                    y: [0, Math.sin((i * 30) * Math.PI / 180) * 250],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Spin Button */}
      <motion.button
        onClick={spinWheel}
        disabled={isSpinning || items.length === 0}
        className="mt-10 px-14 py-5 text-xl font-extrabold rounded-full bg-gradient-to-r from-primary via-accent to-glow-cyan text-white shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        whileHover={{ scale: 1.05, boxShadow: '0 0 40px hsl(262 83% 58% / 0.5)' }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isSpinning 
            ? ['0 0 20px hsl(262 83% 58% / 0.3)', '0 0 60px hsl(262 83% 58% / 0.6)', '0 0 20px hsl(262 83% 58% / 0.3)']
            : '0 0 20px hsl(262 83% 58% / 0.3)',
        }}
        transition={{
          boxShadow: { duration: 0.8, repeat: isSpinning ? Infinity : 0 },
        }}
      >
        <span className="relative z-10">
          {isSpinning ? '🎰 Spinning...' : items.length === 0 ? '➕ Add Items' : '🎯 SPIN!'}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.button>

      {/* Item count */}
      {items.length > 0 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {items.length} item{items.length !== 1 ? 's' : ''} on the wheel
        </motion.p>
      )}
    </div>
  );
};

export default SpinningWheel;
