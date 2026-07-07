import React, { useState, useMemo } from 'react';
import { calculateSupportResistance, generateLiquidityMap } from '@/lib/advancedTools';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import SignalBadge from '@/components/dashboard/SignalBadge';
import { Layers, Droplets } from 'lucide-react';

export default function SupportResistance() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [tab, setTab] = useState('sr');
  const sr = useMemo(() => calculateSupportResistance(symbol), [symbol]);
  const liquidity = useMemo(() => generateLiquidityMap(symbol), [symbol]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        {tab === 'sr' ? <Layers className="w-5 h-5 text-cyan-400" /> : <Droplets className="w-5 h-5 text-blue-400" />}
        <h1 className="font-heading font-bold text-lg">{tab === 'sr' ? 'Dynamic Support & Resistance' : 'Liquidity Map'}</h1>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} className="ml-auto bg-secondary text-xs rounded-lg px-2 py-1 border border-border">
          {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
      </div>

      <div className="flex gap-1">
        <button onClick={() => setTab('sr')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === 'sr' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>Support / Resistance</button>
        <button onClick={() => setTab('liquidity')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === 'liquidity' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>Liquidity Map</button>
      </div>

      {tab === 'sr' && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-center mb-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Pivot Point</div>
            <div className="text-2xl font-mono font-bold">{sr.pivot}</div>
          </div>
          <div className="space-y-2">
            {[...sr.resistances].reverse().map(r => (
              <div key={r.type} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-red-400 w-8">{r.type}</span>
                <div className="flex-1 relative h-8 rounded-lg bg-red-500/10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center px-3 justify-between">
                    <span className="text-sm font-mono font-bold">{r.level}</span>
                    <span className="text-[10px] text-muted-foreground">Strength: {r.strength}% · {r.touches} touches</span>
                  </div>
                  <div className="absolute top-0 left-0 h-full bg-red-500/20" style={{ width: `${r.strength}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground">PIVOT</span>
              <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
            </div>
            {sr.supports.map(s => (
              <div key={s.type} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-emerald-400 w-8">{s.type}</span>
                <div className="flex-1 relative h-8 rounded-lg bg-emerald-500/10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center px-3 justify-between">
                    <span className="text-sm font-mono font-bold">{s.level}</span>
                    <span className="text-[10px] text-muted-foreground">Strength: {s.strength}% · {s.touches} touches</span>
                  </div>
                  <div className="absolute top-0 left-0 h-full bg-emerald-500/20" style={{ width: `${s.strength}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'liquidity' && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3">Liquidity pools above and below current price. Institutional targets.</p>
          <div className="space-y-2">
            {liquidity.sort((a, b) => b.level - a.level).map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded ${l.type === 'sell_side' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                <div className="flex-1 flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div>
                    <div className="text-sm font-mono font-bold">{l.level}</div>
                    <div className="text-[10px] text-muted-foreground">{l.zone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold">{l.liquidity}%</div>
                    <div className="text-[9px] text-muted-foreground">{l.type === 'sell_side' ? 'Sell Side' : 'Buy Side'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}