import React, { useMemo, useState } from 'react';
import { getSessionIntelligence, getSessionStats, TRADING_SESSIONS } from '@/lib/advancedTools';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import { Clock, Globe, Zap } from 'lucide-react';

export default function SessionIntelligence() {
  const [symbol, setSymbol] = useState('EURUSD');
  const sessionData = useMemo(() => getSessionIntelligence(), []);
  const stats = useMemo(() => getSessionStats(symbol), [symbol]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Session Intelligence</h1>
      </div>

      {/* Current time + active sessions */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Market Sessions</span>
          <span className="ml-auto text-sm font-mono">UTC {String(sessionData.currentHour).padStart(2, '0')}:00</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sessionData.sessions.map(s => (
            <div key={s.key} className={`rounded-lg p-3 border ${s.active ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-secondary/30 opacity-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-bold">{s.label}</span>
                {s.active && <span className="ml-auto text-[9px] text-emerald-400 font-mono">LIVE</span>}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">{String(s.start).padStart(2, '0')}:00–{String(s.end).padStart(2, '0')}:00 UTC</div>
              <div className="text-[10px] text-muted-foreground">Volatility: {s.vol}</div>
            </div>
          ))}
        </div>
        {sessionData.isOverlap && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Session overlap detected — elevated volatility expected</span>
          </div>
        )}
      </div>

      {/* Session stats per instrument */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session Performance</span>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} className="ml-auto bg-secondary text-xs rounded-lg px-2 py-1 border border-border">
            {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          {stats.map(s => (
            <div key={s.key} className={`flex items-center gap-4 p-2 rounded-lg ${s.active ? 'bg-emerald-500/5' : ''}`}>
              <div className="w-24 text-sm font-medium">{s.label}</div>
              <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-muted-foreground">Pip Range:</span> <span className="font-mono font-bold">{s.pip_range}</span></div>
                <div><span className="text-muted-foreground">Win Rate:</span> <span className="font-mono font-bold text-emerald-400">{s.win_rate}%</span></div>
                <div><span className="text-muted-foreground">Trades:</span> <span className="font-mono font-bold">{s.trade_count}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}