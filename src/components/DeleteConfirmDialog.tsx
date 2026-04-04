import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  selectedItem: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Confetti = () => {
  const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6', '#7B1FA2'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
            x: Math.random() * 200 - 100,
          }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'linear' }}
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
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && <Confetti />}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 30 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-md overflow-hidden rounded-xl shadow-2xl"
            >
              {/* Yellow header */}
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4 text-center">
                <h2 className="text-xl font-black text-black tracking-tight">🎉 We have a winner!</h2>
              </div>
              {/* Body */}
              <div className="bg-card px-6 py-10 text-center">
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="text-4xl font-black text-foreground break-words leading-tight"
                >
                  {selectedItem}
                </motion.p>
              </div>
              {/* Footer */}
              <div className="bg-card border-t border-border/20 px-6 py-4 flex items-center justify-end gap-3">
                <Button onClick={onCancel} variant="ghost"
                  className="text-muted-foreground hover:text-foreground font-semibold px-5">
                  Close
                </Button>
                <Button onClick={onConfirm}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-6 rounded-lg">
                  Remove
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
