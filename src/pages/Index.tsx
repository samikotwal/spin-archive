import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ArrowUpDown, X, ChevronRight, ChevronLeft, Trophy, Pencil, BarChart3, Menu, Bookmark, Volume2, VolumeX, Users, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpinningWheel from '@/components/SpinningWheel';
import WheelInput from '@/components/WheelInput';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ListSelector from '@/components/ListSelector';
import WheelSidebar from '@/components/WheelSidebar';
import SpinHistoryPanel from '@/components/SpinHistoryPanel';
import ExportResults from '@/components/ExportResults';
import { useWheelData } from '@/hooks/useWheelData';
import { useWheels } from '@/hooks/useWheels';
import { useSpinHistory } from '@/hooks/useSpinHistory';
import { useSoundEffects } from '@/hooks/useSoundEffects';
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
  const [activeTab, setActiveTab] = useState<'entries' | 'results' | 'history'>('entries');
  const [results, setResults] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [animeImages, setAnimeImages] = useState<Record<string, { image: string | null; title: string | null }>>({});
  const animeImagesRef = useRef('');
  const handleImagesChange = useCallback((images: Record<string, { image: string | null; title: string | null }>) => {
    const sig = JSON.stringify(images);
    if (sig !== animeImagesRef.current) {
      animeImagesRef.current = sig;
      setAnimeImages(images);
    }
  }, []);

  // Legacy wheel data (for non-logged-in users)
  const {
    wheelItems, lists, selectedListId, setSelectedListId,
    addWheelItems, removeWheelItem, deleteAndSaveToList, clearAllItems, getListItems,
  } = useWheelData();

  // New wheels system (for logged-in users)
  const {
    wheels, activeWheel, activeWheelId, setActiveWheelId,
    entryValues, entries,
    createWheel, deleteWheel, togglePublic,
    addEntries, clearEntries, updateEntries,
  } = useWheels();

  const { history, recordSpin, fetchHistory, getWinnerStats } = useSpinHistory();
  const { muted, setMuted, startTicking, stopTicking, playWinnerSound } = useSoundEffects();

  // Use new system if user has wheels, else fallback to legacy
  const currentItems = activeWheel ? entryValues : wheelItems;
  const isUsingNewSystem = !!activeWheel;

  useEffect(() => {
    if (activeWheelId) fetchHistory(activeWheelId);
  }, [activeWheelId, fetchHistory]);

  const handleSpinEnd = (item: string, index: number) => {
    stopTicking();
    playWinnerSound();
    setSelectedItem(item);
    setSelectedIndex(index);
    setShowDeleteDialog(true);

    // Record spin
    if (activeWheelId) recordSpin(activeWheelId, item);
  };

  const handleSpinStart = () => {
    startTicking(4500);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) setResults(prev => [selectedItem, ...prev]);

    if (eliminationMode) {
      if (isUsingNewSystem && entries[selectedIndex]) {
        const entry = entries[selectedIndex];
        if (entry) {
          const newValues = entryValues.filter((_, i) => i !== selectedIndex);
          await updateEntries(newValues);
        }
      } else {
        await deleteAndSaveToList(selectedIndex);
      }
    } else {
      if (!isUsingNewSystem) {
        await deleteAndSaveToList(selectedIndex);
      }
    }

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
    if (isUsingNewSystem) {
      updateEntries(newItems);
    } else {
      clearAllItems().then(() => {
        if (newItems.length > 0) addWheelItems(newItems.map(name => ({ name })));
      });
    }
  };

  const shuffleItems = () => {
    if (currentItems.length < 2) return;
    const shuffled = [...currentItems].sort(() => Math.random() - 0.5);
    handleUpdateItems(shuffled);
  };

  const sortItems = () => {
    if (currentItems.length < 2) return;
    const sorted = [...currentItems].sort((a, b) => a.localeCompare(b));
    handleUpdateItems(sorted);
  };

  const handleClearAll = () => {
    if (isUsingNewSystem) clearEntries();
    else clearAllItems();
  };

  // --- Sub-components ---

  const TabBar = () => (
    <div className="flex shrink-0 border-b border-border/10">
      {(['entries', 'results', 'history'] as const).map(tab => {
        const count = tab === 'entries' ? currentItems.length : tab === 'results' ? results.length : history.length;
        return (
          <motion.button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 relative transition-colors ${
              activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {tab === 'entries' ? <Pencil className="w-3 h-3" /> : tab === 'results' ? <Trophy className="w-3 h-3" /> : <BarChart3 className="w-3 h-3" />}
            {tab}
            {count > 0 && (
              <span className="ml-1 bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{count}</span>
            )}
            {activeTab === tab && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" transition={spring} />
            )}
          </motion.button>
        );
      })}
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
          <motion.div whileTap={{ scale: 0.93 }}>
            <Button variant={eliminationMode ? 'default' : 'outline'} size="sm" onClick={() => setEliminationMode(!eliminationMode)}
              className={`rounded-xl text-xs gap-1.5 h-8 ${eliminationMode ? 'bg-accent text-accent-foreground' : 'border-border/20 hover:bg-accent/10 hover:text-accent hover:border-accent/30'}`}>
              <Zap className="w-3 h-3" />
            </Button>
          </motion.div>
        </>
      ) : activeTab === 'results' ? (
        <>
          <motion.div whileTap={{ scale: 0.93 }} className="flex-1">
            <Button variant="outline" size="sm" onClick={() => setResults(prev => [...prev].sort((a, b) => a.localeCompare(b)))}
              className="w-full rounded-xl text-xs gap-1.5 h-8 border-border/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
              <ArrowUpDown className="w-3 h-3" /> Sort
            </Button>
          </motion.div>
          <ExportResults results={results} history={history} />
          {results.length > 0 && (
            <motion.div whileTap={{ scale: 0.93 }}>
              <Button variant="outline" size="sm" onClick={() => setResults([])}
                className="rounded-xl text-xs gap-1.5 h-8 border-destructive/20 text-destructive hover:bg-destructive/10">
                <X className="w-3 h-3" /> Clear
              </Button>
            </motion.div>
          )}
        </>
      ) : activeTab === 'history' ? (
        <ExportResults results={results} history={history} />
      ) : null}
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
          <motion.div key={`r-${i}-${item}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
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
        <WheelInput items={currentItems} onUpdateItems={handleUpdateItems} onClearAll={handleClearAll} onImagesChange={handleImagesChange} />
      ) : activeTab === 'results' ? (
        <ResultsList />
      ) : (
        <SpinHistoryPanel history={history} stats={getWinnerStats()} />
      )}
    </div>
  );

  const SaveListBar = () => (
    <div className="shrink-0 border-t border-border/10 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="w-3 h-3 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Save removed to</p>
      </div>
      <ListSelector lists={lists} selectedListId={selectedListId} onSelectList={setSelectedListId} getListItems={getListItems} />
    </div>
  );

  const navItems = [
    { label: 'Explore', path: '/explore' },
    { label: 'Saved', path: '/saved' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Multiplayer', path: '/multiplayer' },
  ];

  /* ============ MOBILE ============ */
  if (isMobile) {
    return (
      <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
        <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}
          className="h-12 flex items-center justify-between px-4 bg-card/80 backdrop-blur-xl border-b border-border/10 shrink-0 z-40">
          <motion.h1 whileTap={{ scale: 0.95 }} className="text-sm font-black text-foreground" onClick={() => navigate('/')}>
            🎡 {activeWheel?.title || 'Spin Wheel'}
          </motion.h1>
          <div className="flex items-center gap-1">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMuted(!muted)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={spring} className="bg-card/95 backdrop-blur-xl border-b border-border/10 overflow-hidden shrink-0 z-30">
              <div className="p-2 flex flex-col gap-0.5">
                {navItems.map(item => (
                  <motion.button key={item.path} whileTap={{ scale: 0.97 }}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    className="text-left text-sm text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl hover:bg-primary/5 transition-colors">
                    {item.label}
                  </motion.button>
                ))}
                {/* Wheel selector for mobile */}
                {wheels.length > 0 && (
                  <>
                    <div className="h-px bg-border/10 my-1" />
                    <p className="text-[10px] text-muted-foreground px-4 pt-1 uppercase tracking-wider font-bold">My Wheels</p>
                    {wheels.map(w => (
                      <motion.button key={w.id} whileTap={{ scale: 0.97 }}
                        onClick={() => { setActiveWheelId(w.id); setMobileMenuOpen(false); }}
                        className={`text-left text-sm px-4 py-2 rounded-xl transition-colors ${
                          w.id === activeWheelId ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                        }`}>
                        🎡 {w.title}
                      </motion.button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.1 }}
          className="flex-1 flex items-center justify-center min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
          <SpinningWheel items={currentItems} onSpinEnd={handleSpinEnd} isSpinning={isSpinning} setIsSpinning={setIsSpinning} onSpinStart={handleSpinStart} imageMap={animeImages} />
        </motion.div>

        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={spring}
          className="shrink-0 bg-card/95 backdrop-blur-xl border-t border-border/10 rounded-t-2xl"
          style={{ maxHeight: '42vh' }}>
          <TabBar />
          <ActionBar />
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(42vh - 100px)' }}>
            <PanelContent />
          </div>
          <SaveListBar />
        </motion.div>

        <DeleteConfirmDialog isOpen={showDeleteDialog} selectedItem={selectedItem || ''}
          onConfirm={handleConfirmDelete} onCancel={handleCancelDelete}
          eliminationMode={eliminationMode} />
      </div>
    );
  }

  /* ============ DESKTOP ============ */
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}
        className="h-12 flex items-center justify-between px-5 bg-card/80 backdrop-blur-xl border-b border-border/10 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <motion.h1 whileTap={{ scale: 0.95 }} className="text-sm font-black text-foreground cursor-pointer" onClick={() => navigate('/')}>
            🎡 {activeWheel?.title || 'Spin Wheel'}
          </motion.h1>
          {eliminationMode && (
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> Elimination
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMuted(!muted)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
          {navItems.map(item => (
            <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={() => navigate(item.path)}
                className="text-muted-foreground hover:text-foreground text-xs h-8 px-3 rounded-xl hover:bg-primary/5">
                {item.label === 'Multiplayer' && <Users className="w-3 h-3 mr-1" />}
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.header>

      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar */}
        <WheelSidebar
          wheels={wheels} activeWheelId={activeWheelId}
          onSelect={setActiveWheelId}
          onCreate={(title) => createWheel(title)}
          onDelete={deleteWheel}
          onTogglePublic={togglePublic}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Wheel area */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
          }} />
          <SpinningWheel items={currentItems} onSpinEnd={handleSpinEnd} isSpinning={isSpinning} setIsSpinning={setIsSpinning} onSpinStart={handleSpinStart} imageMap={animeImages} />
        </motion.div>

        {/* Panel toggle */}
        <motion.button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-4 z-30 w-8 h-8 rounded-full bg-card border border-border/20 flex items-center justify-center text-muted-foreground shadow-lg hover:text-foreground hover:border-primary/30 transition-colors"
          style={{ right: panelOpen ? '360px' : '12px' }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring}
        >
          {panelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>

        {/* Right panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 360, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
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

      <DeleteConfirmDialog isOpen={showDeleteDialog} selectedItem={selectedItem || ''}
        onConfirm={handleConfirmDelete} onCancel={handleCancelDelete}
        eliminationMode={eliminationMode} />
    </div>
  );
};

export default Index;
