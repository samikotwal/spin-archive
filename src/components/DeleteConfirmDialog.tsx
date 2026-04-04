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
      {[...Array(60)].map((_, i) => (
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
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'linear' }}
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
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && <Confetti />}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Winner Card - centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 40 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.35 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
            >
              {/* Yellow banner */}
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3.5 text-center">
                <h2 className="text-lg font-black text-black">
                  🎉 We have a winner!
                </h2>
              </div>

              {/* Body */}
              <div className="bg-card p-8 text-center">
                <motion.h3
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-3xl font-black text-foreground break-words leading-tight mb-8"
                >
                  {selectedItem}
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-end gap-3"
                >
                  <Button
                    onClick={onCancel}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground font-semibold px-5"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-5 rounded-lg"
                  >
                    Remove
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmDialog;
