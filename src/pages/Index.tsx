import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderHeart, Sparkles, Menu, X, Shuffle, ArrowUpDown, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpinningWheel from '@/components/SpinningWheel';
import WheelInput from '@/components/WheelInput';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ListSelector from '@/components/ListSelector';
import FloatingParticles from '@/components/FloatingParticles';
import { useWheelData, WheelDisplayItem } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';

const Index = () => {
  useLenis();
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WheelDisplayItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [results, setResults] = useState<WheelDisplayItem[]>([]);

  const {
    displayItems,
    lists,
    selectedListId,
    setSelectedListId,
    addWheelItems,
    removeWheelItem,
    deleteAndSaveToList,
    clearAllItems,
  } = useWheelData();

  const handleSpinEnd = (item: WheelDisplayItem, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      setResults(prev => [...prev, selectedItem]);
    }
    await deleteAndSaveToList(selectedIndex);
    setShowDeleteDialog(false);
    setSelectedItem(null);
    setSelectedIndex(-1);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSelectedItem(null);
    setSelectedIndex(-1);
  };

  const shuffleItems = () => {
    if (displayItems.length < 2) return;
    const shuffled = [...displayItems].sort(() => Math.random() - 0.5);
    clearAllItems().then(() => addWheelItems(shuffled));
  };

  const sortItems = () => {
    if (displayItems.length < 2) return;
    const sorted = [...displayItems].sort((a, b) => a.name.localeCompare(b.name));
    clearAllItems().then(() => addWheelItems(sorted));
  };

  const clearResults = () => setResults([]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderHeart, label: 'Saved Lists', path: '/saved' },
    { icon: Sparkles, label: 'Explore', path: '/' },
  ];

  return (
    <div className="min-h-screen bg-background bg-animated-gradient overflow-x-hidden">
      <FloatingParticles />
      
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="glass sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.h1 className="text-xl md:text-2xl font-black text-gradient-primary" whileHover={{ scale: 1.02 }}>
            🎡 Wheel of Fortune
          </motion.h1>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.div key={item.path} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                <Button variant="ghost" size="sm" onClick={() => navigate(item.path)} className="text-muted-foreground hover:text-foreground hover:bg-secondary/30">
                  <item.icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <motion.div initial={false} animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }} className="md:hidden overflow-hidden border-t border-border/10">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Button key={item.path} variant="ghost" size="sm" onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} className="w-full justify-start text-muted-foreground hover:text-foreground">
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </motion.div>
      </motion.header>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col xl:flex-row items-start justify-center gap-6">
          {/* Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="flex-1 flex justify-center w-full"
          >
            <SpinningWheel
              items={displayItems}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </motion.div>

          {/* Right Panel - Entries/Results */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full xl:w-[420px] space-y-4"
          >
            {/* List Selector */}
            <motion.div 
              className="glass rounded-2xl p-4 border border-border/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-primary" />
                Save Winners To:
              </h3>
              <ListSelector lists={lists} selectedListId={selectedListId} onSelectList={setSelectedListId} />
            </motion.div>

            {/* Entries/Results Tabs Panel */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-2xl">
              {/* Tab Header */}
              <div className="flex border-b border-border/20">
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'entries'
                      ? 'text-foreground border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Entries
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">{displayItems.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'results'
                      ? 'text-foreground border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Results
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">{results.length}</span>
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'entries' ? (
                  <motion.div
                    key="entries"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Action Buttons */}
                    <div className="flex gap-2 p-3 border-b border-border/10">
                      <Button variant="outline" size="sm" onClick={shuffleItems} className="rounded-lg text-xs gap-1.5 border-border/20">
                        <Shuffle className="w-3.5 h-3.5" /> Shuffle
                      </Button>
                      <Button variant="outline" size="sm" onClick={sortItems} className="rounded-lg text-xs gap-1.5 border-border/20">
                        <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                      </Button>
                    </div>

                    <WheelInput
                      items={displayItems}
                      onAddItems={addWheelItems}
                      onRemoveItem={removeWheelItem}
                      onClearAll={clearAllItems}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Results Actions */}
                    <div className="flex gap-2 p-3 border-b border-border/10">
                      <Button variant="outline" size="sm" onClick={sortItems} className="rounded-lg text-xs gap-1.5 border-border/20">
                        <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearResults} className="rounded-lg text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10">
                        <X className="w-3.5 h-3.5" /> Clear the list
                      </Button>
                    </div>

                    {/* Results List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {results.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No results yet</p>
                          <p className="text-xs mt-1">Spin the wheel to get results!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/10">
                          {results.map((item, index) => (
                            <motion.div
                              key={`result-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
                            >
                              <span className="text-xs text-muted-foreground/40 font-mono w-5 text-right shrink-0">{index + 1}.</span>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-8 h-10 rounded-lg object-cover shrink-0 border border-border/20" />
                              ) : (
                                <div className="w-8 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-xs">🏆</div>
                              )}
                              <span className="flex-1 text-sm text-foreground font-medium truncate">{item.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        selectedItem={selectedItem?.name || ''}
        selectedImageUrl={selectedItem?.imageUrl}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Index;
