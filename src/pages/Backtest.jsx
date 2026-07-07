import React, { useState } from 'react';
import { STRATEGIES, DEFAULT_INSTRUMENTS } from '@/lib/constants';
import { generateBacktestData } from '@/lib/signalEngine';
import { FlaskConical, Play, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Backtest() {
  const [strategy, setStrategy] = useState(STRATEGIES[0].key);
  const [symbol, setSymbol] = useState(DEFAULT_INSTRUMENTS[0].symbol);
  const [lookback, setLookback] = useState('1Y');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  function runBacktest() {
    setRunning(true);
    setTimeout(() => {
      const data = generateBacktestData(strategy, symbol, lookback);
      setResult(data);
      setRunning(false);
    }, 1500);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-xl">Backtesting</h1>
      </div>

      {/* Config */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Strategy</label>
            <select value={strategy} onChange={e => setStrategy(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
              {STRATEGIES.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Instrument</label>
            <select value={symbol} onChange={e => setSymbol(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
              {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol} — {i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Lookback</label>
            <select value={lookback} onChange={e => setLookback(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
              {['6M', '1Y', '2Y', '5Y', '10Y'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runBacktest} disabled={running}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-sm transition-colors">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running ? 'Running...' : 'Run Backtest'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <MetricCard label="Total Trades" value={result.total_trades} />
            <MetricCard label="Win Rate" value={`${result.win_rate}%`} color={result.win_rate >= 55 ? 'text-emerald-400' : 'text-red-400'} />
            <MetricCard label="Profit Factor" value={result.profit_factor} color={result.profit_factor >= 1.5 ? 'text-emerald-400' : 'text-amber-400'} />
            <MetricCard label="Sharpe Ratio" value={result.sharpe_ratio} />
            <MetricCard label="Max Drawdown" value={`${result.max_drawdown}%`} color="text-red-400" />
            <MetricCard label="Expectancy" value={`$${result.expectancy}`} color={result.expectancy > 0 ? 'text-emerald-400' : 'text-red-400'} />
          </div>

          {/* Equity curve */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Equity Curve</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={result.equity_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                <XAxis dataKey="trade" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 16%, 18%)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(215, 15%, 50%)' }}
                />
                <Line type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color = 'text-foreground' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}