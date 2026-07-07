import React, { useMemo } from 'react';
import { getPerformanceMetrics } from '@/lib/advancedTools';
import { Gauge, Zap, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function PerformanceOptimizer() {
  const data = useMemo(() => getPerformanceMetrics(), []);

  const metrics = [
    { ...data.engine_latency, label: 'Engine Latency', icon: Zap },
    { ...data.signal_throughput, label: 'Signal Throughput', icon: Activity },
    { ...data.memory_usage, label: 'Memory Usage', icon: Gauge },
    { ...data.cpu_usage, label: 'CPU Usage', icon: Gauge },
    { ...data.cache_hit_rate, label: 'Cache Hit Rate', icon: CheckCircle },
    { ...data.api_calls, label: 'API Calls', icon: Zap },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Gauge className="w-5 h-5 text-emerald-400" />
        <h1 className="font-heading font-bold text-lg">Performance Optimizer</h1>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
              <div className={`w-2 h-2 rounded-full ${m.status === 'good' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <div className="text-lg font-bold font-mono">{m.current}<span className="text-xs text-muted-foreground ml-1">{m.unit}</span></div>
            <div className="text-[10px] text-muted-foreground">Target: {m.target}{m.unit}</div>
          </div>
        ))}
      </div>

      {/* Optimizations */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Optimization Recommendations</h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.optimizations.map(o => (
            <div key={o.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
              {o.applied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
              <div className="flex-1">
                <div className="text-sm font-medium">{o.name}</div>
                <div className="text-[10px] text-muted-foreground">Est. gain: {o.gain}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.impact === 'High' ? 'bg-emerald-500/10 text-emerald-400' : o.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                {o.impact}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.applied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
                {o.applied ? 'Applied' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}