import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BarChart3 } from 'lucide-react';
import type { SpinRecord } from '@/hooks/useSpinHistory';

interface SpinHistoryPanelProps {
  history: SpinRecord[];
  stats: { name: string; wins: number }[];
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const SpinHistoryPanel = ({ history, stats }: SpinHistoryPanelProps) => {
  const topWinners = stats.slice(0, 5);
  const maxWins = topWinners.length > 0 ? topWinners[0].wins : 1;

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4">
      {/* Leaderboard */}
      {topWinners.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Leaderboard</span>
          </div>
          <div className="space-y-1.5">
            {topWinners.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 h-6 rounded-md overflow-hidden bg-muted/30 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.wins / maxWins) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`h-full rounded-md ${
                      i === 0 ? 'bg-yellow-500/30' : i === 1 ? 'bg-gray-400/20' : i === 2 ? 'bg-amber-700/20' : 'bg-primary/10'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-[11px] font-semibold text-foreground truncate flex-1">{s.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{s.wins}×</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent spins */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Recent Spins</span>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No spins yet</p>
        ) : (
          <div className="space-y-1">
            {history.slice(0, 20).map((spin, i) => (
              <motion.div key={spin.id}
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: i * 0.02 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/10"
              >
                <span className="text-xs text-muted-foreground w-4 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <span className="text-xs font-medium text-foreground flex-1 truncate">{spin.winner_value}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(spin.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinHistoryPanel;
