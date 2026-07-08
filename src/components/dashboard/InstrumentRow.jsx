import React from 'react';
import SignalBadge from './SignalBadge';
import StrategyDot from './StrategyDot';
import TimeframeBar from './TimeframeBar';
import { STRATEGIES } from '@/lib/constants';
import { ChevronRight } from 'lucide-react';

export default function InstrumentRow({ analysis, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group border border-transparent hover:border-border glass-hover"
    >
      {/* Symbol */}
      <div className="w-24 flex-shrink-0">
        <div className="font-mono font-bold text-sm">{analysis.symbol}</div>
        <div className="text-[10px] text-muted-foreground truncate">{analysis.name}</div>
      </div>

      {/* Strategy dots */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {STRATEGIES.map(s => (
          <StrategyDot key={s.key} strategyKey={s.key} signal={analysis.soloSignals[s.key]} />
        ))}
      </div>

      {/* Timeframe alignment */}
      <div className="hidden md:block flex-shrink-0">
        <TimeframeBar alignment={analysis.tfAlignment} />
      </div>

      {/* Confirmed status */}
      <div className="ml-auto flex items-center gap-2">
        {analysis.confirmed ? (
          <SignalBadge direction={analysis.confirmed.direction} confidence={analysis.confirmed.confidence} size="sm" />
        ) : (
          <span className="text-[10px] text-muted-foreground font-mono">—</span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}