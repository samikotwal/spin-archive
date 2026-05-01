import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAnimeImage, getImageCache, type AnimeInfo } from '@/lib/animeImageCache';

interface WheelInputProps {
  items: string[];
  onUpdateItems: (items: string[]) => void;
  onRemoveItem?: (index: number) => void;
  onClearAll: () => void;
  onImagesChange?: (images: Record<string, AnimeInfo>) => void;
}

const WheelInput = ({ items, onUpdateItems, onClearAll, onImagesChange }: WheelInputProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [imageVersion, setImageVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef<Set<string>>(new Set());
  const onImagesChangeRef = useRef(onImagesChange);
  const lastNotifiedRef = useRef('');
  onImagesChangeRef.current = onImagesChange;

  const itemsKey = items.join('\n');

  // Notify parent only when image data actually changes
  useEffect(() => {
    const cache = getImageCache();
    const relevant: Record<string, AnimeInfo> = {};
    for (const item of items) {
      const key = item.toLowerCase().trim();
      if (cache[key]) relevant[key] = cache[key];
    }
    const sig = JSON.stringify(relevant);
    if (sig !== lastNotifiedRef.current) {
      lastNotifiedRef.current = sig;
      onImagesChangeRef.current?.(relevant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, imageVersion]);

  // Fetch anime images for items not yet fetched
  useEffect(() => {
    const cache = getImageCache();
    const toFetch: string[] = [];

    for (const item of items) {
      const key = item.toLowerCase().trim();
      if (key.length < 2 || key in cache || fetchedRef.current.has(key)) continue;
      toFetch.push(item);
      fetchedRef.current.add(key);
    }

    if (toFetch.length === 0) return;

    setLoadingKeys(prev => {
      const next = new Set(prev);
      toFetch.forEach(t => next.add(t.toLowerCase().trim()));
      return next;
    });

    let cancelled = false;

    (async () => {
      for (let i = 0; i < toFetch.length; i++) {
        if (cancelled) return;
        if (i > 0) await new Promise(r => setTimeout(r, 500));
        await fetchAnimeImage(toFetch[i]);
        if (cancelled) return;
        setLoadingKeys(prev => {
          const next = new Set(prev);
          next.delete(toFetch[i].toLowerCase().trim());
          return next;
        });
        setImageVersion(v => v + 1);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  const handleAdd = () => {
    if (!newValue.trim()) return;
    // Split on newlines, commas, semicolons, tabs, or pipes
    const parsed = newValue
      .split(/[\n,;\t|]+/)
      .map(s =>
        s
          // strip leading numbering like "1.", "1)", "1-", "(1)", "01:"
          .replace(/^\s*\(?\d+\)?\s*[.)\-:]\s*/, '')
          // strip leading bullets
          .replace(/^\s*[•\-*–—]\s*/, '')
          .trim()
      )
      .filter(s => s.length > 0);
    if (parsed.length > 0) {
      // Dedupe against existing (case-insensitive)
      const existing = new Set(items.map(i => i.toLowerCase()));
      const unique: string[] = [];
      for (const p of parsed) {
        const k = p.toLowerCase();
        if (!existing.has(k)) {
          existing.add(k);
          unique.push(p);
        }
      }
      if (unique.length > 0) onUpdateItems([...items, ...unique]);
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

  const cache = getImageCache();
  const getAnimeInfo = (item: string): AnimeInfo | null => cache[item.toLowerCase().trim()] || null;
  const isItemLoading = (item: string) => loadingKeys.has(item.toLowerCase().trim());

  return (
    <div className="flex flex-col h-full">
      {/* Add input */}
      <div className="p-3 pb-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={newValue.includes('\n') ? Math.min(6, newValue.split('\n').length) : 1}
            placeholder="Type anime name(s)... paste a numbered list — auto-splits"
            className="flex-1 min-h-9 max-h-32 bg-secondary/50 border border-border/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors resize-none"
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
          📝 Anime name likho, image auto fetch hoga! Comma se multiple add karo.
        </p>
      </div>

      {/* Numbered list */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-muted-foreground/40 font-medium">No entries yet</p>
            <p className="text-xs text-muted-foreground/25 mt-1">Add anime names above to spin</p>
          </div>
        ) : (
          <div className="divide-y divide-border/5">
            {items.map((item, i) => {
              const info = getAnimeInfo(item);
              const loading = isItemLoading(item);
              return (
                <motion.div
                  key={`${i}-${item}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="group flex items-center gap-2 px-2 py-1.5 hover:bg-muted/20 transition-colors"
                >
                  <span className="w-6 text-right text-[10px] text-muted-foreground/30 font-mono shrink-0 select-none">
                    {i + 1}.
                  </span>

                  <div className="shrink-0 overflow-hidden flex items-center justify-center w-10 h-10 rounded-lg bg-muted/20">
                    {loading ? (
                      <Loader2 className="w-3 h-3 text-muted-foreground/30 animate-spin" />
                    ) : info?.image ? (
                      <img src={info.image} alt={info.title || item} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground/30 font-bold">
                        {item.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingIndex === i ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={commitEdit}
                        className="w-full h-8 bg-transparent text-sm text-foreground font-medium px-1 focus:outline-none border-b border-primary/40"
                      />
                    ) : (
                      <span
                        onClick={() => startEdit(i)}
                        className="block text-sm text-foreground font-medium px-1 cursor-text truncate"
                      >
                        {info?.title || item}
                      </span>
                    )}
                  </div>

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
