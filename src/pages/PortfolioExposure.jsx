import React, { useMemo } from 'react';
import { calculatePortfolioExposure } from '@/lib/advancedTools';
import { Briefcase, AlertCircle } from 'lucide-react';

export default function PortfolioExposure() {
  const data = useMemo(() => calculatePortfolioExposure(), []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Portfolio Exposure</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-lg font-bold font-mono">${data.totalExposure.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Exposure</div>
        </div>
        <div className={`rounded-xl border border-border bg-card p-3`}>
          <div className={`text-lg font-bold font-mono ${data.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {data.totalPnl >= 0 ? '+' : ''}${data.totalPnl}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total P&L</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-lg font-bold font-mono text-amber-400">{data.totalRisk.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Risk</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-lg font-bold font-mono">{data.positions.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Open Positions</div>
        </div>
      </div>

      {data.totalRisk > 10 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
          <AlertCircle className="w-4 h-4" />
          Total portfolio risk exceeds 10% — consider reducing position sizes
        </div>
      )}

      {/* Positions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
          <div className="col-span-3">Instrument</div>
          <div className="col-span-2">Direction</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">P&L</div>
          <div className="col-span-2">Risk</div>
          <div className="col-span-1">% of Port</div>
        </div>
        <div className="divide-y divide-border/50">
          {data.positions.map(p => (
            <div key={p.symbol} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-secondary/30">
              <div className="col-span-3">
                <div className="text-sm font-mono font-bold">{p.symbol}</div>
                <div className="text-[10px] text-muted-foreground">{p.name}</div>
              </div>
              <div className={`col-span-2 text-xs font-bold ${p.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{p.direction}</div>
              <div className="col-span-2 text-sm font-mono">${p.size.toLocaleString()}</div>
              <div className={`col-span-2 text-sm font-mono font-bold ${p.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {p.pnl >= 0 ? '+' : ''}${p.pnl}
              </div>
              <div className="col-span-2 text-xs font-mono text-amber-400">{p.risk_pct}%</div>
              <div className="col-span-1 text-xs font-mono text-muted-foreground">{Math.round(p.size / data.totalExposure * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}