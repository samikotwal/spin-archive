import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Trophy, X, Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  selectedItem: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 22 };

const Confetti = () => {
  const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6', '#7B1FA2', '#E91E63'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-12px',
            width: `${Math.random() * 6 + 3}px`,
            height: `${Math.random() * 10 + 4}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '1px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: Math.random() * 1080 - 540,
            opacity: [1, 1, 0.8, 0],
            x: (Math.random() - 0.5) * 300,
          }}
          transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 0.4, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

const DeleteConfirmDialog = ({ isOpen, selectedItem, onConfirm, onCancel }: DeleteConfirmDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && <Confetti />}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 40 }}
              transition={spring}
              className="w-full max-w-sm overflow-hidden rounded-2xl bg-card border border-border/20 shadow-2xl"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-6 py-5 text-center overflow-hidden">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...spring, delay: 0.1 }}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2"
                >
                  <Trophy className="w-7 h-7 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg font-black text-white tracking-tight"
                >
                  🎉 Winner!
                </motion.h2>
              </div>

              {/* Body */}
              <div className="px-6 py-8 text-center">
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, ...spring }}
                  className="text-3xl font-black text-foreground break-words leading-tight"
                >
                  {selectedItem}
                </motion.p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex items-center gap-3 border-t border-border/10">
                <Button onClick={onCancel} variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground font-semibold rounded-xl h-11">
                  <X className="w-4 h-4 mr-1.5" /> Close
                </Button>
                <Button onClick={onConfirm} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl h-11">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Remove
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmDialog;
