import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SignalBadge from '@/components/dashboard/SignalBadge';
import ConfidenceMeter from '@/components/dashboard/ConfidenceMeter';
import { RISK_COLORS } from '@/lib/constants';
import { Zap, Search, SlidersHorizontal, Brain, Loader2 } from 'lucide-react';
import { generateSignalExplanation } from '@/lib/signalEngine';

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    try {
      const data = await base44.entities.Signal.list('-created_date', 50);
      setSignals(data);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function getExplanation(signal) {
    setLoadingExplanation(signal.id);
    const text = await generateSignalExplanation(signal);
    setExplanations(prev => ({ ...prev, [signal.id]: text }));
    setLoadingExplanation(null);
  }

  const filtered = signals.filter(s => {
    if (filter === 'confirmed' && s.signal_type !== 'confirmed') return false;
    if (filter === 'solo' && s.signal_type !== 'solo') return false;
    if (filter === 'buy' && s.direction !== 'BUY') return false;
    if (filter === 'sell' && s.direction !== 'SELL') return false;
    if (search && !s.instrument_symbol?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          <Zap className="w-5 h-5 text-amber-400" />
          <h1 className="font-heading font-bold text-xl">Signal Log</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm bg-secondary rounded-lg border border-border focus:border-emerald-500/50 focus:outline-none w-48"
          />
        </div>
        {['all', 'confirmed', 'solo', 'buy', 'sell'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground hover:bg-secondary border border-transparent'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Signal list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No signals recorded yet. Signals will appear here as the dashboard generates them.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(signal => (
            <div key={signal.id}
              className={`rounded-xl border bg-card overflow-hidden transition-all ${
                signal.signal_type === 'confirmed' ? 'border-amber-500/30 signal-confirmed-glow' : 'border-border'
              }`}>
              <button onClick={() => setExpandedId(expandedId === signal.id ? null : signal.id)}
                className="w-full text-left flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm">{signal.instrument_symbol}</span>
                    {signal.signal_type === 'confirmed' && <Zap className="w-3 h-3 text-amber-400" />}
                    <span className="text-[10px] text-muted-foreground">{signal.strategy_name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(signal.created_date).toLocaleString()} · {signal.trend_context} · <span className={RISK_COLORS[signal.risk_level]}>{signal.risk_level} risk</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ConfidenceMeter value={signal.confidence} />
                  <SignalBadge direction={signal.direction} confidence={signal.confidence} size="md" />
                </div>
              </button>

              {expandedId === signal.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-3">
                    <Stat label="Agreement" value={signal.agreement_count || '—'} />
                    <Stat label="Timeframe" value={signal.timeframe || '—'} />
                    <Stat label="Outcome" value={signal.outcome || 'pending'} />
                    <Stat label="Entry" value={signal.entry_price ? `$${signal.entry_price}` : '—'} />
                  </div>
                  {signal.explanation ? (
                    <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3">
                      <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground/80">{signal.explanation}</p>
                    </div>
                  ) : explanations[signal.id] ? (
                    <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3">
                      <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground/80">{explanations[signal.id]}</p>
                    </div>
                  ) : (
                    <button onClick={() => getExplanation(signal)} disabled={loadingExplanation === signal.id}
                      className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      {loadingExplanation === signal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      {loadingExplanation === signal.id ? 'Generating...' : 'Get AI explanation'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-mono text-sm font-medium">{value}</div>
    </div>
  );
}