import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_INSTRUMENTS, STRATEGIES } from '@/lib/constants';
import { BookOpen, Plus, X } from 'lucide-react';

export default function TradeJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: 'EURUSD', direction: 'BUY', entry: '', exit: '', pnl: '', mood: 'Neutral', notes: '', strategy: STRATEGIES[0].name });

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    try {
      const trades = await base44.entities.PaperTrade.list('-created_date', 50);
      setEntries(trades.map(t => ({
        id: t.id,
        date: new Date(t.created_date).toLocaleDateString(),
        symbol: t.instrument_symbol,
        direction: t.direction,
        entry: t.entry_price,
        exit: t.exit_price || '—',
        pnl: t.pnl_percent || 0,
        notes: t.notes || '',
        strategy: 'Manual',
      })));
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await base44.entities.PaperTrade.create({
        instrument_symbol: form.symbol,
        direction: form.direction,
        entry_price: parseFloat(form.entry) || 0,
        exit_price: parseFloat(form.exit) || 0,
        pnl_percent: parseFloat(form.pnl) || 0,
        notes: `${form.mood}: ${form.notes}`,
        status: 'closed_win',
        opened_at: new Date().toISOString(),
      });
      setShowForm(false);
      setForm({ symbol: 'EURUSD', direction: 'BUY', entry: '', exit: '', pnl: '', mood: 'Neutral', notes: '', strategy: STRATEGIES[0].name });
      loadEntries();
    } catch { /* empty */ }
  }

  const stats = useMemo(() => {
    const wins = entries.filter(e => e.pnl > 0).length;
    const losses = entries.filter(e => e.pnl < 0).length;
    const totalPnl = entries.reduce((s, e) => s + (e.pnl || 0), 0);
    return { total: entries.length, wins, losses, winRate: entries.length ? Math.round(wins / entries.length * 100) : 0, totalPnl: Math.round(totalPnl * 100) / 100 };
  }, [entries]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">Trade Journal</h1>
        <button onClick={() => setShowForm(!showForm)} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Close' : 'New Entry'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: stats.total, color: 'text-foreground' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-emerald-400' },
          { label: 'Wins / Losses', value: `${stats.wins} / ${stats.losses}`, color: 'text-cyan-400' },
          { label: 'Total P&L', value: `${stats.totalPnl > 0 ? '+' : ''}${stats.totalPnl}%`, color: stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border">
              {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
            </select>
            <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border">
              <option>BUY</option><option>SELL</option>
            </select>
            <input type="number" step="0.00001" placeholder="Entry Price" value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border" />
            <input type="number" step="0.00001" placeholder="Exit Price" value={form.exit} onChange={e => setForm({ ...form, exit: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border" />
            <input type="number" step="0.1" placeholder="P&L %" value={form.pnl} onChange={e => setForm({ ...form, pnl: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border" />
            <select value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border">
              {['Neutral', 'Confident', 'Cautious', 'FOMO', 'Patient', 'Revenge', 'Disciplined'].map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border">
              {STRATEGIES.map(s => <option key={s.key}>{s.name}</option>)}
            </select>
          </div>
          <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full bg-secondary text-sm rounded-lg px-2 py-2 border border-border min-h-[60px]" />
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30">Save Entry</button>
        </form>
      )}

      {/* Entries */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {entries.map(e => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
              <div className="text-xs text-muted-foreground font-mono w-20">{e.date}</div>
              <div className="text-sm font-mono font-bold w-16">{e.symbol}</div>
              <div className={`text-xs font-bold w-12 ${e.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{e.direction}</div>
              <div className="flex-1 text-xs text-muted-foreground truncate">{e.notes || e.strategy}</div>
              <div className={`text-sm font-mono font-bold ${e.pnl > 0 ? 'text-emerald-400' : e.pnl < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {e.pnl > 0 ? '+' : ''}{e.pnl}%
              </div>
            </div>
          ))}
          {entries.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No journal entries yet. Click "New Entry" to add one.</div>}
        </div>
      </div>
    </div>
  );
}