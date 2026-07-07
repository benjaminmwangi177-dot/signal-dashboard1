import React from 'react';

const TF_LABELS = ['1m', '5m', '15m', '1h', '4h', 'D'];

export default function TimeframeBar({ alignment }) {
  if (!alignment) return null;
  return (
    <div className="flex items-center gap-0.5">
      {TF_LABELS.map(tf => {
        const dir = alignment[tf];
        const bg = dir === 'BUY' ? 'bg-emerald-400' : dir === 'SELL' ? 'bg-red-400' : 'bg-slate-600';
        return (
          <div key={tf} className="flex flex-col items-center gap-0.5" title={`${tf}: ${dir || 'N/A'}`}>
            <div className={`w-3 h-1.5 rounded-sm ${bg} transition-colors`} />
            <span className="text-[8px] text-muted-foreground font-mono">{tf}</span>
          </div>
        );
      })}
    </div>
  );
}