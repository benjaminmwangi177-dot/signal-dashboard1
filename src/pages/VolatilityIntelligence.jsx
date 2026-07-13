import React, { useMemo } from 'react';
import { getVolatilityIntelligence } from '@/lib/advancedTools';
import { Activity, Minimize2, Maximize2 } from 'lucide-react';

export default function VolatilityIntelligence() {
  const data = useMemo(() => getVolatilityIntelligence(), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Volatility Intelligence</h1>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:flex items-center gap-4 px-4 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
          <div className="w-20">Symbol</div>
          <div className="w-16">ATR %</div>
          <div className="w-16">ATR %ile</div>
          <div className="w-16">Hist Vol</div>
          <div className="w-16">Impl Vol</div>
          <div className="w-20">Daily Range</div>
          <div className="w-24">Regime</div>
          <div className="ml-auto">Alerts</div>
        </div>
        <div className="divide-y divide-border/50">
          {data.map(d => (
            <div key={d.symbol} className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 px-4 py-2.5 hover:bg-secondary/30">
              <div className="w-20 font-mono font-bold text-sm">{d.symbol}</div>
              <div className="w-16 text-sm font-mono text-cyan-400">{d.atr_percent}%</div>
              <div className="w-16">
                <div className="text-sm font-mono">{d.atr_percentile}%</div>
                <div className="h-1 bg-secondary rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${d.atr_percentile}%` }} />
                </div>
              </div>
              <div className="w-16 text-sm font-mono text-muted-foreground">{d.historical_volatility}%</div>
              <div className="w-16 text-sm font-mono text-muted-foreground">{d.implied_volatility}%</div>
              <div className="w-20 text-sm font-mono">{d.expected_daily_range}%</div>
              <div className="w-24">
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                  d.vol_regime === 'expansion' ? 'bg-red-500/10 text-red-400' :
                  d.vol_regime === 'compression' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-secondary text-muted-foreground'
                }`}>{d.vol_regime}</span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {d.expansion_alert && <span className="flex items-center gap-0.5 text-[10px] text-red-400"><Maximize2 className="w-3 h-3" /> Expansion</span>}
                {d.compression_alert && <span className="flex items-center gap-0.5 text-[10px] text-blue-400"><Minimize2 className="w-3 h-3" /> Compression</span>}
                {!d.expansion_alert && !d.compression_alert && <span className="text-[10px] text-muted-foreground">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}