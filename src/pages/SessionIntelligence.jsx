import React, { useMemo, useState, useEffect } from 'react';
import { getSessionIntelligence, getSessionStats, getSessionVolumeVolatility, getHistoricalSessionPerformance } from '@/lib/advancedTools';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import { Clock, Globe, Zap, Activity, BarChart3, TrendingUp, Timer } from 'lucide-react';

function fmtCountdown(mins) {
  if (mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function SessionIntelligence() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [tick, setTick] = useState(0);

  // Re-run every minute so countdowns stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const sessionData = useMemo(() => getSessionIntelligence(), [tick]);
  const patterns = useMemo(() => getSessionVolumeVolatility(), []);
  const history = useMemo(() => getHistoricalSessionPerformance(), []);
  const stats = useMemo(() => getSessionStats(symbol), [symbol]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Session Intelligence</h1>
        <span className="ml-auto text-sm font-mono text-muted-foreground">
          UTC {String(sessionData.currentHour).padStart(2, '0')}:{String(new Date().getUTCMinutes()).padStart(2, '0')}
        </span>
      </div>

      {/* Session cards with countdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sessionData.sessions.map(s => (
          <div key={s.key} className={`rounded-xl border p-3 ${s.active ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm font-bold">{s.label}</span>
              {s.active
                ? <span className="ml-auto text-[9px] text-emerald-400 font-mono pulse-live">LIVE</span>
                : <span className="ml-auto text-[9px] text-muted-foreground font-mono">CLOSED</span>}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mb-2">
              {String(s.start).padStart(2, '0')}:00–{String(s.end).padStart(2, '0')}:00 UTC
            </div>
            {s.active ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-amber-400">
                  <Timer className="w-3 h-3" /> Closes in {fmtCountdown(s.minutes_to_close)}
                </div>
                <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                <Clock className="w-3 h-3" /> Opens in {fmtCountdown(s.minutes_to_open)}
              </div>
            )}
          </div>
        ))}
      </div>

      {sessionData.isOverlap && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
          <Zap className="w-4 h-4" />
          <span>Session overlap detected — {sessionData.active.map(s => s.label).join(' + ')} active simultaneously. Elevated volume & volatility expected.</span>
        </div>
      )}

      {/* Volume & Volatility patterns */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Volume & Volatility Patterns</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map(p => (
            <div key={p.key} className={`rounded-lg p-3 border ${p.active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-secondary/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-semibold">{p.label}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                  <span>Vol <b className="text-cyan-400">{p.avg_volume}</b></span>
                  <span>Vola <b className="text-amber-400">{p.avg_volatility}</b></span>
                </div>
              </div>
              {/* Hourly bars: volume (cyan) + volatility (amber) */}
              <div className="flex items-end gap-0.5 h-16">
                {p.hours.map(h => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center justify-end gap-0.5" title={`${String(h.hour).padStart(2, '0')}:00 · Vol ${h.volume} · Vola ${h.volatility}`}>
                    <div className="w-full rounded-t bg-amber-500/60" style={{ height: `${h.volatility}%` }} />
                    <div className="w-full rounded-t bg-cyan-400/70" style={{ height: `${h.volume}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[8px] text-muted-foreground font-mono">
                {p.hours.filter((_, i) => i % 2 === 0).map(h => <span key={h.hour}>{String(h.hour).padStart(2, '0')}</span>)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Peak volume hour: <b className="font-mono text-foreground">{String(p.peak_hour).padStart(2, '0')}:00 UTC</b>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-cyan-400/70" /> Volume</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-500/60" /> Volatility</span>
        </div>
      </div>

      {/* Historical session performance */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historical Session Performance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {history.map(h => (
            <div key={h.key} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                <span className="text-xs font-semibold">{h.label}</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Win Rate</span><span className="font-mono font-bold text-emerald-400">{h.win_rate}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Trades</span><span className="font-mono font-bold">{h.total_trades}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Pips</span><span className="font-mono font-bold">{h.avg_pips}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Hold</span><span className="font-mono font-bold">{h.avg_hold_min}m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Peak Hour</span><span className="font-mono font-bold text-cyan-400">{String(h.peak_hour).padStart(2, '0')}:00</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Best Pair</span><span className="font-mono font-bold text-amber-400">{h.best_instrument.symbol}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-instrument session stats */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session Performance — per Instrument</span>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} className="ml-auto bg-secondary text-xs rounded-lg px-2 py-1 border border-border">
            {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          {stats.map(s => (
            <div key={s.key} className={`flex items-center gap-4 p-2 rounded-lg ${s.active ? 'bg-emerald-500/5' : ''}`}>
              <div className="w-24 text-sm font-medium">{s.label}</div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div><span className="text-muted-foreground">Pip Range:</span> <span className="font-mono font-bold">{s.pip_range}</span></div>
                <div><span className="text-muted-foreground">Win Rate:</span> <span className="font-mono font-bold text-emerald-400">{s.win_rate}%</span></div>
                <div><span className="text-muted-foreground">Trades:</span> <span className="font-mono font-bold">{s.trade_count}</span></div>
                <div><span className="text-muted-foreground">Volume:</span> <span className="font-mono font-bold text-cyan-400">{s.avg_volume}</span></div>
                <div><span className="text-muted-foreground">Volatility:</span> <span className="font-mono font-bold text-amber-400">{s.volatility}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}