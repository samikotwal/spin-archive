import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Copy, Check, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useLenis } from '@/hooks/useLenis';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const Multiplayer = () => {
  useLenis();
  const navigate = useNavigate();
  const { room, participants, isHost, createRoom, joinRoom, leaveRoom } = useMultiplayer();
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}
          className="h-12 flex items-center px-4 bg-card/80 backdrop-blur-xl border-b border-border/10 shrink-0">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/wheel')}
            className="mr-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-sm font-black text-foreground">Multiplayer</h1>
        </motion.header>

        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring}
            className="w-full max-w-sm space-y-6">
            <div className="text-center mb-8">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4">🎮</motion.div>
              <h2 className="text-xl font-black text-foreground">Multiplayer Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">Spin with friends in real-time</p>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => createRoom()} className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90">
                <Crown className="w-4 h-4 mr-2" /> Create Room
              </Button>
            </motion.div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/20" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/20" />
            </div>

            <div className="space-y-2">
              <Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter room code" maxLength={6}
                className="h-12 text-center text-lg font-mono font-bold tracking-[0.3em] rounded-xl bg-card border-border/20 uppercase"
                onKeyDown={e => e.key === 'Enter' && joinRoom(joinCode)}
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={() => joinRoom(joinCode)}
                  className="w-full h-10 rounded-xl text-sm font-bold border-border/20">
                  <Users className="w-4 h-4 mr-2" /> Join Room
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}
        className="h-12 flex items-center justify-between px-4 bg-card/80 backdrop-blur-xl border-b border-border/10 shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Room</span>
          <span className="text-sm font-mono font-bold text-primary tracking-wider">{room.code}</span>
          <motion.button onClick={handleCopy} whileTap={{ scale: 0.9 }}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </motion.button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{participants.length} online</span>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" onClick={leaveRoom} className="h-7 text-xs text-destructive hover:text-destructive rounded-lg">
              <LogOut className="w-3 h-3 mr-1" /> Leave
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          {isHost && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">You are the host</span>
            </motion.div>
          )}
          <p className="text-muted-foreground text-sm">
            Share code <span className="font-mono font-bold text-primary">{room.code}</span> with friends
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {participants.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: i * 0.1 }}
                className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </motion.div>
            ))}
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
            <Button onClick={() => navigate('/wheel')} className="rounded-xl">
              Open Wheel →
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Multiplayer;
