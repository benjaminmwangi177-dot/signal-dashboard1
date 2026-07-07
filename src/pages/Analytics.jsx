import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { STRATEGIES } from '@/lib/constants';
import { BarChart3, Trophy, Target, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const [signals, setSignals] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Signal.list('-created_date', 200).catch(() => []),
      base44.entities.PaperTrade.list('-created_date', 200).catch(() => []),
    ]).then(([s, t]) => {
      setSignals(s);
      setTrades(t);
      setLoading(false);
    });
  }, []);

  const strategyPerf = useMemo(() => {
    return STRATEGIES.map(s => {
      const strats = signals.filter(sig => sig.strategy_name === s.name);
      const wins = strats.filter(sig => sig.outcome === 'win').length;
      const total = strats.filter(sig => sig.outcome && sig.outcome !== 'pending').length;
      return {
        name: s.shortName,
        fullName: s.name,
        signals: strats.length,
        winRate: total > 0 ? Math.round(wins / total * 100) : 0,
        color: s.color,
      };
    });
  }, [signals]);

  const directionBreakdown = useMemo(() => {
    const buy = signals.filter(s => s.direction === 'BUY').length;
    const sell = signals.filter(s => s.direction === 'SELL').length;
    const neutral = signals.filter(s => s.direction === 'NEUTRAL').length;
    return [
      { name: 'Buy', value: buy, color: '#10b981' },
      { name: 'Sell', value: sell, color: '#ef4444' },
      { name: 'Neutral', value: neutral, color: '#64748b' },
    ].filter(d => d.value > 0);
  }, [signals]);

  const closedTrades = trades.filter(t => t.status !== 'open');
  const wins = closedTrades.filter(t => t.status === 'closed_win').length;
  const overallWinRate = closedTrades.length > 0 ? Math.round(wins / closedTrades.length * 100) : 0;
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl_pips || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h1 className="font-heading font-bold text-xl">Performance Analytics</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Target} label="Total Signals" value={signals.length} color="text-blue-400" />
        <SummaryCard icon={Trophy} label="Paper Win Rate" value={`${overallWinRate}%`} color={overallWinRate >= 55 ? 'text-emerald-400' : 'text-red-400'} />
        <SummaryCard icon={BarChart3} label="Paper P&L" value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(1)}`} color={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <SummaryCard icon={Clock} label="Confirmed" value={signals.filter(s => s.signal_type === 'confirmed').length} color="text-amber-400" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy performance */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Signals by Strategy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strategyPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 16%, 18%)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="signals" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Direction breakdown */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Direction Breakdown</h3>
          {directionBreakdown.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={directionBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {directionBreakdown.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 16%, 18%)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">No signal data yet</div>
          )}
          <div className="flex items-center justify-center gap-4 mt-2">
            {directionBreakdown.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy leaderboard */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategy Leaderboard</h3>
        </div>
        <div className="divide-y divide-border/50">
          {strategyPerf.sort((a, b) => b.signals - a.signals).map((s, idx) => (
            <div key={s.name} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono w-4">#{idx + 1}</span>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium">{s.fullName}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-muted-foreground">{s.signals} signals</span>
                <span className={s.winRate >= 55 ? 'text-emerald-400' : 'text-muted-foreground'}>{s.winRate}% win</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono font-bold text-2xl ${color}`}>{value}</div>
    </div>
  );
}