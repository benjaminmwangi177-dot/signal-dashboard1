import React, { useMemo } from 'react';
import { compareStrategies } from '@/lib/advancedTools';
import { GitCompare } from 'lucide-react';

export default function StrategyComparison() {
  const data = useMemo(() => compareStrategies(), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <GitCompare className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">Strategy Comparison Lab</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {data.map(s => (
          <div key={s.key} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span className="font-semibold text-sm">{s.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Metric label="Accuracy" value={`${s.accuracy}%`} />
              <Metric label="Profit Factor" value={s.profit_factor} />
              <Metric label="Avg Move" value={`${s.avg_move_after_signal}`} />
              <Metric label="False Positive" value={`${s.false_positive_rate}%`} />
            </div>

            <div className="mt-3 space-y-1.5">
              <PerfBar label="Trending" value={s.trending_perf} color="bg-emerald-400" />
              <PerfBar label="Ranging" value={s.ranging_perf} color="bg-cyan-400" />
              <PerfBar label="Volatile" value={s.volatile_perf} color="bg-amber-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-2.5 py-1.5">
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-mono font-bold">{value}</div>
    </div>
  );
}

function PerfBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-3 bg-secondary rounded overflow-hidden">
        <div className={`h-full ${color} rounded`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono w-8 text-right">{value}%</span>
    </div>
  );
}