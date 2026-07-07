import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { STRATEGIES } from '@/lib/constants';

export default function StrategyDot({ strategyKey, signal }) {
  const strategy = STRATEGIES.find(s => s.key === strategyKey);
  if (!strategy) return null;

  const bg = signal.direction === 'BUY'
    ? 'bg-emerald-400'
    : signal.direction === 'SELL'
    ? 'bg-red-400'
    : 'bg-slate-600';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>
          <div className={`w-5 h-5 rounded-full ${bg} flex items-center justify-center cursor-default transition-colors`}
            style={{ borderColor: strategy.color, borderWidth: '2px' }}>
            <span className="text-[7px] font-bold text-black font-mono">{strategy.shortName}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border-border">
          <div className="text-xs">
            <p className="font-semibold">{strategy.name}</p>
            <p className="text-muted-foreground">{signal.direction} · {signal.confidence}% · {signal.trend_context}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}