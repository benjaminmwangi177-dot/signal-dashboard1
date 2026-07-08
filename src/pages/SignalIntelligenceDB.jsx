import React, { useMemo, useState } from 'react';
import { getSignalIntelligenceDB } from '@/lib/advancedTools';
import { Database, Filter } from 'lucide-react';

export default function SignalIntelligenceDB() {
  const allRecords = useMemo(() => getSignalIntelligenceDB(), []);
  const [filterDir, setFilterDir] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterSession, setFilterSession] = useState('all');

  const filtered = useMemo(() => {
    return allRecords.filter(r => {
      if (filterDir !== 'all' && r.direction !== filterDir) return false;
      if (filterOutcome !== 'all' && r.outcome !== filterOutcome) return false;
      if (filterSession !== 'all' && r.session !== filterSession) return false;
      return true;
    });
  }, [allRecords, filterDir, filterOutcome, filterSession]);

  const stats = useMemo(() => {
    const wins = filtered.filter(r => r.outcome === 'win').length;
    const losses = filtered.filter(r => r.outcome === 'loss').length;
    const winRate = filtered.length > 0 ? Math.round((wins / filtered.length) * 1000) / 10 : 0;
    const avgPnl = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + r.pnl_pips, 0) / filtered.length * 10) / 10 : 0;
    return { total: filtered.length, wins, losses, winRate, avgPnl };
  }, [filtered]);

  const sessions = ['Sydney', 'Tokyo', 'London', 'New York'];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Signal Intelligence Database</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBox label="Total Signals" value={stats.total} />
        <StatBox label="Wins" value={stats.wins} color="text-emerald-400" />
        <StatBox label="Losses" value={stats.losses} color="text-red-400" />
        <StatBox label="Win Rate" value={`${stats.winRate}%`} />
        <StatBox label="Avg P&L" value={`${stats.avgPnl > 0 ? '+' : ''}${stats.avgPnl} pips`} color={stats.avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <FilterGroup label="Direction" value={filterDir} onChange={setFilterDir} options={['all', 'BUY', 'SELL', 'NEUTRAL']} />
        <FilterGroup label="Outcome" value={filterOutcome} onChange={setFilterOutcome} options={['all', 'win', 'loss', 'breakeven']} />
        <FilterGroup label="Session" value={filterSession} onChange={setFilterSession} options={['all', ...sessions]} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              <th className="px-3 py-2 text-left">Symbol</th>
              <th className="px-3 py-2 text-left">Direction</th>
              <th className="px-3 py-2 text-right">Confidence</th>
              <th className="px-3 py-2 text-left">Regime</th>
              <th className="px-3 py-2 text-left">Session</th>
              <th className="px-3 py-2 text-left">Agreement</th>
              <th className="px-3 py-2 text-left">Grade</th>
              <th className="px-3 py-2 text-left">Outcome</th>
              <th className="px-3 py-2 text-right">P&L</th>
              <th className="px-3 py-2 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-secondary/30">
                <td className="px-3 py-2 font-mono font-bold">{r.symbol}</td>
                <td className={`px-3 py-2 font-mono ${r.direction === 'BUY' ? 'text-emerald-400' : r.direction === 'SELL' ? 'text-red-400' : 'text-muted-foreground'}`}>{r.direction}</td>
                <td className="px-3 py-2 text-right font-mono">{r.confidence}%</td>
                <td className="px-3 py-2 text-xs">{r.regime}</td>
                <td className="px-3 py-2 text-xs">{r.session}</td>
                <td className="px-3 py-2 text-xs font-mono">{r.strategies_agreeing}</td>
                <td className="px-3 py-2 font-mono">{r.grade}</td>
                <td className={`px-3 py-2 text-xs font-mono ${
                  r.outcome === 'win' ? 'text-emerald-400' : r.outcome === 'loss' ? 'text-red-400' : 'text-amber-400'
                }`}>{r.outcome}</td>
                <td className={`px-3 py-2 text-right font-mono ${r.pnl_pips >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.pnl_pips >= 0 ? '+' : ''}{r.pnl_pips}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{r.duration_min}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'text-foreground' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold font-mono mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-secondary text-xs rounded-lg px-2 py-1 border border-border">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}