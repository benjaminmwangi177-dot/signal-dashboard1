import React, { useMemo } from 'react';
import { calculateAccuracyStats } from '@/lib/advancedTools';
import { Target, TrendingUp, TrendingDown, Award } from 'lucide-react';

export default function AccuracyDashboard() {
  const stats = useMemo(() => calculateAccuracyStats(), []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Target className="w-5 h-5 text-emerald-400" />
        <h1 className="font-heading font-bold text-lg">Accuracy Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.key} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <h3 className="text-sm font-semibold">{s.name}</h3>
              <span className="ml-auto text-xs font-mono font-bold text-emerald-400">{s.win_rate}%</span>
            </div>
            {/* Win rate bar */}
            <div className="h-2 rounded-full bg-secondary/30 overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400" style={{ width: `${s.win_rate}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground text-[10px]">Signals</div>
                <div className="font-mono font-bold">{s.total_signals}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px]">W / L</div>
                <div className="font-mono font-bold">{s.wins} / {s.losses}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px]">Streak</div>
                <div className={`font-mono font-bold ${s.streak > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.streak > 0 ? `W${s.streak}` : `L${Math.abs(s.streak)}`}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px]">Best Pair</div>
                <div className="font-mono font-bold text-emerald-400">{s.best_pair}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px]">Worst Pair</div>
                <div className="font-mono font-bold text-red-400">{s.worst_pair}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px]">Avg Conf</div>
                <div className="font-mono font-bold">{s.avg_confidence}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}