import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, FileText, Search, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WheelInputProps {
  items: string[];
  onAddItems: (items: string[]) => void;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
}

interface AnimeSearchResult {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
}

const WheelInput = ({ items, onAddItems, onRemoveItem, onClearAll }: WheelInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'text' | 'anime'>('text');
  const [animeQuery, setAnimeQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<AnimeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const parseAndAddItems = () => {
    if (!inputValue.trim()) return;
    const parsed = inputValue
      .split(/[\n,]+/)
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
      if (mode === 'text') parseAndAddItems();
      else searchAnime();
    }
  };

  const searchAnime = async () => {
    if (!animeQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeQuery)}&limit=10&sfw=false`);
      const data = await res.json();
      setAnimeResults(data.data || []);
    } catch {
      setAnimeResults([]);
    }
    setIsSearching(false);
  };

  const addAnimeToWheel = (anime: AnimeSearchResult) => {
    onAddItems([anime.title]);
    setAnimeResults(prev => prev.filter(a => a.mal_id !== anime.mal_id));
  };

  return (
    <motion.div
      className="w-full max-w-md"
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Notepad Header */}
      <div className="bg-red-500/80 rounded-t-2xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm">Wheel Notepad</span>
        </div>
        <span className="text-white/60 text-xs">{items.length} items</span>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-white/10 bg-secondary/60">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mode === 'text' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Type Names
        </button>
        <button
          onClick={() => setMode('anime')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mode === 'anime' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          Anime Cards
        </button>
      </div>

      {/* Notepad Body */}
      <div className="bg-secondary/30 backdrop-blur-sm border border-white/5 border-t-0 rounded-b-2xl overflow-hidden">
        {/* Input Area */}
        <div className="p-4 border-b border-white/5">
          {mode === 'text' ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type names here... (comma separated)"
                  className="bg-background/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
                />
                <Button onClick={parseAndAddItems} size="sm" className="bg-gradient-to-r from-primary to-accent text-white shrink-0 rounded-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">📝 Type like a notepad — one per line or comma separated</p>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  value={animeQuery}
                  onChange={(e) => setAnimeQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anime name..."
                  className="bg-background/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
                />
                <Button onClick={searchAnime} size="sm" disabled={isSearching} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shrink-0 rounded-xl">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">🔍 Search anime → click to add name to wheel</p>
            </>
          )}
        </div>

        {/* Anime Search Results */}
        <AnimatePresence>
          {mode === 'anime' && animeResults.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/5 overflow-hidden"
            >
              <div className="p-3 max-h-52 overflow-y-auto space-y-1.5">
                <p className="text-xs text-muted-foreground mb-2">Click to add to wheel:</p>
                {animeResults.map((anime) => (
                  <motion.button
                    key={anime.mal_id}
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addAnimeToWheel(anime)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-primary/10 transition-colors text-left group"
                  >
                    <img
                      src={anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-10 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate group-hover:text-primary transition-colors">{anime.title}</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notepad Lines — Items List */}
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">Your notepad is empty</p>
              <p className="text-xs mt-1">Add items to spin the wheel!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 px-4 py-2.5 group hover:bg-primary/5 transition-colors"
                >
                  <span className="text-xs text-muted-foreground/40 font-mono w-5 text-right shrink-0">{index + 1}.</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                  <span className="flex-1 text-sm text-foreground truncate">{item}</span>
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

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-3 border-t border-white/10">
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
