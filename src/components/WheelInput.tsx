import { useState, useRef, useEffect } from 'react';
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
      <div className="flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={handleTextChange}
          placeholder={"Enter one name per line\n\nExample:\nNaruto\nOne Piece\nDemon Slayer"}
          className="w-full h-full min-h-[280px] resize-none bg-transparent text-foreground text-sm leading-8 p-4 focus:outline-none placeholder:text-muted-foreground/40 font-medium"
          spellCheck={false}
        />
      </div>
      {items.length > 0 && (
        <div className="p-2.5 border-t border-border/15">
          <Button variant="outline" size="sm" onClick={onClearAll}
            className="w-full border-border/20 text-muted-foreground hover:text-destructive hover:border-destructive/30 rounded-lg text-xs">
            <RotateCcw className="w-3 h-3 mr-1.5" /> Clear All ({items.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default WheelInput;
