import React from 'react';
import SignalBadge from './SignalBadge';
import RegimeBadge from './RegimeBadge';
import { Clock, Target, Activity } from 'lucide-react';

export default function InstitutionalConfidencePanel({ ic }) {
  if (!ic) return null;

  const dirColor = ic.final_direction === 'BUY'
    ? 'text-emerald-400'
    : ic.final_direction === 'SELL'
    ? 'text-red-400'
    : 'text-slate-400';

  return (
    <div className={`signal-confirmed-glow rounded-xl border ${ic.grade.border} bg-gradient-to-br from-card to-transparent p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-amber-400">
            Institutional Confidence
          </h2>
        </div>
        <div className={`px-3 py-1 rounded-lg ${ic.grade.bg} ${ic.grade.border} border ${ic.grade.color} font-mono font-bold text-lg`}>
          {ic.grade.grade}
        </div>
      </div>

      {/* Final signal */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Final Signal</div>
            <SignalBadge direction={ic.final_direction} size="lg" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Institutional Confidence</div>
            <div className={`font-mono font-bold text-2xl ${dirColor}`}>
              {ic.institutional_confidence}%
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Agreement</div>
          <div className="font-mono font-bold text-lg text-amber-400">{ic.agreement}</div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Metric
          icon={Target}
          label="Expected Move"
          value={`+${ic.expected_move_atr} ATR`}
          color={dirColor}
        />
        <Metric
          icon={Clock}
          label="Hold Time"
          value={ic.expected_holding_time}
        />
        <Metric
          icon={Activity}
          label="Data Quality"
          value={`${ic.data_quality}%`}
          color={ic.data_quality >= 90 ? 'text-emerald-400' : 'text-amber-400'}
        />
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Market Regime</div>
          <RegimeBadge regime={ic.regime} />
        </div>
      </div>

      {/* Buy vs Sell bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-mono">Buy {ic.buy_pct}%</span>
          <span className="text-red-400 font-mono">Sell {ic.sell_pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-red-500/20 overflow-hidden flex">
          <div
            className="h-full bg-emerald-400 transition-all duration-700"
            style={{ width: `${ic.buy_pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color = 'text-foreground' }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={`font-mono font-semibold text-sm ${color}`}>{value}</div>
    </div>
  );
}