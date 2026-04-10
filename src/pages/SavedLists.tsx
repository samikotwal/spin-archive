import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronDown, X, Loader2, StickyNote, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const NOTE_COLORS = [
  'from-yellow-500/10 to-amber-500/5 border-yellow-500/20',
  'from-blue-500/10 to-cyan-500/5 border-blue-500/20',
  'from-pink-500/10 to-rose-500/5 border-pink-500/20',
  'from-green-500/10 to-emerald-500/5 border-green-500/20',
  'from-purple-500/10 to-violet-500/5 border-purple-500/20',
  'from-orange-500/10 to-red-500/5 border-orange-500/20',
];

const SavedLists = () => {
  useLenis();
  const navigate = useNavigate();
  const { lists, createList, deleteList, getListItems } = useWheelData();
  const [isCreating, setIsCreating] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [listItems, setListItems] = useState<Record<string, { id: string; value: string; deleted_at: string }[]>>({});
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    await createList(newListTitle.trim());
    setNewListTitle('');
    setIsCreating(false);
  };

  const handleExpandList = async (listId: string) => {
    if (expandedListId === listId) { setExpandedListId(null); return; }
    setExpandedListId(listId);
    setLoadingListId(listId);
    const items = await getListItems(listId);
    setListItems(prev => ({ ...prev, [listId]: items }));
    setLoadingListId(null);
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
                  className="bg-muted/50 border-border/20 rounded-xl mb-4"
                />
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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list, index) => {
              const colorClass = NOTE_COLORS[index % NOTE_COLORS.length];
              const isExpanded = expandedListId === list.id;
              const items = listItems[list.id] || [];

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
                    <p className="text-xs text-muted-foreground">
                      {new Date(list.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {items.length > 0 && ` · ${items.length} items`}
                    </p>
                  </div>

                  {/* Expanded items - note-style lines */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={spring}
                        className="border-t border-border/10"
                      >
                        <div className="p-4">
                          {loadingListId === list.id ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                          ) : items.length === 0 ? (
                            <p className="text-center py-6 text-xs text-muted-foreground/50">No items saved yet</p>
                          ) : (
                            <div className="space-y-0">
                              {items.map((item, i) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="flex items-center gap-2.5 py-2.5 border-b border-border/5 last:border-0"
                                >
                                  <span className="text-[10px] text-muted-foreground/30 font-mono w-4 text-right shrink-0">{i + 1}</span>
                                  <span className="flex-1 text-sm text-foreground font-medium">{item.value}</span>
                                  <span className="text-[10px] text-muted-foreground/30">
                                    {new Date(item.deleted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </motion.div>
                              ))}
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
        )}
      </main>
    </div>
  );
};

export default SavedLists;
