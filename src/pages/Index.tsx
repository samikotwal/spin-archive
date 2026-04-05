import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ArrowUpDown, X, ChevronRight, ChevronLeft, Trophy, Pencil, LayoutGrid, Menu, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpinningWheel from '@/components/SpinningWheel';
import WheelInput from '@/components/WheelInput';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ListSelector from '@/components/ListSelector';
import { useWheelData } from '@/hooks/useWheelData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLenis } from '@/hooks/useLenis';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const Index = () => {
  useLenis();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [results, setResults] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    wheelItems, lists, selectedListId, setSelectedListId,
    addWheelItems, removeWheelItem, deleteAndSaveToList, clearAllItems,
  } = useWheelData();

  const handleSpinEnd = (item: string, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) setResults(prev => [selectedItem, ...prev]);
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
    clearAllItems().then(() => {
      if (newItems.length > 0) addWheelItems(newItems.map(name => ({ name })));
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

  // --- Sub-components ---

  const TabBar = () => (
    <div className="flex shrink-0">
      {(['entries', 'results'] as const).map(tab => (
        <motion.button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 relative transition-colors ${
            activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {tab === 'entries' ? <Pencil className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
          {tab}
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {tab === 'entries' ? wheelItems.length : results.length}
          </span>
          {activeTab === tab && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" transition={spring} />
          )}
        </motion.button>
      ))}
    </div>
  );

  const ActionBar = () => (
    <div className="flex gap-2 p-3 shrink-0">
      {activeTab === 'entries' ? (
        <>
          <motion.div whileTap={{ scale: 0.93 }} className="flex-1">
            <Button variant="outline" size="sm" onClick={shuffleItems}
              className="w-full rounded-xl text-xs gap-1.5 h-8 border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
              <Shuffle className="w-3 h-3" /> Shuffle
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.93 }} className="flex-1">
            <Button variant="outline" size="sm" onClick={sortItems}
              className="w-full rounded-xl text-xs gap-1.5 h-8 border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
              <ArrowUpDown className="w-3 h-3" /> Sort
            </Button>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div whileTap={{ scale: 0.93 }} className="flex-1">
            <Button variant="outline" size="sm" onClick={() => setResults(prev => [...prev].sort((a, b) => a.localeCompare(b)))}
              className="w-full rounded-xl text-xs gap-1.5 h-8 border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
              <ArrowUpDown className="w-3 h-3" /> Sort
            </Button>
          </motion.div>
          {results.length > 0 && (
            <motion.div whileTap={{ scale: 0.93 }}>
              <Button variant="outline" size="sm" onClick={() => setResults([])}
                className="rounded-xl text-xs gap-1.5 h-8 border-destructive/20 text-destructive hover:bg-destructive/10">
                <X className="w-3 h-3" /> Clear
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  const ResultsList = () => (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground/50 font-medium">No winners yet</p>
          <p className="text-xs text-muted-foreground/30 mt-1">Spin the wheel to see results!</p>
        </motion.div>
      ) : (
        results.map((item, i) => (
          <motion.div
            key={`r-${i}-${item}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: i * 0.03 }}
            className="group flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/10 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-default"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
              i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-muted text-muted-foreground'
            }`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </div>
            <span className="flex-1 text-sm text-foreground font-semibold truncate">{item}</span>
          </motion.div>
        ))
      )}
    </div>
  );

  const PanelContent = () => (
    <div className="flex-1 min-h-0 overflow-hidden">
      {activeTab === 'entries' ? (
        <WheelInput items={wheelItems} onUpdateItems={handleUpdateItems} onRemoveItem={removeWheelItem} onClearAll={clearAllItems} />
      ) : (
        <ResultsList />
      )}
    </div>
  );

  const SaveListBar = () => (
    <div className="shrink-0 border-t border-border/10 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="w-3 h-3 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Save removed to</p>
      </div>
      <ListSelector lists={lists} selectedListId={selectedListId} onSelectList={setSelectedListId} />
    </div>
  );

  /* ============ MOBILE ============ */
  if (isMobile) {
    return (
      <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={spring}
          className="h-12 flex items-center justify-between px-4 bg-card/80 backdrop-blur-xl border-b border-border/10 shrink-0 z-40"
        >
          <motion.h1 whileTap={{ scale: 0.95 }} className="text-sm font-black text-foreground" onClick={() => navigate('/')}>
            🎡 Spin Wheel
          </motion.h1>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </motion.header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="bg-card/95 backdrop-blur-xl border-b border-border/10 overflow-hidden shrink-0 z-30"
            >
              <div className="p-2 flex flex-col gap-0.5">
                {[{ label: 'Explore', path: '/explore' }, { label: 'Saved Lists', path: '/saved' }, { label: 'Dashboard', path: '/dashboard' }].map(item => (
                  <motion.button key={item.path} whileTap={{ scale: 0.97 }}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    className="text-left text-sm text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl hover:bg-primary/5 transition-colors">
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wheel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="flex-1 flex items-center justify-center min-h-0 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
          <SpinningWheel items={wheelItems} onSpinEnd={handleSpinEnd} isSpinning={isSpinning} setIsSpinning={setIsSpinning} />
        </motion.div>

        {/* Bottom panel */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={spring}
          className="shrink-0 bg-card/95 backdrop-blur-xl border-t border-border/10 rounded-t-2xl"
          style={{ maxHeight: '42vh' }}
        >
          <TabBar />
          <ActionBar />
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(42vh - 100px)' }}>
            <PanelContent />
          </div>
          <SaveListBar />
        </motion.div>

        <DeleteConfirmDialog isOpen={showDeleteDialog} selectedItem={selectedItem || ''} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
      </div>
    );
  }

  /* ============ DESKTOP ============ */
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="h-12 flex items-center justify-between px-5 bg-card/80 backdrop-blur-xl border-b border-border/10 shrink-0 z-40"
      >
        <motion.h1 whileTap={{ scale: 0.95 }} className="text-sm font-black text-foreground cursor-pointer" onClick={() => navigate('/')}>
          🎡 Spin Wheel
        </motion.h1>
        <div className="flex items-center gap-1">
          {[{ label: 'Explore', path: '/explore' }, { label: 'Saved', path: '/saved' }, { label: 'Dashboard', path: '/dashboard' }].map(item => (
            <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={() => navigate(item.path)}
                className="text-muted-foreground hover:text-foreground text-xs h-8 px-3 rounded-xl hover:bg-primary/5">
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.header>

      <div className="flex-1 flex min-h-0 relative">
        {/* Wheel area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
          }} />
          <SpinningWheel items={wheelItems} onSpinEnd={handleSpinEnd} isSpinning={isSpinning} setIsSpinning={setIsSpinning} />
        </motion.div>

        {/* Panel toggle */}
        <motion.button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-4 z-30 w-8 h-8 rounded-full bg-card border border-border/20 flex items-center justify-center text-muted-foreground shadow-lg hover:text-foreground hover:border-primary/30 transition-colors"
          style={{ right: panelOpen ? '360px' : '12px' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
        >
          {panelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>

        {/* Right panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ ...spring, stiffness: 250 }}
              className="shrink-0 bg-card/95 backdrop-blur-xl border-l border-border/10 flex flex-col overflow-hidden"
            >
              <TabBar />
              <ActionBar />
              <PanelContent />
              <SaveListBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmDialog isOpen={showDeleteDialog} selectedItem={selectedItem || ''} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
    </div>
  );
};

export default Index;
