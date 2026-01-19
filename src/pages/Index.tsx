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
import { useWheelData } from '@/hooks/useWheelData';
import { useLenis } from '@/hooks/useLenis';

const Index = () => {
  useLenis();
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    await deleteAndSaveToList(selectedIndex);
    setShowDeleteDialog(false);
    setSelectedItem('');
    setSelectedIndex(-1);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSelectedItem('');
    setSelectedIndex(-1);
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderHeart, label: 'Saved Lists', path: '/saved-lists' },
    { icon: Sparkles, label: 'Anime Finder', path: '/' },
  ];

  return (
    <div className="min-h-screen bg-background bg-animated-gradient overflow-x-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="glass sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1 
            className="text-2xl md:text-3xl font-black text-gradient-primary"
            whileHover={{ scale: 1.02 }}
          >
            🎡 Wheel of Fortune
          </motion.h1>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Button
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className="text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col xl:flex-row items-start justify-center gap-8">
          {/* Wheel Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="flex-1 flex justify-center w-full"
          >
            <SpinningWheel
              items={wheelItems}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full xl:w-auto space-y-6"
          >
            {/* List Selector */}
            <motion.div 
              className="glass rounded-2xl p-6 w-full max-w-md"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FolderHeart className="w-5 h-5 text-primary" />
                Save Deleted Items To:
              </h3>
              <ListSelector
                lists={lists}
                selectedListId={selectedListId}
                onSelectList={setSelectedListId}
              />
              <p className="text-xs text-muted-foreground mt-3">
                When you delete a wheel item, it will be saved to the selected list
              </p>
            </motion.div>

            {/* Wheel Input */}
            <WheelInput
              items={wheelItems}
              onAddItems={addWheelItems}
              onRemoveItem={removeWheelItem}
              onClearAll={clearAllItems}
            />
          </motion.div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        selectedItem={selectedItem}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Index;
