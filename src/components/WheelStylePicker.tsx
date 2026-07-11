import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { WHEEL_STYLES, WheelStyle } from '@/lib/wheelStyles';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
}

const MiniWheel = ({ style }: { style: WheelStyle }) => {
  const n = 8;
  const angle = 360 / n;
  const cx = 40, cy = 40, r = 36;
  const slices = Array.from({ length: n }, (_, i) => {
    const s = i * angle, e = s + angle;
    const sR = (s * Math.PI) / 180, eR = (e * Math.PI) / 180;
    const x1 = cx + r * Math.cos(sR), y1 = cy + r * Math.sin(sR);
    const x2 = cx + r * Math.cos(eR), y2 = cy + r * Math.sin(eR);
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z`, fill: style.palette[i % style.palette.length] };
  });
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={style.glow} strokeOpacity="0.35" strokeWidth="2" />
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.fill} stroke="rgba(0,0,0,0.15)" strokeWidth="0.4" />)}
      <circle cx={cx} cy={cy} r={9} fill="#0f172a" />
      <circle cx={cx} cy={cy} r={9} fill="none" stroke={style.glow} strokeWidth="1" strokeOpacity="0.6" />
      {/* pointer */}
      <polygon points={`${cx},2 ${cx - 5},10 ${cx + 5},10`} fill={style.pointerColors[1]} />
    </svg>
  );
};

const WheelStylePicker = ({ open, onClose, selectedId, onSelect }: Props) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[85vh] bg-card border border-border/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/10 shrink-0">
              <div>
                <h2 className="text-sm sm:text-base font-black text-foreground">🎨 Wheel Designs</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pick a style — {WHEEL_STYLES.length} to choose</p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 sm:p-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                {WHEEL_STYLES.map(style => {
                  const active = style.id === selectedId;
                  return (
                    <motion.button key={style.id}
                      whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                      onClick={() => { onSelect(style.id); onClose(); }}
                      className={`relative flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border transition-colors ${
                        active ? 'border-primary bg-primary/10' : 'border-border/15 bg-muted/30 hover:border-primary/40 hover:bg-primary/5'
                      }`}>
                      {active && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="w-full aspect-square">
                        <MiniWheel style={style} />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs font-bold text-foreground leading-tight">{style.emoji} {style.name}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WheelStylePicker;
