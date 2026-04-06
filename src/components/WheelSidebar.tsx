import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Globe, Lock, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Wheel } from '@/hooks/useWheels';

interface WheelSidebarProps {
  wheels: Wheel[];
  activeWheelId: string | null;
  onSelect: (id: string) => void;
  onCreate: (title: string) => void;
  onDelete: (id: string) => void;
  onTogglePublic: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };

const WheelSidebar = ({
  wheels, activeWheelId, onSelect, onCreate, onDelete, onTogglePublic,
  collapsed, onToggleCollapse,
}: WheelSidebarProps) => {
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreate(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
  };

  const copyShareCode = (wheel: Wheel) => {
    const url = `${window.location.origin}/wheel?share=${wheel.share_code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(wheel.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 0 }} animate={{ width: 48 }} transition={spring}
        className="shrink-0 bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-3 gap-2"
      >
        <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground hover:bg-primary/20 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </motion.button>
        {wheels.map(w => (
          <motion.button key={w.id} onClick={() => onSelect(w.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
              w.id === activeWheelId ? 'bg-primary text-primary-foreground' : 'bg-sidebar-accent text-sidebar-foreground hover:bg-primary/20'
            }`}>
            {w.title.charAt(0).toUpperCase()}
          </motion.button>
        ))}
        <motion.button onClick={() => { onToggleCollapse(); setIsCreating(true); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
          <Plus className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
      transition={spring}
      className="shrink-0 bg-sidebar-background border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-sidebar-border shrink-0">
        <span className="text-xs font-bold text-sidebar-foreground uppercase tracking-wider">My Wheels</span>
        <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-6 h-6 rounded flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Wheels list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence>
          {wheels.map(w => (
            <motion.div key={w.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={spring}
              onClick={() => onSelect(w.id)}
              className={`group p-2.5 rounded-xl cursor-pointer transition-all ${
                w.id === activeWheelId
                  ? 'bg-primary/15 border border-primary/30'
                  : 'hover:bg-sidebar-accent border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  w.id === activeWheelId ? 'bg-primary text-primary-foreground' : 'bg-sidebar-accent text-sidebar-foreground'
                }`}>
                  🎡
                </div>
                <span className="text-sm font-medium text-sidebar-foreground truncate flex-1">{w.title}</span>
                {w.is_public ? <Globe className="w-3 h-3 text-green-400 shrink-0" /> : <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
              </div>
              {w.id === activeWheelId && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-2 flex gap-1 overflow-hidden">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTogglePublic(w.id); }}
                    className="h-6 text-[10px] px-2 rounded-md">
                    {w.is_public ? 'Make Private' : 'Make Public'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyShareCode(w); }}
                    className="h-6 text-[10px] px-2 rounded-md">
                    {copiedId === w.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(w.id); }}
                    className="h-6 text-[10px] px-2 rounded-md text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {wheels.length === 0 && !isCreating && (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground mb-2">No wheels yet</p>
            <Button size="sm" onClick={() => setIsCreating(true)} className="text-xs h-7 rounded-lg">
              <Plus className="w-3 h-3 mr-1" /> Create First Wheel
            </Button>
          </div>
        )}
      </div>

      {/* Create new */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        {isCreating ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Wheel name..."
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="h-8 text-xs rounded-lg bg-sidebar-accent border-sidebar-border" autoFocus />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleCreate} className="flex-1 h-7 text-xs rounded-lg">Create</Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsCreating(false); setNewTitle(''); }} className="h-7 text-xs rounded-lg">Cancel</Button>
            </div>
          </motion.div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}
            className="w-full h-8 text-xs rounded-lg border-dashed border-sidebar-border hover:border-primary/30 hover:bg-primary/5">
            <Plus className="w-3 h-3 mr-1" /> New Wheel
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default WheelSidebar;
