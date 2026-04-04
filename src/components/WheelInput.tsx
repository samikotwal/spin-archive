import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WheelInputProps {
  items: string[];
  onUpdateItems: (items: string[]) => void;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
}

const WheelInput = ({ items, onUpdateItems, onRemoveItem, onClearAll }: WheelInputProps) => {
  const [textValue, setTextValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [initialized, setInitialized] = useState(false);

  // Sync items to textarea on mount or when items change externally
  useEffect(() => {
    if (!initialized && items.length > 0) {
      setTextValue(items.join('\n'));
      setInitialized(true);
    } else if (items.length === 0 && initialized) {
      setTextValue('');
    }
  }, [items, initialized]);

  // When items change externally (e.g. after remove/shuffle), sync
  useEffect(() => {
    setTextValue(items.join('\n'));
  }, [items]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextValue(value);

    // Parse lines into items
    const parsed = value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    onUpdateItems(parsed);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Textarea - wheelofnames style */}
      <div className="flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={handleTextChange}
          placeholder={"Enter one item per line\n\nExample:\nNaruto\nOne Piece\nDemon Slayer\nJujutsu Kaisen"}
          className="w-full h-full min-h-[300px] resize-none bg-transparent text-foreground text-sm leading-7 p-4 focus:outline-none placeholder:text-muted-foreground/50 font-medium"
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-3 border-t border-border/20">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Clear All ({items.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default WheelInput;
