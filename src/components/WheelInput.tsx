import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, GripVertical, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WheelInputProps {
  items: string[];
  onUpdateItems: (items: string[]) => void;
  onRemoveItem?: (index: number) => void;
  onClearAll: () => void;
}

interface AnimeInfo { image: string | null; title: string | null; }

// Cache for anime images so we don't re-fetch
const imageCache: Record<string, AnimeInfo> = {};

const fetchAnimeImage = async (name: string): Promise<{ image: string | null; title: string | null }> => {
  const key = name.toLowerCase().trim();
  if (key in imageCache) return imageCache[key];
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=3&sfw=true`);
    if (!res.ok) { imageCache[key] = { image: null, title: null }; return { image: null, title: null }; }
    const json = await res.json();
    const results = json?.data || [];
    // Find best match - check if any result title closely matches input
    const match = results.find((r: any) => {
      const t = (r.title || '').toLowerCase();
      const tEn = (r.title_english || '').toLowerCase();
      return t.includes(key) || key.includes(t.split(' ')[0]) || tEn.includes(key) || key.includes(tEn.split(' ')[0]);
    }) || results[0]; // fallback to first result if input is close enough
    
    if (match && results.length > 0) {
      const img = match.images?.jpg?.small_image_url || match.images?.jpg?.image_url || null;
      const result = { image: img, title: match.title_english || match.title || null };
      imageCache[key] = result;
      return result;
    }
    imageCache[key] = { image: null, title: null };
    return { image: null, title: null };
  } catch {
    imageCache[key] = { image: null, title: null };
    return { image: null, title: null };
  }
};

const WheelInput = ({ items, onUpdateItems, onClearAll }: WheelInputProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [images, setImages] = useState<Record<string, AnimeInfo>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch images for items we haven't fetched yet
  useEffect(() => {
    items.forEach(item => {
      const key = item.toLowerCase().trim();
      if (key in images || loadingImages.has(key) || key.length < 2) return;
      setLoadingImages(prev => new Set(prev).add(key));
      fetchAnimeImage(item).then(info => {
        setImages(prev => ({ ...prev, [key]: info }));
        setLoadingImages(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      });
    });
  }, [items]);

  const handleAdd = () => {
    if (!newValue.trim()) return;
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
    onUpdateItems(items.filter((_, i) => i !== index));
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

  const getAnimeInfo = (item: string): AnimeInfo | null => images[item.toLowerCase().trim()] || null;
  const isLoading = (item: string) => loadingImages.has(item.toLowerCase().trim());

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
            placeholder="Type name... (auto-fetches anime card)"
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
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 px-1">
          📝 Name likho, anime card khud aa jayega! Comma se alag karo.
        </p>
      </div>

      {/* Numbered list */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-muted-foreground/40 font-medium">No entries yet</p>
            <p className="text-xs text-muted-foreground/25 mt-1">Add names above to spin</p>
          </div>
        ) : (
          <div className="divide-y divide-border/5">
            {items.map((item, i) => {
              const info = getAnimeInfo(item);
              const loading = isLoading(item);
              return (
                <motion.div
                  key={`${i}-${item}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="group flex items-center gap-2 px-2 py-1.5 hover:bg-muted/20 transition-colors"
                >
                  {/* Number */}
                  <span className="w-6 text-right text-[10px] text-muted-foreground/30 font-mono shrink-0 select-none">
                    {i + 1}.
                  </span>

                  {/* Image or letter fallback */}
                  <div className={`shrink-0 overflow-hidden flex items-center justify-center ${
                    info?.image ? 'w-10 h-10 rounded-lg' : 'w-8 h-8 rounded'
                  } bg-muted/20`}>
                    {loading ? (
                      <Loader2 className="w-3 h-3 text-muted-foreground/30 animate-spin" />
                    ) : info?.image ? (
                      <img src={info.image} alt={item} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/20 font-bold">
                        {item.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  {editingIndex === i ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={commitEdit}
                      className="flex-1 h-8 bg-transparent text-sm text-foreground font-medium px-1 focus:outline-none border-b border-primary/40"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(i)}
                      className="flex-1 text-sm text-foreground font-medium px-1 cursor-text truncate"
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
              );
            })}
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
