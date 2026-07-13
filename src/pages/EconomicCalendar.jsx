import React, { useMemo, useState } from 'react';
import { generateEconomicCalendar } from '@/lib/advancedTools';
import { Calendar, Clock } from 'lucide-react';

const IMPACT_COLORS = {
  High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  Low: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' },
};

export default function EconomicCalendar() {
  const [filter, setFilter] = useState('all');
  const events = useMemo(() => generateEconomicCalendar(), []);

  const filtered = filter === 'all' ? events : events.filter(e => e.impact === filter);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Economic Calendar</h1>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{new Date().toLocaleDateString()}</span>
      </div>

      <div className="flex gap-1">
        {['all', 'High', 'Medium', 'Low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>
            {f === 'all' ? 'All Impact' : f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
          <div className="col-span-1">Time</div>
          <div className="col-span-1">Currency</div>
          <div className="col-span-5">Event</div>
          <div className="col-span-1">Impact</div>
          <div className="col-span-2">Forecast</div>
          <div className="col-span-2">Previous</div>
        </div>
        <div className="divide-y divide-border/50">
          {filtered.map(e => {
            const c = IMPACT_COLORS[e.impact];
            return (
              <div key={e.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-secondary/30 transition-colors">
                <div className="col-span-2 md:col-span-1 flex items-center gap-1 text-xs font-mono text-muted-foreground">
                  <Clock className="w-3 h-3" />{e.time}
                </div>
                <div className="col-span-2 md:col-span-1 text-xs font-mono font-bold">{e.currency}</div>
                <div className="col-span-8 md:col-span-5 text-sm">{e.event}</div>
                <div className="col-span-2 md:col-span-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} border ${c.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{e.impact}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-2 text-xs font-mono">{e.forecast}</div>
                <div className="col-span-4 md:col-span-2 text-xs font-mono text-muted-foreground">{e.previous}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}