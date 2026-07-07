import React, { useMemo } from 'react';
import { getDataQualityStats } from '@/lib/advancedTools';
import { Database, Activity, AlertTriangle } from 'lucide-react';

const STATUS_STYLES = {
  excellent: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  good: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  fair: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  poor: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function DataQualityMonitor() {
  const stats = useMemo(() => getDataQualityStats(), []);
  const avgScore = Math.round(stats.reduce((s, d) => s + d.quality_score, 0) / stats.length);
  const avgLatency = Math.round(stats.reduce((s, d) => s + d.latency_ms, 0) / stats.length);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Data Quality Monitor</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-lg font-bold font-mono text-emerald-400">{avgScore}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Quality</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-lg font-bold font-mono">{avgLatency}ms</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Latency</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-lg font-bold font-mono">{stats.reduce((s, d) => s + d.gaps, 0)}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Data Gaps</div>
        </div>
      </div>

      {/* Per-instrument */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
          <div className="col-span-3">Instrument</div>
          <div className="col-span-2">Quality</div>
          <div className="col-span-2">Latency</div>
          <div className="col-span-2">Gaps</div>
          <div className="col-span-2">Last Update</div>
          <div className="col-span-1">Status</div>
        </div>
        <div className="divide-y divide-border/50">
          {stats.map(d => {
            const st = STATUS_STYLES[d.status];
            return (
              <div key={d.symbol} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-secondary/30">
                <div className="col-span-3">
                  <div className="text-sm font-mono font-bold">{d.symbol}</div>
                  <div className="text-[10px] text-muted-foreground">{d.name}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-bold">{d.quality_score}%</div>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary/30 overflow-hidden">
                      <div className={`h-full ${d.quality_score > 85 ? 'bg-emerald-400' : d.quality_score > 75 ? 'bg-cyan-400' : 'bg-amber-400'}`} style={{ width: `${d.quality_score}%` }} />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-xs font-mono">{d.latency_ms}ms</div>
                <div className="col-span-2 text-xs font-mono">{d.gaps > 0 ? <span className="text-amber-400">{d.gaps} gaps</span> : <span className="text-emerald-400">none</span>}</div>
                <div className="col-span-2 text-xs text-muted-foreground font-mono">{d.last_update}</div>
                <div className="col-span-1"><div className={`w-2 h-2 rounded-full ${st.dot}`} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}