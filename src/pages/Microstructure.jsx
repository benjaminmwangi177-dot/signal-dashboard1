import React, { useMemo } from 'react';
import { getMicrostructureData } from '@/lib/advancedTools';
import { Layers } from 'lucide-react';

export default function Microstructure() {
  const data = useMemo(() => getMicrostructureData(), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Layers className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Market Microstructure</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {data.map(d => (
          <div key={d.symbol} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono font-bold text-sm">{d.symbol}</span>
              <span className="text-xs text-muted-foreground truncate">{d.name}</span>
            </div>

            {/* CVD */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                <span>Cumulative Volume Delta</span>
                <span className={`font-mono ${d.cvd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{d.cvd >= 0 ? '+' : ''}{d.cvd}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-red-500/30" style={{ width: `${d.sell_pressure}%` }} />
                <div className="bg-emerald-500/30" style={{ width: `${d.buy_pressure}%` }} />
              </div>
              <div className="flex justify-between text-[10px] mt-0.5">
                <span className="text-red-400">Sell {d.sell_pressure}%</span>
                <span className="text-emerald-400">Buy {d.buy_pressure}%</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-secondary/50 px-2 py-1.5">
                <div className="text-[9px] text-muted-foreground uppercase">Delta Vol</div>
                <div className={`font-mono font-bold ${d.delta_volume >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{d.delta_volume >= 0 ? '+' : ''}{d.delta_volume}</div>
              </div>
              <div className="rounded-lg bg-secondary/50 px-2 py-1.5">
                <div className="text-[9px] text-muted-foreground uppercase">Footprint Imb.</div>
                <div className={`font-mono font-bold ${d.footprint_imbalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{d.footprint_imbalance >= 0 ? '+' : ''}{d.footprint_imbalance}</div>
              </div>
            </div>

            {/* Alerts */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {d.absorption && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">Absorption Detected</span>}
              {d.iceberg_detected && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">Iceberg Orders</span>}
              {!d.absorption && !d.iceberg_detected && <span className="text-[10px] text-muted-foreground">No anomalies</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}