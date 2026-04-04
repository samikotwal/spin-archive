import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ArrowUpDown, X, ChevronRight, ChevronLeft, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpinningWheel from '@/components/SpinningWheel';
import WheelInput from '@/components/WheelInput';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ListSelector from '@/components/ListSelector';
import { useWheelData } from '@/hooks/useWheelData';

const Index = () => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [results, setResults] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);

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
    if (selectedItem) setResults(prev => [...prev, selectedItem]);
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

  return (
    <div className="h-screen flex flex-col bg-[#1a1a2e] overflow-hidden">
      {/* Minimal top bar */}
      <header className="h-11 flex items-center justify-between px-4 bg-[#16162a] border-b border-white/5 shrink-0">
        <h1 className="text-sm font-bold text-white/90 cursor-pointer" onClick={() => navigate('/')}>
          🎡 Wheel of Fortune
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('/explore')}
            className="text-white/50 hover:text-white text-xs h-7 px-2">Explore</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/saved')}
            className="text-white/50 hover:text-white text-xs h-7 px-2">Saved</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}
            className="text-white/50 hover:text-white text-xs h-7 px-2">Dashboard</Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Wheel area */}
        <div className="flex-1 flex items-center justify-center relative"
          style={{ background: 'radial-gradient(ellipse at center, #2a1a3e 0%, #1a1a2e 70%)' }}>
          <SpinningWheel
            items={wheelItems}
            onSpinEnd={handleSpinEnd}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        </div>

        {/* Collapse/Expand toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-3 z-30 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors"
          style={{ right: panelOpen ? '340px' : '8px' }}
        >
          {panelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Right panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 bg-[#1e1e36] border-l border-white/5 flex flex-col overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex border-b border-white/10 shrink-0">
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'entries'
                      ? 'text-white border-b-2 border-primary'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Entries
                  <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">{wheelItems.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'results'
                      ? 'text-white border-b-2 border-primary'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Results
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-bold">{results.length}</span>
                </button>
              </div>

              {/* Action bar */}
              <div className="flex gap-1.5 p-2.5 border-b border-white/5 shrink-0">
                {activeTab === 'entries' ? (
                  <>
                    <Button variant="default" size="sm" onClick={shuffleItems}
                      className="rounded-md text-xs gap-1 h-7 bg-primary hover:bg-primary/90 text-white">
                      <Shuffle className="w-3 h-3" /> Shuffle
                    </Button>
                    <Button variant="default" size="sm" onClick={sortItems}
                      className="rounded-md text-xs gap-1 h-7 bg-primary hover:bg-primary/90 text-white">
                      <ArrowUpDown className="w-3 h-3" /> Sort
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="default" size="sm" onClick={() => setResults(prev => [...prev].sort((a, b) => a.localeCompare(b)))}
                      className="rounded-md text-xs gap-1 h-7 bg-primary/70 hover:bg-primary/90 text-white">
                      <ArrowUpDown className="w-3 h-3" /> Sort
                    </Button>
                    {results.length > 0 && (
                      <Button variant="default" size="sm" onClick={() => setResults([])}
                        className="rounded-md text-xs gap-1 h-7 bg-white/10 hover:bg-white/20 text-white">
                        <X className="w-3 h-3" /> Clear the list
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'entries' ? (
                  <WheelInput
                    items={wheelItems}
                    onUpdateItems={handleUpdateItems}
                    onRemoveItem={removeWheelItem}
                    onClearAll={clearAllItems}
                  />
                ) : (
                  <div className="h-full overflow-y-auto">
                    {results.length === 0 ? (
                      <div className="text-center py-16 text-white/30">
                        <List className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No results yet</p>
                        <p className="text-xs mt-1">Spin the wheel!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {results.map((item, i) => (
                          <div key={`r-${i}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                            <span className="text-xs text-white/25 font-mono w-5 text-right shrink-0">{i + 1}.</span>
                            <span className="flex-1 text-sm text-white font-medium truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Save list selector at bottom */}
              <div className="shrink-0 border-t border-white/10 p-2.5">
                <p className="text-[10px] text-white/30 mb-1.5 font-medium">Save removed items to:</p>
                <ListSelector lists={lists} selectedListId={selectedListId} onSelectList={setSelectedListId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
