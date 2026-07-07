import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import {
  rankOpportunities, rankByVolatility, rankByTrendStrength, rankByProbability
} from '@/lib/confidenceEngine';
import SignalBadge from '@/components/dashboard/SignalBadge';
import { Radar, Flame, TrendingUp, Target, ChevronRight } from 'lucide-react';

const RANK_MODES = [
  { key: 'opportunities', label: 'Top Opportunities', icon: Target, ranker: (insts, tf) => rankOpportunities(insts, tf) },
  { key: 'signal_strength', label: 'Signal Strength', icon: Radar, ranker: (insts, tf) => rankOpportunities(insts, tf) },
  { key: 'volatility', label: 'Volatility', icon: Flame, ranker: (insts) => rankByVolatility(insts) },
  { key: 'trend', label: 'Trend Strength', icon: TrendingUp, ranker: (insts) => rankByTrendStrength(insts) },
  { key: 'probability', label: 'Probability Score', icon: Target, ranker: (insts, tf) => rankByProbability(insts, tf) },
];

export default function MarketScanner() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('opportunities');
  const [timeframe, setTimeframe] = useState('1h');

  const ranked = useMemo(() => {
    const ranker = RANK_MODES.find(m => m.key === mode)?.ranker;
    return ranker ? ranker(DEFAULT_INSTRUMENTS, timeframe) : [];
  }, [mode, timeframe]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-cyan-400" />
          <h1 className="font-heading font-bold text-xl">Market Scanner</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Timeframe</span>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="px-2 py-1 text-sm bg-secondary rounded-lg border border-border font-mono"
          >
            {['15m', '1h', '4h', 'D'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
        </div>
      </div>

      {/* Rank mode tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {RANK_MODES.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              mode === m.key
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Ranked list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {RANK_MODES.find(m => m.key === mode)?.label}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{ranked.length} results</span>
        </div>

        {ranked.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No directional opportunities detected at this time.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {ranked.map((item, idx) => {
              const score = item.ic?.institutional_confidence || item.volatilityScore || item.trendScore || item.probScore || 0;
              const ic = item.ic;
              return (
                <button
                  key={item.symbol}
                  onClick={() => navigate(`/instrument/${item.symbol}`)}
                  className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors group"
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 ${
                    idx < 3 ? 'bg-amber-500/10 text-amber-400' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Symbol */}
                  <div className="w-28 flex-shrink-0">
                    <div className="font-mono font-bold text-sm">{item.symbol}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{item.name}</div>
                  </div>

                  {/* Direction + confidence */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {ic && <SignalBadge direction={ic.final_direction} confidence={ic.institutional_confidence} size="sm" />}
                  </div>

                  {/* Score bar */}
                  <div className="flex-1 hidden sm:block">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#64748b',
                        }}
                      />
                    </div>
                  </div>

                  {/* Score value */}
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">{score}%</div>
                      {ic?.grade && (
                        <div className={`text-[10px] font-bold ${ic.grade.color}`}>Grade {ic.grade.grade}</div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}