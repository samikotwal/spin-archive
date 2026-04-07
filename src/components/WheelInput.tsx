import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WheelInputProps {
  items: string[];
  onUpdateItems: (items: string[]) => void;
  onRemoveItem?: (index: number) => void;
  onClearAll: () => void;
}

const WheelInput = ({ items, onUpdateItems, onClearAll }: WheelInputProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    if (!newValue.trim()) return;
    // Support comma-separated or newline-separated
    const parsed = newValue
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (parsed.length > 0) {
      onUpdateItems([...items, ...parsed]);
      setNewValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onUpdateItems(next);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    if (editValue.trim()) {
      const next = [...items];
      next[editingIndex] = editValue.trim();
      onUpdateItems(next);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setEditingIndex(null); setEditValue(''); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add input */}
      <div className="p-3 pb-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type name... (comma separated)"
            className="flex-1 h-9 bg-secondary/50 border border-border/20 rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shrink-0 hover:bg-primary/90 transition-colors"
          >
            +
          </motion.button>
        </div>
      </div>

      {/* Numbered list */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto mt-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-muted-foreground/40 font-medium">No entries yet</p>
            <p className="text-xs text-muted-foreground/25 mt-1">Add names above to spin</p>
          </div>
        ) : (
          <div className="divide-y divide-border/5">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={`${i}-${item}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center gap-1 px-2 hover:bg-muted/20 transition-colors"
                >
                  {/* Number */}
                  <span className="w-7 text-right text-xs text-muted-foreground/30 font-mono shrink-0 select-none">
                    {i + 1}.
                  </span>

                  {/* Drag handle */}
                  <GripVertical className="w-3 h-3 text-muted-foreground/15 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

                  {/* Name */}
                  {editingIndex === i ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={commitEdit}
                      className="flex-1 h-9 bg-transparent text-sm text-foreground font-medium px-1 focus:outline-none border-b border-primary/40"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(i)}
                      className="flex-1 h-9 flex items-center text-sm text-foreground font-medium px-1 cursor-text truncate"
                    >
                      {item}
                    </span>
                  )}

                  {/* Remove */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleRemove(i)}
                    className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Clear all */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border-t border-border/10"
        >
          <Button variant="ghost" size="sm" onClick={onClearAll}
            className="w-full text-muted-foreground hover:text-destructive rounded-xl text-xs h-8 hover:bg-destructive/5">
            <RotateCcw className="w-3 h-3 mr-1.5" /> Clear All ({items.length} entries)
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default WheelInput;
