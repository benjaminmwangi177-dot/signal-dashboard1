import React, { useState, useMemo } from 'react';
import { getExplainabilityData } from '@/lib/advancedTools';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import { Brain } from 'lucide-react';

export default function Explainability() {
  const [symbol, setSymbol] = useState('EURUSD');
  const data = useMemo(() => getExplainabilityData(symbol), [symbol]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Brain className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">Explainability Dashboard</h1>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} className="ml-auto bg-secondary text-sm rounded-lg px-3 py-1.5 border border-border">
          {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Direction</div>
            <div className={`text-2xl font-bold font-mono ${data.final_direction === 'BUY' ? 'text-emerald-400' : data.final_direction === 'SELL' ? 'text-red-400' : 'text-muted-foreground'}`}>
              {data.final_direction}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</div>
            <div className="text-2xl font-bold font-mono">{data.institutional_confidence}%</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Grade</div>
            <div className={`text-2xl font-bold font-mono ${data.grade.color}`}>{data.grade.grade}</div>
          </div>
          <div className="ml-auto">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Regime</div>
            <div className="text-sm font-mono">{data.regime.label}</div>
          </div>
        </div>
      </div>

      {/* Strategy contributions */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Strategy Contributions</h3>
        <div className="space-y-2">
          {data.strategy_contributions.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-mono w-24 truncate">{s.short_name}</span>
              <span className={`text-xs font-mono w-12 ${s.direction === 'BUY' ? 'text-emerald-400' : s.direction === 'SELL' ? 'text-red-400' : 'text-muted-foreground'}`}>{s.direction}</span>
              <div className="flex-1 h-5 bg-secondary rounded relative overflow-hidden">
                <div
                  className={`h-full rounded ${s.contribution > 0 ? 'bg-emerald-500/30' : 'bg-red-500/20'}`}
                  style={{ width: `${Math.abs(s.contribution)}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono">
                  {s.weight_pct}% weight · {s.confidence}% conf
                </span>
              </div>
              <span className={`text-xs font-mono w-12 text-right ${s.contribution > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.contribution > 0 ? '+' : ''}{s.contribution}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Confidence Calculation Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.confidence_breakdown).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-secondary/50 p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
              <div className="text-lg font-bold font-mono mt-1">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}