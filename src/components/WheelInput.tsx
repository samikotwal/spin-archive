import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WheelInputProps {
  items: string[];
  onUpdateItems: (items: string[]) => void;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
}

const WheelInput = ({ items, onUpdateItems, onClearAll }: WheelInputProps) => {
  const [textValue, setTextValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTextValue(items.join('\n'));
  }, [items]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextValue(value);
    const parsed = value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    onUpdateItems(parsed);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative">
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={handleTextChange}
          placeholder={"Enter one name per line\n\nExample:\nNaruto\nOne Piece\nDemon Slayer\nAttack on Titan"}
          className="w-full h-full min-h-[250px] resize-none bg-transparent text-foreground text-sm leading-8 p-4 focus:outline-none placeholder:text-muted-foreground/30 font-medium tracking-wide"
          spellCheck={false}
        />
        {/* Line numbers decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted/5 border-r border-border/5 pointer-events-none">
          <div className="pt-4 px-1.5">
            {textValue.split('\n').slice(0, 50).map((_, i) => (
              <div key={i} className="text-[9px] text-muted-foreground/20 h-8 flex items-center justify-end font-mono">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

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
