import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface List {
  id: string;
  title: string;
}

interface ListSelectorProps {
  lists: List[];
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
}

const ListSelector = ({ lists, selectedListId, onSelectList }: ListSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedList = lists.find(l => l.id === selectedListId);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between border-white/20 bg-secondary/30 text-foreground"
      >
        <span className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          {selectedList ? selectedList.title : 'Select a list to save deleted items'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-20"
          >
            {lists.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No lists yet. Create one in Saved Lists!
              </div>
            ) : (
              lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => {
                    onSelectList(list.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedListId === list.id
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-secondary/50 text-foreground'
                  }`}
                >
                  {list.title}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListSelector;
