import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderHeart, Sparkles, Menu, X } from 'lucide-react';
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

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full xl:w-auto space-y-4"
          >
            {/* List Selector */}
            <motion.div 
              className="glass rounded-2xl p-4 w-full max-w-md border border-border/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-primary" />
                Save Winners To:
              </h3>
              <ListSelector lists={lists} selectedListId={selectedListId} onSelectList={setSelectedListId} />
              <p className="text-xs text-muted-foreground mt-2">
                Winner remove karne par isi list me save hoga
              </p>
            </motion.div>

            {/* Wheel Input */}
            <WheelInput
              items={displayItems}
              onAddItems={addWheelItems}
              onRemoveItem={removeWheelItem}
              onClearAll={clearAllItems}
            />
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
