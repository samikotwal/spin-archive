import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, X, Trophy, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  selectedItem: string;
  selectedImageUrl?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const Confetti = () => {
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#F97316'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${Math.random() * 10 + 4}px`,
            height: `${Math.random() * 10 + 4}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 100,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
            x: Math.random() * 200 - 100,
          }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.8, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

const DeleteConfirmDialog = ({ isOpen, selectedItem, selectedImageUrl, onConfirm, onCancel }: DeleteConfirmDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onCancel}
          />
          
          {/* Centered Winner Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Yellow banner header like reference */}
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-t-2xl px-6 py-4 text-center shadow-lg">
                <h2 className="text-xl font-black text-black flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6" />
                  We have a winner!
                </h2>
              </div>

              {/* Body */}
              <div className="bg-card rounded-b-2xl border border-border/30 border-t-0 shadow-2xl">
                <div className="p-8 text-center">
                  {/* Winner image */}
                  {selectedImageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                      className="mb-4"
                    >
                      <img
                        src={selectedImageUrl}
                        alt={selectedItem}
                        className="w-24 h-32 mx-auto rounded-2xl object-cover border-2 border-primary/40 shadow-xl"
                      />
                    </motion.div>
                  )}

                  {/* Winner name - large and prominent */}
                  <motion.h3
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-3xl md:text-4xl font-black text-foreground break-words leading-tight mb-8"
                  >
                    {selectedItem}
                  </motion.h3>

                  {/* Buttons - Close and Remove like reference */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-end gap-3"
                  >
                    <Button
                      onClick={onCancel}
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground font-semibold px-6"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={onConfirm}
                      className="bg-primary hover:bg-primary/90 text-white font-bold px-6 rounded-lg"
                    >
                      Remove
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmDialog;
