import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderHeart, Sparkles, Menu, X, Shuffle, ArrowUpDown, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpinningWheel from '@/components/SpinningWheel';
import WheelInput from '@/components/WheelInput';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ListSelector from '@/components/ListSelector';
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';

const Index = () => {
  useLenis();
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [results, setResults] = useState<string[]>([]);

  const {
    wheelItems,
    lists,
    selectedListId,
    setSelectedListId,
    addWheelItems,
    removeWheelItem,
    deleteAndSaveToList,
    clearAllItems,
  } = useWheelData();

  const handleSpinEnd = (item: string, index: number) => {
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

  const handleUpdateItems = (newItems: string[]) => {
    // Sync: clear all then add new
    clearAllItems().then(() => {
      if (newItems.length > 0) {
        addWheelItems(newItems.map(name => ({ name })));
      }
    });
  };

  const shuffleItems = () => {
    if (wheelItems.length < 2) return;
    const shuffled = [...wheelItems].sort(() => Math.random() - 0.5);
    clearAllItems().then(() => addWheelItems(shuffled.map(name => ({ name }))));
  };

  const sortItems = () => {
    if (wheelItems.length < 2) return;
    const sorted = [...wheelItems].sort((a, b) => a.localeCompare(b));
    clearAllItems().then(() => addWheelItems(sorted.map(name => ({ name }))));
  };

  const clearResults = () => setResults([]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderHeart, label: 'Saved Lists', path: '/saved' },
    { icon: Sparkles, label: 'Explore', path: '/anime' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Minimal Header */}
      <header className="border-b border-border/20 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
          <h1 className="text-lg font-black text-foreground cursor-pointer" onClick={() => navigate('/')}>
            🎡 Wheel of Fortune
          </h1>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button key={item.path} variant="ghost" size="sm" onClick={() => navigate(item.path)} className="text-muted-foreground hover:text-foreground text-xs">
                <item.icon className="w-3.5 h-3.5 mr-1" />
                {item.label}
              </Button>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/10 px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Button key={item.path} variant="ghost" size="sm" onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} className="w-full justify-start text-sm">
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          {/* Wheel - takes most space */}
          <div className="flex-1 flex items-center justify-center w-full py-4">
            <SpinningWheel
              items={wheelItems}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-[360px] shrink-0">
            {/* List Selector - compact */}
            <div className="bg-card border border-border/20 rounded-xl p-3 mb-3">
              <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderHeart className="w-3.5 h-3.5 text-primary" />
                Save Winners To:
              </h3>
              <ListSelector lists={lists} selectedListId={selectedListId} onSelectList={setSelectedListId} />
            </div>

            {/* Entries/Results Panel */}
            <div className="bg-card border border-border/20 rounded-xl overflow-hidden">
              {/* Tab Header */}
              <div className="flex border-b border-border/20">
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'entries'
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Entries
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{wheelItems.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'results'
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Results
                  <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">{results.length}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 p-2.5 border-b border-border/10">
                <Button variant="outline" size="sm" onClick={shuffleItems} className="rounded-lg text-xs gap-1 h-7 border-border/20">
                  <Shuffle className="w-3 h-3" /> Shuffle
                </Button>
                <Button variant="outline" size="sm" onClick={sortItems} className="rounded-lg text-xs gap-1 h-7 border-border/20">
                  <ArrowUpDown className="w-3 h-3" /> Sort
                </Button>
                {activeTab === 'results' && results.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearResults} className="rounded-lg text-xs gap-1 h-7 border-destructive/30 text-destructive hover:bg-destructive/10 ml-auto">
                    <X className="w-3 h-3" /> Clear
                  </Button>
                )}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'entries' ? (
                  <motion.div key="entries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <WheelInput
                      items={wheelItems}
                      onUpdateItems={handleUpdateItems}
                      onRemoveItem={removeWheelItem}
                      onClearAll={clearAllItems}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="max-h-[400px] overflow-y-auto">
                      {results.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <List className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No results yet</p>
                          <p className="text-xs mt-1">Spin the wheel to get results!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/10">
                          {results.map((item, index) => (
                            <div key={`r-${index}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors">
                              <span className="text-xs text-muted-foreground/40 font-mono w-5 text-right shrink-0">{index + 1}.</span>
                              <span className="flex-1 text-sm text-foreground font-medium truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        selectedItem={selectedItem || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Index;
