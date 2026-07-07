import React from 'react';
import SignalBadge from './SignalBadge';

export default function ConsensusMatrix({ weightedVotes }) {
  if (!weightedVotes || weightedVotes.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-secondary/50 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
        <div className="col-span-5">Strategy</div>
        <div className="col-span-3 text-center">Vote</div>
        <div className="col-span-2 text-center">Conf</div>
        <div className="col-span-2 text-right">Weight</div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-border/50">
        {weightedVotes.map(v => (
          <div key={v.strategy_key} className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-secondary/30 transition-colors">
            <div className="col-span-5 flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
              <span className="text-xs font-medium truncate">{v.strategy_name}</span>
            </div>
            <div className="col-span-3 flex justify-center">
              <SignalBadge direction={v.direction} size="sm" />
            </div>
            <div className="col-span-2 text-center">
              <span className="text-xs font-mono">{v.confidence}%</span>
            </div>
            <div className="col-span-2 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${v.weight_pct * 2}%`, backgroundColor: v.color }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold w-10 text-right">{v.weight_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}