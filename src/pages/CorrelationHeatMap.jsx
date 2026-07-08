import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { computeCorrelationMatrix, generateHeatMap } from '@/lib/advancedTools';
import { Grid3x3, TrendingUp, TrendingDown } from 'lucide-react';

export default function CorrelationHeatMap() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('correlation');
  const { symbols, matrix } = useMemo(() => computeCorrelationMatrix(), []);
  const heatData = useMemo(() => generateHeatMap(), []);

  function getCorrColor(corr) {
    if (corr > 0.7) return 'bg-emerald-500/80';
    if (corr > 0.3) return 'bg-emerald-500/40';
    if (corr > -0.3) return 'bg-slate-600/40';
    if (corr > -0.7) return 'bg-red-500/40';
    return 'bg-red-500/80';
  }

  function getHeatColor(change) {
    const abs = Math.abs(change);
    const opacity = Math.min(0.9, 0.2 + abs / 4);
    return change > 0 ? `bg-emerald-500/[${opacity}]` : `bg-red-500/[${opacity}]`;
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Grid3x3 className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Correlation & Heat Maps</h1>
      </div>

      <div className="flex gap-1">
        <button onClick={() => setTab('correlation')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === 'correlation' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>Correlation Matrix</button>
        <button onClick={() => setTab('heatmap')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === 'heatmap' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>Market Heat Map</button>
      </div>

      {tab === 'correlation' && (
        <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto">
          <p className="text-xs text-muted-foreground mb-3">Pearson correlation between instruments. Green = positive, Red = negative.</p>
          <table className="text-[10px] font-mono">
            <thead>
              <tr>
                <th className="p-1"></th>
                {symbols.map(s => <th key={s} className="p-1 text-muted-foreground sticky top-0">{s.slice(0, 4)}</th>)}
              </tr>
            </thead>
            <tbody>
              {symbols.map(s1 => (
                <tr key={s1}>
                  <td className="p-1 text-muted-foreground font-bold sticky left-0 bg-card">{s1.slice(0, 4)}</td>
                  {symbols.map(s2 => (
                    <td key={s2} className={`p-1 text-center ${getCorrColor(matrix[s1][s2])} ${s1 === s2 ? 'opacity-30' : ''}`}>
                      <span className="text-[9px]">{matrix[s1][s2].toFixed(2)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'heatmap' && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3">Price change intensity. Brighter = larger move.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {heatData.map(h => (
              <button
                key={h.symbol}
                onClick={() => navigate(`/instrument/${h.symbol}`)}
                className={`rounded-lg p-3 text-left transition-all hover:scale-105 ${h.change_pct > 0 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
                style={{ opacity: 0.3 + Math.abs(h.change_pct) / 4 }}
              >
                <div className="text-xs font-bold font-mono">{h.symbol}</div>
                <div className={`text-sm font-mono font-bold ${h.change_pct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {h.change_pct > 0 ? '+' : ''}{h.change_pct}%
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {h.change_pct > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}