import React, { useMemo } from 'react';
import { getSystemHealth } from '@/lib/advancedTools';
import { Heart, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const STATUS_STYLES = {
  operational: { color: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Operational' },
  degraded: { color: 'text-amber-400', dot: 'bg-amber-400', label: 'Degraded' },
  down: { color: 'text-red-400', dot: 'bg-red-400', label: 'Down' },
};

export default function SystemHealth() {
  const data = useMemo(() => getSystemHealth(), []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 text-emerald-400" />
        <h1 className="font-heading font-bold text-lg">System Health</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-live" />
          <span className="text-xs text-emerald-400 font-mono">{data.overall.toUpperCase()}</span>
          <span className="text-xs text-muted-foreground font-mono">· {data.uptime} uptime</span>
        </div>
      </div>

      {/* Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.services.map(s => {
          const st = STATUS_STYLES[s.status];
          return (
            <div key={s.name} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${st.dot} ${s.status === 'operational' ? 'pulse-live' : ''}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{st.label} · {s.uptime} uptime</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold">{s.latency}ms</div>
                <div className="text-[9px] text-muted-foreground">latency</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incidents */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Incidents</h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.incidents.map((inc, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              {inc.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Info className="w-4 h-4 text-cyan-400" />}
              <div className="flex-1 text-sm">{inc.message}</div>
              <div className="text-xs text-muted-foreground font-mono">{inc.time}</div>
              {inc.resolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}