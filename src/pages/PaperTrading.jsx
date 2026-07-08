import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SignalBadge from '@/components/dashboard/SignalBadge';
import { BookOpen, Plus, X } from 'lucide-react';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';
import { useTradingAccount } from '@/lib/useTradingAccount';

export default function PaperTrading() {
  const { toast } = useToast();
  const { balance, loading: accountLoading, updateBalance } = useTradingAccount();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lotSize, setLotSize] = useState('0.1');
  const [form, setForm] = useState({ instrument_symbol: '', direction: 'BUY', entry_price: '', stop_loss: '', take_profit: '', notes: '' });

  useEffect(() => { loadTrades(); }, []);

  async function loadTrades() {
    try {
      const data = await base44.entities.PaperTrade.list('-created_date', 50);
      setTrades(data);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await base44.entities.PaperTrade.create({
        ...form,
        lot_size: parseFloat(lotSize) || 0.1,
        entry_price: parseFloat(form.entry_price),
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : undefined,
        take_profit: form.take_profit ? parseFloat(form.take_profit) : undefined,
        opened_at: new Date().toISOString(),
      });
      setShowForm(false);
      setForm({ instrument_symbol: '', direction: 'BUY', entry_price: '', stop_loss: '', take_profit: '', notes: '' });
      setLotSize('0.1');
      loadTrades();
      toast({ title: 'Paper trade logged' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  }

  async function closeTrade(trade, outcome) {
    try {
      const exitPrice = trade.entry_price * (1 + (Math.random() - 0.4) * 0.02);
      const pnlPips = outcome === 'closed_win' ? Math.abs(exitPrice - trade.entry_price) * 10000 : -Math.abs(exitPrice - trade.entry_price) * 10000;

      // Calculate P&L in dollars (assuming $10 per pip per standard lot for forex)
      const lotSizeValue = parseFloat(trade.lot_size || 0.1);
      const pipValue = 10 * lotSizeValue; // $10 per pip per standard lot
      const pnlDollars = pnlPips * pipValue / 10000;

      // Update the trade
      await base44.entities.PaperTrade.update(trade.id, {
        status: outcome,
        exit_price: parseFloat(exitPrice.toFixed(5)),
        pnl_pips: parseFloat(pnlPips.toFixed(1)),
        pnl_dollars: parseFloat(pnlDollars.toFixed(2)),
        closed_at: new Date().toISOString(),
      });

      // Update account balance
      if (outcome !== 'closed_breakeven') {
        await updateBalance(
          pnlDollars,
          'trade_pnl',
          `${trade.direction} ${trade.instrument_symbol} closed as ${outcome.replace('closed_', '')}`,
          { trade_id: trade.id, symbol: trade.instrument_symbol, direction: trade.direction, pips: pnlPips }
        );
      }

      loadTrades();
      toast({ title: `Trade closed: ${pnlDollars >= 0 ? '+' : ''}$${pnlDollars.toFixed(2)}` });
    } catch (err) {
      toast({ title: 'Error closing trade', variant: 'destructive' });
    }
  }

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status !== 'open');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-400" />
          <h1 className="font-heading font-bold text-xl">Paper Trading</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-semibold text-sm transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Trade'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Balance</div>
          <div className="font-mono font-bold text-lg text-emerald-400">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Open</div>
          <div className="font-mono font-bold text-lg">{openTrades.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Closed</div>
          <div className="font-mono font-bold text-lg">{closedTrades.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Total P&L</div>
          <div className={`font-mono font-bold text-lg ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(1)} pips
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Instrument</label>
              <select value={form.instrument_symbol} onChange={e => setForm({ ...form, instrument_symbol: e.target.value })}
                required className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
                <option value="">Select...</option>
                {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Direction</label>
              <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Lot Size</label>
              <input type="number" step="0.01" min="0.01" required value={lotSize}
                onChange={e => setLotSize(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Entry Price</label>
              <input type="number" step="any" required value={form.entry_price}
                onChange={e => setForm({ ...form, entry_price: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Stop Loss</label>
              <input type="number" step="any" value={form.stop_loss}
                onChange={e => setForm({ ...form, stop_loss: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Take Profit</label>
              <input type="number" step="any" value={form.take_profit}
                onChange={e => setForm({ ...form, take_profit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Notes</label>
              <input type="text" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm">
            Log Trade
          </button>
        </form>
      )}

      {/* Open trades */}
      {openTrades.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open Trades</h3>
          </div>
          <div className="divide-y divide-border/50">
            {openTrades.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <SignalBadge direction={t.direction} />
                  <span className="font-mono font-bold text-sm">{t.instrument_symbol}</span>
                  <span className="text-xs text-muted-foreground font-mono">@ {t.entry_price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => closeTrade(t, 'closed_win')}
                    className="px-2 py-1 text-[10px] rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Win</button>
                  <button onClick={() => closeTrade(t, 'closed_loss')}
                    className="px-2 py-1 text-[10px] rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Loss</button>
                  <button onClick={() => closeTrade(t, 'closed_breakeven')}
                    className="px-2 py-1 text-[10px] rounded bg-slate-500/10 text-slate-400 hover:bg-slate-500/20">B/E</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closed trades */}
      {closedTrades.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trade History</h3>
          </div>
          <div className="divide-y divide-border/50">
            {closedTrades.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <SignalBadge direction={t.direction} />
                  <span className="font-mono text-sm">{t.instrument_symbol}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${t.status === 'closed_win' ? 'text-emerald-400' : t.status === 'closed_loss' ? 'text-red-400' : 'text-slate-400'}`}>
                    {t.pnl_dollars ? `${t.pnl_dollars >= 0 ? '+' : ''}$${t.pnl_dollars.toFixed(2)}` : (t.pnl_pips ? `${t.pnl_pips > 0 ? '+' : ''}${t.pnl_pips} pips` : '—')}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">{t.status?.replace('closed_', '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}