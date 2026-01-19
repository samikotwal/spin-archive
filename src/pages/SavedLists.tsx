import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FolderOpen, ChevronRight, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingParticles from '@/components/FloatingParticles';
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';

const SavedLists = () => {
  useLenis();
  const navigate = useNavigate();
  const { lists, createList, deleteList, getListItems } = useWheelData();
  const [isCreating, setIsCreating] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [listItems, setListItems] = useState<Record<string, { id: string; value: string; deleted_at: string }[]>>({});

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    await createList(newListTitle.trim());
    setNewListTitle('');
    setIsCreating(false);
  };

  const handleExpandList = async (listId: string) => {
    if (expandedListId === listId) {
      setExpandedListId(null);
      return;
    }
    
    setExpandedListId(listId);
    if (!listItems[listId]) {
      const items = await getListItems(listId);
      setListItems(prev => ({ ...prev, [listId]: items }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background bg-animated-gradient overflow-x-hidden">
      <FloatingParticles />

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.h1 
              className="text-2xl font-black text-gradient-primary flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <FolderOpen className="w-6 h-6" />
              Saved Lists
            </motion.h1>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-primary to-accent text-white font-bold rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Create List Modal */}
        <AnimatePresence>
          {isCreating && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
                onClick={() => setIsCreating(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
              >
                <div className="glass-strong rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gradient-primary">Create New List</h2>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCreating(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </div>
                  <Input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="bg-secondary/50 border-white/10 mb-6 rounded-xl py-3"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleCreateList}
                        disabled={!newListTitle.trim()}
                        className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl py-3"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create List
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreating(false)}
                        className="border-white/20 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Lists */}
        {lists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FolderOpen className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            </motion.div>
            <h2 className="text-3xl font-black text-foreground mb-3">No Lists Yet</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your first list to start saving wheel results!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-4 rounded-full text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First List
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {lists.map((list, index) => (
              <motion.div
                key={list.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* List Header */}
                <motion.div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => handleExpandList(list.id)}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                    >
                      <FolderOpen className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{list.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(list.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      animate={{ rotate: expandedListId === list.id ? 90 : 0 }}
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Expanded Items */}
                <AnimatePresence>
                  {expandedListId === list.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-5 space-y-2">
                        {listItems[list.id]?.length === 0 ? (
                          <p className="text-muted-foreground text-center py-6">
                            🎯 No items saved to this list yet
                          </p>
                        ) : (
                          listItems[list.id]?.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                            >
                              <span className="text-foreground font-medium">{item.value}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.deleted_at).toLocaleDateString()}
                              </span>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SavedLists;
