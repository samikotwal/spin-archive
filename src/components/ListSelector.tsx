import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FolderOpen, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface List {
  id: string;
  title: string;
}

interface ListSelectorProps {
  lists: List[];
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
  getListItems?: (listId: string) => Promise<{ id: string; value: string; deleted_at: string }[]>;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const ListSelector = ({ lists, selectedListId, onSelectList, getListItems }: ListSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [listItems, setListItems] = useState<Record<string, { id: string; value: string; deleted_at: string }[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const selectedList = lists.find(l => l.id === selectedListId);

  const handleExpand = async (listId: string) => {
    if (expandedListId === listId) {
      setExpandedListId(null);
      return;
    }
    setExpandedListId(listId);
    if (!listItems[listId] && getListItems) {
      setLoadingId(listId);
      const items = await getListItems(listId);
      setListItems(prev => ({ ...prev, [listId]: items }));
      setLoadingId(null);
    }
  };

  const handleSelect = (listId: string) => {
    onSelectList(listId);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="w-full justify-between border-border/20 bg-secondary/30 text-foreground text-xs h-9 rounded-xl"
      >
        <span className="flex items-center gap-2 truncate">
          <FolderOpen className="w-3.5 h-3.5 shrink-0" />
          {selectedList ? selectedList.title : 'Select list to save winners'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-away backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -5, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -5, scaleY: 0.95 }}
              transition={spring}
              className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border/20 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[50vh] overflow-y-auto"
              style={{ transformOrigin: 'bottom' }}
            >
            {lists.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                <FolderOpen className="w-6 h-6 mx-auto mb-2 opacity-30" />
                No lists yet. Go to Saved Lists to create one.
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {lists.map((list) => (
                  <div key={list.id}>
                    {/* List header row */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSelect(list.id)}
                        className={`flex-1 text-left px-3 py-2.5 text-sm font-medium transition-colors truncate ${
                          selectedListId === list.id
                            ? 'text-primary bg-primary/5'
                            : 'text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {selectedListId === list.id && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                          {list.title}
                        </span>
                      </button>
                      {getListItems && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleExpand(list.id)}
                          className="px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedListId === list.id ? 'rotate-180' : ''}`} />
                        </motion.button>
                      )}
                    </div>

                    {/* Expanded items */}
                    <AnimatePresence>
                      {expandedListId === list.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={spring}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-2 space-y-0.5">
                            {loadingId === list.id ? (
                              <div className="py-3 text-center">
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                              </div>
                            ) : !listItems[list.id] || listItems[list.id].length === 0 ? (
                              <p className="text-[11px] text-muted-foreground/40 py-2 text-center">No items saved yet</p>
                            ) : (
                              listItems[list.id].map((item, i) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.02 }}
                                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                                >
                                  <span className="w-5 text-right text-[10px] text-muted-foreground/30 font-mono shrink-0">{i + 1}</span>
                                  <span className="text-xs text-foreground font-medium flex-1 truncate">{item.value}</span>
                                  <span className="text-[9px] text-muted-foreground/30 shrink-0">
                                    {new Date(item.deleted_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </span>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListSelector;
