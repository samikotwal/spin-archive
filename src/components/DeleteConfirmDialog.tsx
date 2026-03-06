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
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
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
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50"
            onClick={onCancel}
          />
          
          {/* Center Winner Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.3, rotateY: 90 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
              className="w-full max-w-sm"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-[2px]">
                  <div className="w-full h-full rounded-3xl bg-card" />
                </div>
                
                <div className="relative z-10 p-8 text-center">
                  {/* Trophy icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2, bounce: 0.6 }}
                    className="relative mx-auto mb-4"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  </motion.div>

                  {/* Winner label */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-bold uppercase tracking-[4px] text-primary mb-3"
                  >
                    🎉 Winner 🎉
                  </motion.p>

                  {/* Anime image */}
                  {selectedImageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", delay: 0.35, bounce: 0.5 }}
                      className="mb-4"
                    >
                      <img
                        src={selectedImageUrl}
                        alt={selectedItem}
                        className="w-24 h-32 mx-auto rounded-2xl object-cover border-2 border-primary/40 shadow-xl shadow-primary/20"
                      />
                    </motion.div>
                  )}

                  {/* Winner name */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="mb-6 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                  >
                    <p className="text-xl font-black text-foreground break-words leading-tight">
                      {selectedItem}
                    </p>
                  </motion.div>

                  {/* Question */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground mb-6 text-sm"
                  >
                    Isko wheel se remove karna hai?
                  </motion.p>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3"
                  >
                    <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={onConfirm}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-5 font-bold rounded-xl shadow-lg shadow-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Haan, Remove
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={onCancel}
                        variant="outline"
                        className="w-full border-border/50 text-foreground py-5 rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rehne Do
                      </Button>
                    </motion.div>
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
