import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WheelInputProps {
  items: string[];
  onAddItems: (items: string[]) => void;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
}

const WheelInput = ({ items, onAddItems, onRemoveItem, onClearAll }: WheelInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const parseAndAddItems = () => {
    if (!inputValue.trim()) return;
    
    const parsed = inputValue
      .split(/[\n,]+|(?:\s{2,})|\s+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    if (parsed.length > 0) {
      onAddItems(parsed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      parseAndAddItems();
    }
  };

  return (
    <motion.div 
      className="glass rounded-2xl p-6 w-full max-w-md"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <h3 className="text-xl font-bold mb-4 text-gradient-primary flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Wheel Items
      </h3>
      
      {/* Input Area */}
      <div className="flex gap-2 mb-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter items (space/comma separated)"
          className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-primary transition-all"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={parseAndAddItems}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white shrink-0 rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground mb-4">
        💡 Tip: Enter multiple items at once like "A B C" or "1, 2, 3"
      </p>

      {/* Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {items.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5 group cursor-pointer"
          >
            <span className="truncate text-foreground font-medium">{item}</span>
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        ))}
        
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <div className="text-4xl mb-2">🎯</div>
            <p>No items yet. Add some to spin!</p>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      {items.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={onClearAll}
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All ({items.length} items)
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WheelInput;
