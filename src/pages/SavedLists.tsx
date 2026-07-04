import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronDown, X, Loader2, StickyNote, FileText, Undo2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchAnimeImage, getImageCache, type AnimeInfo } from '@/lib/animeImageCache';
import { parseEntries } from '@/lib/parseEntries';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const NOTE_COLORS = [
  'from-yellow-500/10 to-amber-500/5 border-yellow-500/20',
  'from-blue-500/10 to-cyan-500/5 border-blue-500/20',
  'from-pink-500/10 to-rose-500/5 border-pink-500/20',
  'from-green-500/10 to-emerald-500/5 border-green-500/20',
  'from-purple-500/10 to-violet-500/5 border-purple-500/20',
  'from-orange-500/10 to-red-500/5 border-orange-500/20',
];

interface SavedItem {
  id: string;
  value: string;
  deleted_at: string;
}

const SavedLists = () => {
  useLenis();
  const navigate = useNavigate();
  const { lists, createList, deleteList, getListItems, addWheelItems, wheelItems, updateListCategory } = useWheelData();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListCategory, setNewListCategory] = useState('');
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [listItems, setListItems] = useState<Record<string, SavedItem[]>>({});
  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [addInputs, setAddInputs] = useState<Record<string, string>>({});
  const [imageVersion, setImageVersion] = useState(0);
  const [previewItems, setPreviewItems] = useState<Record<string, SavedItem[]>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  // Unique category chips derived from all lists (case-insensitive keys, display first-seen casing).
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lists) {
      const cat = (l as unknown as { category: string | null }).category;
      if (cat && cat.trim()) {
        const k = cat.trim().toLowerCase();
        if (!map.has(k)) map.set(k, cat.trim());
      }
    }
    return Array.from(map.values()).sort();
  }, [lists]);

  const filteredLists = useMemo(() => {
    if (activeCategory === 'all') return lists;
    if (activeCategory === 'uncategorized') {
      return lists.filter(l => !(l as unknown as { category: string | null }).category);
    }
    return lists.filter(l => {
      const cat = (l as unknown as { category: string | null }).category;
      return (cat || '').trim().toLowerCase() === activeCategory.toLowerCase();
    });
  }, [lists, activeCategory]);

  // Lazy-fetch preview items (first 4) for every list to power the category preview thumbnails.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const list of lists) {
        if (cancelled) return;
        if (previewItems[list.id]) continue;
        const items = await getListItems(list.id);
        items.sort((a, b) => new Date(a.deleted_at).getTime() - new Date(b.deleted_at).getTime());
        if (cancelled) return;
        setPreviewItems(prev => ({ ...prev, [list.id]: items.slice(0, 4) }));
        // Kick off image fetches for the preview values
        const cache = getImageCache();
        for (const it of items.slice(0, 4)) {
          const key = it.value.toLowerCase().trim();
          if (!(key in cache)) {
            fetchAnimeImage(it.value).then(() => setImageVersion(v => v + 1));
            await new Promise(r => setTimeout(r, 350));
          }
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists]);

  // Whenever a list is expanded, also warm images for its visible items.
  useEffect(() => {
    if (!expandedListId) return;
    const items = listItems[expandedListId] || [];
    let cancelled = false;
    (async () => {
      const cache = getImageCache();
      for (const it of items) {
        if (cancelled) return;
        const key = it.value.toLowerCase().trim();
        if (key in cache) continue;
        await fetchAnimeImage(it.value);
        if (cancelled) return;
        setImageVersion(v => v + 1);
        await new Promise(r => setTimeout(r, 400));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedListId, listItems]);

  const cache = getImageCache();
  const getInfo = (name: string): AnimeInfo | null => cache[name.toLowerCase().trim()] || null;
  // Reference imageVersion to recompute on cache updates.
  void imageVersion;

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    await createList(newListTitle.trim(), newListCategory.trim() || null);
    setNewListTitle('');
    setNewListCategory('');
    setIsCreating(false);
  };

  const refreshList = async (listId: string) => {
    const items = await getListItems(listId);
    // Sort ascending by date so numbering #1 = first added.
    items.sort((a, b) => new Date(a.deleted_at).getTime() - new Date(b.deleted_at).getTime());
    setListItems(prev => ({ ...prev, [listId]: items }));
    setPreviewItems(prev => ({ ...prev, [listId]: items.slice(0, 4) }));
  };

  const handleExpandList = async (listId: string) => {
    if (expandedListId === listId) { setExpandedListId(null); return; }
    setExpandedListId(listId);
    setLoadingListId(listId);
    await refreshList(listId);
    setLoadingListId(null);
  };

  const handleAddItem = async (listId: string) => {
    const raw = addInputs[listId] || '';
    if (!raw.trim()) return;

    // Parse multiple entries (newlines, commas, inline numbered markers) in order.
    const parsed = parseEntries(raw, 'smart');
    if (parsed.length === 0) return;

    const existing = listItems[listId] || [];
    const existingKeys = new Set(existing.map(i => i.value.toLowerCase().trim()));
    const toInsert: string[] = [];
    const skipped: string[] = [];
    for (const p of parsed) {
      const k = p.toLowerCase().trim();
      if (!k) continue;
      if (existingKeys.has(k)) { skipped.push(p); continue; }
      existingKeys.add(k);
      toInsert.push(p);
    }

    if (toInsert.length === 0) {
      toast({ title: 'Duplicates skipped', description: `All ${skipped.length} item(s) already in this list`, variant: 'destructive' });
      return;
    }

    // Insert one-by-one so deleted_at ordering matches the pasted sequence.
    for (const value of toInsert) {
      const { error } = await supabase
        .from('deleted_items')
        .insert({ value, list_id: listId });
      if (error) {
        toast({ title: 'Error', description: `Failed to add "${value}"`, variant: 'destructive' });
        break;
      }
      // Tiny delay so timestamps differ and sort is stable.
      await new Promise(r => setTimeout(r, 5));
    }

    setAddInputs(prev => ({ ...prev, [listId]: '' }));
    await refreshList(listId);
    toast({
      title: 'Added',
      description: skipped.length > 0
        ? `Added ${toInsert.length}, skipped ${skipped.length} duplicate(s)`
        : `Added ${toInsert.length} item(s)`,
    });
  };

  const handleRemoveSavedItem = async (listId: string, item: SavedItem) => {
    const { error } = await supabase
      .from('deleted_items')
      .delete()
      .eq('id', item.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      return;
    }
    setListItems(prev => ({
      ...prev,
      [listId]: (prev[listId] || []).filter(i => i.id !== item.id),
    }));
  };

  const handleRestoreToWheel = async (listId: string, item: SavedItem) => {
    // Avoid duplicate on the wheel
    if (wheelItems.some(w => w.toLowerCase() === item.value.toLowerCase())) {
      toast({ title: 'Already on wheel', description: `"${item.value}" is already an entry` });
      return;
    }
    await addWheelItems([{ name: item.value }]);
    await handleRemoveSavedItem(listId, item);
    toast({ title: 'Restored', description: `"${item.value}" added back to the wheel` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/10"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={() => navigate('/wheel')} className="text-muted-foreground hover:text-foreground rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <div>
              <h1 className="text-lg font-black text-foreground flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary" /> Saved Lists
              </h1>
              <p className="text-xs text-muted-foreground">{lists.length} lists</p>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.93 }}>
            <Button onClick={() => setIsCreating(true)} size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-9 px-4">
              <Plus className="w-4 h-4 mr-1.5" /> New
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Create modal */}
      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsCreating(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={spring}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
            >
              <div className="bg-card rounded-2xl p-6 border border-border/20 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-foreground">New List</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-xl">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="List name..." autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  className="bg-muted/50 border-border/20 rounded-xl mb-3"
                />
                <Input
                  value={newListCategory} onChange={(e) => setNewListCategory(e.target.value)}
                  placeholder="Category (e.g. Anime, Movies) — optional"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  list="category-suggestions"
                  className="bg-muted/50 border-border/20 rounded-xl mb-4"
                />
                <datalist id="category-suggestions">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
                <div className="flex gap-2">
                  <Button onClick={handleCreateList} disabled={!newListTitle.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)} className="border-border/20 rounded-xl">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {lists.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <h2 className="text-xl font-black text-foreground mb-2">No lists yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create a list to save your wheel results</p>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsCreating(true)} className="bg-primary text-primary-foreground font-bold rounded-xl px-6">
                <Plus className="w-4 h-4 mr-2" /> Create First List
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <>
          {/* Category filter chips */}
          {(categories.length > 0 || lists.some(l => !(l as unknown as {category: string|null}).category)) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {(['all', ...categories, 'uncategorized'] as string[]).map(cat => {
                const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                const count = cat === 'all'
                  ? lists.length
                  : cat === 'uncategorized'
                    ? lists.filter(l => !(l as unknown as {category: string|null}).category).length
                    : lists.filter(l => ((l as unknown as {category: string|null}).category || '').toLowerCase() === cat.toLowerCase()).length;
                if (cat === 'uncategorized' && count === 0) return null;
                return (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/30 text-muted-foreground border-border/20 hover:bg-muted/50'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat === 'uncategorized' ? 'Uncategorized' : cat}
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </motion.button>
                );
              })}
            </div>
          )}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLists.map((list, index) => {
              const listCategory = (list as unknown as { category: string | null }).category;
              const colorClass = NOTE_COLORS[index % NOTE_COLORS.length];
              const isExpanded = expandedListId === list.id;
              const items = listItems[list.id] || [];
              const preview = previewItems[list.id] || [];
              const previewCount = preview.length;

              return (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, ...spring }}
                  layout
                  className={`bg-gradient-to-br ${colorClass} border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => handleExpandList(list.id)}
                >
                  {/* Category preview thumbnails */}
                  {previewCount > 0 && (
                    <div className="grid grid-cols-4 gap-px bg-black/20 border-b border-border/10">
                      {preview.map((p) => {
                        const info = getInfo(p.value);
                        return (
                          <div key={p.id} className="aspect-square bg-muted/30 relative overflow-hidden">
                            {info?.image ? (
                              <img src={info.image} alt={p.value} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground/30 font-bold">
                                {p.value.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - previewCount) }).map((_, i) => (
                        <div key={`ph-${i}`} className="aspect-square bg-muted/10" />
                      ))}
                    </div>
                  )}

                  {/* Note header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-foreground leading-tight flex-1 pr-2">{list.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <motion.button whileTap={{ scale: 0.85 }}
                          onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={spring}>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {editingCategoryId === list.id ? (
                        <Input
                          autoFocus
                          value={editingCategoryValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditingCategoryValue(e.target.value)}
                          onBlur={async () => {
                            await updateListCategory(list.id, editingCategoryValue || null);
                            setEditingCategoryId(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              await updateListCategory(list.id, editingCategoryValue || null);
                              setEditingCategoryId(null);
                            } else if (e.key === 'Escape') {
                              setEditingCategoryId(null);
                            }
                          }}
                          placeholder="Category..."
                          list="category-suggestions"
                          className="h-6 text-[11px] px-2 bg-background/60 border-border/20 rounded-full max-w-[140px]"
                        />
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategoryId(list.id);
                            setEditingCategoryValue(listCategory || '');
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            listCategory
                              ? 'bg-primary/15 text-primary border-primary/30'
                              : 'bg-muted/30 text-muted-foreground/60 border-border/20'
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {listCategory || 'add category'}
                        </motion.button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(list.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {items.length > 0 && ` · ${items.length} items`}
                        {items.length === 0 && previewCount > 0 && ` · ${previewCount} items`}
                      </p>
                    </div>
                  </div>


                  {/* Expanded items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={spring}
                        className="border-t border-border/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4">
                          {/* Manual add */}
                          <div className="flex gap-2 mb-3">
                            <Input
                              value={addInputs[list.id] || ''}
                              onChange={(e) => setAddInputs(prev => ({ ...prev, [list.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(list.id); }}
                              placeholder="Add item..."
                              className="h-8 text-xs bg-background/60 border-border/20 rounded-lg"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(list.id)}
                              disabled={!(addInputs[list.id] || '').trim()}
                              className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          {loadingListId === list.id ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                          ) : items.length === 0 ? (
                            <p className="text-center py-6 text-xs text-muted-foreground/50">No items saved yet</p>
                          ) : (
                            <div className="space-y-0">
                              {items.map((item, i) => {
                                const info = getInfo(item.value);
                                return (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group flex items-center gap-2.5 py-2 border-b border-border/5 last:border-0"
                                  >
                                    <span className="text-[10px] text-muted-foreground/40 font-mono w-5 text-right shrink-0 font-bold">
                                      {i + 1}.
                                    </span>
                                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center">
                                      {info?.image ? (
                                        <img src={info.image} alt={item.value} loading="lazy" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground/40 font-bold">
                                          {item.value.charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <span className="flex-1 text-sm text-foreground font-medium truncate">{item.value}</span>
                                    <motion.button
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => handleRestoreToWheel(list.id, item)}
                                      title="Restore to wheel"
                                      className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    >
                                      <Undo2 className="w-3 h-3" />
                                    </motion.button>
                                    <motion.button
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => handleRemoveSavedItem(list.id, item)}
                                      title="Delete from list"
                                      className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <X className="w-3 h-3" />
                                    </motion.button>
                                    <span className="text-[10px] text-muted-foreground/30 hidden sm:inline">
                                      {new Date(item.deleted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SavedLists;
