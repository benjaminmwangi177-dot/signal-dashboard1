import React, { useState, useMemo, useEffect, useRef } from 'react';
import { generateReplayData, generateSignalReplay } from '@/lib/advancedTools';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import SignalBadge from '@/components/dashboard/SignalBadge';
import { Play, Pause, SkipForward, SkipBack, Rewind, History } from 'lucide-react';

export default function ReplayMode() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [tab, setTab] = useState('chart');
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const candles = useMemo(() => generateReplayData(symbol), [symbol]);
  const signalReplay = useMemo(() => generateSignalReplay(symbol), [symbol]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing && position < candles.length - 1) {
      intervalRef.current = setTimeout(() => setPosition(p => Math.min(candles.length - 1, p + 1)), 500 / speed);
    } else if (position >= candles.length - 1) {
      setPlaying(false);
    }
    return () => clearTimeout(intervalRef.current);
  }, [playing, position, speed, candles.length]);

  useEffect(() => { setPosition(0); setPlaying(false); }, [symbol]);

  const visibleCandles = candles.slice(0, position + 1);
  const currentPrice = candles[position]?.close || 0;
  const minP = Math.min(...candles.map(c => c.low));
  const maxP = Math.max(...candles.map(c => c.high));
  const range = maxP - minP || 0.001;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <History className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">Replay Mode</h1>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} className="bg-secondary text-xs rounded-lg px-2 py-1 border border-border">
          {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
      </div>

      <div className="flex gap-1">
        <button onClick={() => setTab('chart')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === 'chart' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>Chart Replay</button>
        <button onClick={() => setTab('signals')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === 'signals' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'}`}>Signal Replay</button>
      </div>

      {tab === 'chart' && (
        <>
          {/* Candlestick chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-mono">{symbol} · Candle {position + 1}/{candles.length}</div>
              <div className="text-lg font-mono font-bold">{currentPrice.toFixed(5)}</div>
            </div>
            <div className="relative h-64 flex items-end gap-px overflow-hidden">
              {visibleCandles.map((c, i) => {
                const h = ((c.high - c.low) / range) * 100;
                const bodyTop = Math.max(c.open, c.close);
                const bodyBot = Math.min(c.open, c.close);
                const bodyH = Math.max(2, ((bodyTop - bodyBot) / range) * 100);
                const top = 100 - ((c.high - minP) / range) * 100;
                const isUp = c.close >= c.open;
                return (
                  <div key={i} className="relative flex-1 h-full" style={{ minWidth: 4 }}>
                    <div className={`absolute w-px ${isUp ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ top: `${top}%`, height: `${h}%`, left: '50%' }} />
                    <div className={`absolute ${isUp ? 'bg-emerald-400' : 'bg-red-400'}`} style={{
                      top: `${100 - ((bodyTop - minP) / range) * 100}%`,
                      height: `${bodyH}%`,
                      left: '20%', right: '20%',
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <button onClick={() => setPosition(0)} className="p-2 rounded-lg hover:bg-secondary"><Rewind className="w-4 h-4" /></button>
            <button onClick={() => setPosition(p => Math.max(0, p - 1))} className="p-2 rounded-lg hover:bg-secondary"><SkipBack className="w-4 h-4" /></button>
            <button onClick={() => setPlaying(!playing)} className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => setPosition(p => Math.min(candles.length - 1, p + 1))} className="p-2 rounded-lg hover:bg-secondary"><SkipForward className="w-4 h-4" /></button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Speed:</span>
              {[0.5, 1, 2, 4].map(s => (
                <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded text-xs font-mono ${speed === s ? 'bg-purple-500/20 text-purple-400' : 'bg-secondary text-muted-foreground'}`}>{s}x</button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'signals' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historical Signal Replay — {symbol}</h3>
          </div>
          <div className="divide-y divide-border/50">
            {signalReplay.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="text-xs font-mono text-muted-foreground w-12">{s.time}</div>
                <div className="text-xs text-muted-foreground flex-1">{s.strategy}</div>
                <SignalBadge direction={s.direction} confidence={s.confidence} size="sm" />
                <div className={`text-xs font-mono font-bold w-16 text-right ${s.pnl > 0 ? 'text-emerald-400' : s.pnl < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {s.pnl > 0 ? '+' : ''}{s.pnl}R
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${s.outcome === 'win' ? 'bg-emerald-500/10 text-emerald-400' : s.outcome === 'loss' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'}`}>
                  {s.outcome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}