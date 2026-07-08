import React, { useMemo, useState } from 'react';
import { getStatisticalAnalysis } from '@/lib/advancedTools';
import { Sigma } from 'lucide-react';

export default function StatisticalEngine() {
  const data = useMemo(() => getStatisticalAnalysis(), []);
  const [selected, setSelected] = useState(null);
  const detail = data.find(d => d.symbol === selected) || data[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Sigma className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">Statistical Engine</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Instrument list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden lg:col-span-1">
          <div className="px-3 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Instruments</div>
          <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
            {data.map(d => (
              <button key={d.symbol} onClick={() => setSelected(d.symbol)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/30 ${selected === d.symbol ? 'bg-secondary/50' : ''}`}>
                <span className="font-mono font-bold text-sm w-20">{d.symbol}</span>
                <span className="text-xs text-muted-foreground flex-1 truncate">Z: {d.z_score}</span>
                <span className={`text-xs font-mono ${d.mean_reversion_prob > 60 ? 'text-emerald-400' : 'text-muted-foreground'}`}>{d.mean_reversion_prob}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Z-Score" value={detail.z_score} />
              <StatCard label="Mean Rev Prob" value={`${detail.mean_reversion_prob}%`} />
              <StatCard label="Cointegration" value={`${detail.cointegration_score}%`} />
              <StatCard label="Seasonal Tendency" value={detail.seasonal_tendency} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Day-of-Week Statistics</h3>
              <div className="space-y-2">
                {detail.day_of_week.map(d => (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-10 text-muted-foreground">{d.day}</span>
                    <div className="flex-1 h-5 bg-secondary rounded relative overflow-hidden">
                      <div className="h-full bg-purple-500/30 rounded" style={{ width: `${d.win_rate}%` }} />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono">{d.win_rate}% win · {d.avg_move} avg move</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Performance</h3>
              <div className="grid grid-cols-4 gap-2">
                {detail.monthly_stats.map(m => (
                  <div key={m.month} className="rounded-lg bg-secondary/50 p-2 text-center">
                    <div className="text-xs font-mono text-muted-foreground">{m.month}</div>
                    <div className={`text-sm font-bold font-mono ${m.performance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.performance >= 0 ? '+' : ''}{m.performance}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{m.win_rate}% win</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold font-mono mt-1">{value}</div>
    </div>
  );
}