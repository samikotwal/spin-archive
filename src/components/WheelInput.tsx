import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, FileText, Tv, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WheelDisplayItem } from '@/hooks/useWheelData';

interface WheelInputProps {
  items: WheelDisplayItem[];
  onAddItems: (items: WheelDisplayItem[]) => void;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
}

interface AiringAnime {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
}

const WheelInput = ({ items, onAddItems, onRemoveItem, onClearAll }: WheelInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [airingAnime, setAiringAnime] = useState<AiringAnime[]>([]);
  const [loadingAiring, setLoadingAiring] = useState(false);

  // Fetch currently airing anime on mount
  useEffect(() => {
    const fetchAiring = async () => {
      setLoadingAiring(true);
      try {
        const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const today = days[new Date().getDay()];
        const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${today}&limit=20&sfw=true`);
        const data = await res.json();
        setAiringAnime(data.data || []);
      } catch {
        setAiringAnime([]);
      }
      setLoadingAiring(false);
    };
    fetchAiring();
  }, []);

  // Auto-fetch anime card by name and add to wheel
  const addItemByName = async (name: string) => {
    if (!name.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name.trim())}&limit=1&sfw=true`);
      const data = await res.json();
      const anime = data.data?.[0];
      if (anime) {
        onAddItems([{ name: anime.title, imageUrl: anime.images?.jpg?.image_url }]);
      } else {
        // No match found, add as plain name
        onAddItems([{ name: name.trim() }]);
      }
    } catch {
      onAddItems([{ name: name.trim() }]);
    }
    setIsAdding(false);
  };

  const parseAndAddItems = async () => {
    if (!inputValue.trim()) return;
    const parsed = inputValue
      .split(/[\n,]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    if (parsed.length > 0) {
      setInputValue('');
      // Fetch anime cards for each name
      for (const name of parsed) {
        await addItemByName(name);
        // Rate limit for Jikan API
        if (parsed.length > 1) await new Promise(r => setTimeout(r, 400));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      parseAndAddItems();
    }
  };

  const addAiringAnime = (anime: AiringAnime) => {
    const alreadyExists = items.some(i => i.name === anime.title);
    if (alreadyExists) return;
    onAddItems([{ name: anime.title, imageUrl: anime.images?.jpg?.image_url }]);
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Notepad Header */}
      <div className="bg-gradient-to-r from-primary/80 to-accent/80 rounded-t-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm">Wheel Notepad</span>
        </div>
        <span className="text-white/70 text-xs font-mono">{items.length} items</span>
      </div>

      {/* Notepad Body */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/30 border-t-0 rounded-b-2xl overflow-hidden shadow-2xl">
        {/* Input Area */}
        <div className="p-4 border-b border-border/20">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type anime name... (auto-fetches card)"
              disabled={isAdding}
              className="bg-background/50 border-border/20 text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
            />
            <Button 
              onClick={parseAndAddItems} 
              size="sm" 
              disabled={isAdding || !inputValue.trim()}
              className="bg-gradient-to-r from-primary to-accent text-white shrink-0 rounded-xl"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            📝 Name likho, anime card khud aa jayega! Comma se alag karo multiple ke liye.
          </p>
        </div>

        {/* Currently Airing Section */}
        <div className="border-b border-border/20">
          <button
            className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
            onClick={() => {}}
          >
            <Tv className="w-3.5 h-3.5" />
            Currently Airing — Quick Add
          </button>
          <div className="px-3 pb-3 max-h-40 overflow-y-auto">
            {loadingAiring ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {airingAnime.slice(0, 15).map((anime) => {
                  const isAdded = items.some(i => i.name === anime.title);
                  return (
                    <motion.button
                      key={anime.mal_id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addAiringAnime(anime)}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isAdded 
                          ? 'bg-primary/20 text-primary border border-primary/30 cursor-not-allowed' 
                          : 'bg-secondary/50 text-foreground hover:bg-primary/10 hover:text-primary border border-border/20'
                      }`}
                    >
                      <img src={anime.images?.jpg?.image_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="max-w-[100px] truncate">{anime.title}</span>
                      {isAdded && <span className="text-[10px]">✓</span>}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-sm">Wheel khali hai</p>
              <p className="text-xs mt-1">Name type karo ya airing anime se add karo!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-4 py-2.5 group hover:bg-primary/5 transition-colors"
                >
                  <span className="text-xs text-muted-foreground/40 font-mono w-5 text-right shrink-0">{index + 1}.</span>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-8 h-10 rounded-lg object-cover shrink-0 border border-border/20 shadow-sm" />
                  ) : (
                    <div className="w-8 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs">🎯</div>
                  )}
                  <span className="flex-1 text-sm text-foreground truncate font-medium">{item.name}</span>
                  <motion.div whileHover={{ scale: 1.1 }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => onRemoveItem(index)} className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-3 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Clear All ({items.length})
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WheelInput;
