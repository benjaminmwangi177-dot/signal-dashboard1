import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSignalQueue } from '@/lib/advancedTools';
import SignalBadge from '@/components/dashboard/SignalBadge';
import { ListOrdered, Clock } from 'lucide-react';

const STATUS_STYLES = {
  ready: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Ready' },
  forming: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Forming' },
  watching: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Watching' },
};

export default function SignalQueue() {
  const navigate = useNavigate();
  const queue = useMemo(() => generateSignalQueue(), []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <ListOrdered className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Signal Queue</h1>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{queue.length} signals queued</span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
          <div className="col-span-1">#</div>
          <div className="col-span-2">Symbol</div>
          <div className="col-span-2">Direction</div>
          <div className="col-span-2">Confidence</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Queued</div>
        </div>
        <div className="divide-y divide-border/50">
          {queue.map(s => {
            const st = STATUS_STYLES[s.status];
            const ago = Math.round((Date.now() - new Date(s.queued_at).getTime()) / 60000);
            return (
              <button key={s.id} onClick={() => navigate(`/instrument/${s.symbol}`)} className="w-full grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-secondary/30 text-left">
                <div className="col-span-1 text-xs font-mono text-muted-foreground">{s.queue_position}</div>
                <div className="col-span-2">
                  <div className="text-sm font-mono font-bold">{s.symbol}</div>
                  <div className="text-[10px] text-muted-foreground">{s.name}</div>
                </div>
                <div className="col-span-2"><SignalBadge direction={s.ic.final_direction} size="sm" /></div>
                <div className="col-span-2 text-sm font-mono font-bold">{s.ic.institutional_confidence}%</div>
                <div className="col-span-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span></div>
                <div className="col-span-3 text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{ago}m ago</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}