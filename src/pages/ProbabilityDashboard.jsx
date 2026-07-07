import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateProbabilities } from '@/lib/advancedTools';
import { Target, TrendingUp } from 'lucide-react';

export default function ProbabilityDashboard() {
  const navigate = useNavigate();
  const data = useMemo(() => calculateProbabilities(), []);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Target className="w-5 h-5 text-emerald-400" />
        <h1 className="font-heading font-bold text-lg">Probability Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.slice(0, 12).map(d => (
          <button key={d.symbol} onClick={() => navigate(`/instrument/${d.symbol}`)} className="rounded-xl border border-border bg-card p-4 text-left hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-mono font-bold">{d.symbol}</div>
                <div className="text-[10px] text-muted-foreground">{d.name}</div>
              </div>
              <div className={`text-xs font-bold px-2 py-0.5 rounded ${d.expected_value > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                EV {d.expected_value > 0 ? '+' : ''}{d.expected_value}
              </div>
            </div>
            {/* Win probability bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Win Prob</span>
                <span className="font-mono font-bold text-emerald-400">{d.win_probability}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/30 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400" style={{ width: `${d.win_probability}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
              <div>
                <span className="text-muted-foreground">Kelly:</span>
                <span className="font-mono font-bold ml-1">{(d.kelly_fraction * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-mono font-bold ml-1">{d.ic.institutional_confidence}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}