import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { analyzeInstrument } from '@/lib/signalEngine';
import { ASSET_CLASSES, DEFAULT_INSTRUMENTS } from '@/lib/constants';
import ConfirmedSignalCard from '@/components/dashboard/ConfirmedSignalCard';
import InstrumentRow from '@/components/dashboard/InstrumentRow';
import { Gift, RefreshCw, Search, ShieldCheck, TrendingDown, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInstruments();
  }, []);

  async function loadInstruments() {
    try {
      const saved = await base44.entities.Instrument.list();
      const list = saved.length > 0 ? saved.filter(i => i.enabled !== false) : DEFAULT_INSTRUMENTS;
      setInstruments(list);
      runAnalysis(list);
    } catch {
      setInstruments(DEFAULT_INSTRUMENTS);
      runAnalysis(DEFAULT_INSTRUMENTS);
    }
  }

  function runAnalysis(list) {
    const results = list.map(i => analyzeInstrument(i.symbol, i.name, i.asset_class));
    setAnalyses(results);
    setLoading(false);
    setRefreshing(false);
  }

  function handleRefresh() {
    setRefreshing(true);
    runAnalysis(instruments);
  }

  const confirmedSignals = useMemo(() => analyses.filter(a => a.confirmed), [analyses]);
  const filteredAnalyses = useMemo(() => {
    let result = analyses;

    if (activeFilter === 'confirmed') {
      result = confirmedSignals;
    } else if (activeFilter !== 'all') {
      result = analyses.filter(a => a.asset_class === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((analysis) => (
        analysis.symbol.toLowerCase().includes(query)
        || analysis.name.toLowerCase().includes(query)
      ));
    }

    return result;
  }, [analyses, activeFilter, confirmedSignals, searchQuery]);

  const stats = useMemo(() => {
    const buy = analyses.filter(a => a.confirmed?.direction === 'BUY').length;
    const sell = analyses.filter(a => a.confirmed?.direction === 'SELL').length;
    return { total: analyses.length, confirmed: confirmedSignals.length, buy, sell };
  }, [analyses, confirmedSignals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5">
        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <Gift className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Full free access</span>
            </div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">
              Institutional-grade market intelligence, open to everyone.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every dashboard, signal, strategy tool, AI workspace, and paper-trading feature
              is available without payments, subscriptions, trials, or usage limits.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              No card required
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
              <Zap className="h-3.5 w-3.5" />
              Unlimited usage
            </span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono">{stats.confirmed}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Confirmed</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-emerald-400">{stats.buy}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Buy</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-red-400">{stats.sell}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sell</div>
            </div>
          </div>
        </div>

        <div className="ml-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Confirmed Signals */}
      {confirmedSignals.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-amber-400">Confirmed Signals</h2>
            <span className="text-xs text-muted-foreground font-mono">({confirmedSignals.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {confirmedSignals.map(a => (
              <ConfirmedSignalCard
                key={a.symbol}
                analysis={a}
                onClick={() => navigate(`/instrument/${a.symbol}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search instruments</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search symbols or markets"
            className="w-full rounded-xl border border-border bg-secondary/50 py-2 pl-9 pr-3 text-sm transition-all placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
          />
        </label>
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pb-1">
          <FilterTab label="All" value="all" active={activeFilter} onClick={setActiveFilter} count={analyses.length} />
          <FilterTab label="Confirmed" value="confirmed" active={activeFilter} onClick={setActiveFilter} count={confirmedSignals.length} />
          {ASSET_CLASSES.map(ac => {
            const count = analyses.filter(a => a.asset_class === ac.key).length;
            if (count === 0) return null;
            return <FilterTab key={ac.key} label={ac.label} value={ac.key} active={activeFilter} onClick={setActiveFilter} count={count} />;
          })}
        </div>
      </div>

      {/* Instrument list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:flex items-center gap-4 px-3 py-2 border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
          <div className="w-24">Instrument</div>
          <div className="flex-1">Strategies</div>
          <div>Timeframes</div>
          <div className="ml-auto">Signal</div>
        </div>
        <div className="divide-y divide-border/50">
          {filteredAnalyses.map(a => (
            <InstrumentRow
              key={a.symbol}
              analysis={a}
              onClick={() => navigate(`/instrument/${a.symbol}`)}
            />
          ))}
        </div>
        {filteredAnalyses.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No instruments match this filter</div>
        )}
      </div>
    </div>
  );
}

function FilterTab({ label, value, active, onClick, count }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
        active === value
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
      }`}
    >
      {label}
      <span className="font-mono text-[10px] opacity-60">{count}</span>
    </button>
  );
}