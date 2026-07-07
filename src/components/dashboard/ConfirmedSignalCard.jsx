import React from 'react';
import SignalBadge from './SignalBadge';
import ConfidenceMeter from './ConfidenceMeter';
import { RISK_COLORS } from '@/lib/constants';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export default function ConfirmedSignalCard({ analysis, onClick }) {
  const { confirmed } = analysis;
  if (!confirmed) return null;

  return (
    <button
      onClick={onClick}
      className="signal-confirmed-glow w-full text-left rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/0 p-4 hover:from-amber-500/10 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm">{analysis.symbol}</span>
          <span className="text-xs text-muted-foreground">{analysis.name}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SignalBadge direction={confirmed.direction} confidence={confirmed.confidence} size="md" />
          <div className="text-xs space-y-0.5">
            <div className="text-muted-foreground">{confirmed.trend_context}</div>
            <div className={RISK_COLORS[confirmed.risk_level]}>Risk: {confirmed.risk_level}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConfidenceMeter value={confirmed.confidence} size="lg" />
          <div className="text-right">
            <div className="font-mono text-xs font-semibold text-amber-400">{confirmed.agreement}</div>
            <div className="text-[10px] text-muted-foreground">agree</div>
          </div>
        </div>
      </div>

      {confirmed.qualityFlags?.length > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] text-amber-400">{confirmed.qualityFlags.join(' · ')}</span>
        </div>
      )}
    </button>
  );
}