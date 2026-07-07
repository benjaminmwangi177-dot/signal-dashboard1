import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { analyzeInstrument, generateSignalExplanation } from '@/lib/signalEngine';
import { DEFAULT_INSTRUMENTS, STRATEGIES, RISK_COLORS } from '@/lib/constants';
import SignalBadge from '@/components/dashboard/SignalBadge';
import ConfidenceMeter from '@/components/dashboard/ConfidenceMeter';
import TimeframeBar from '@/components/dashboard/TimeframeBar';
import { ArrowLeft, Zap, Brain, RefreshCw, Loader2 } from 'lucide-react';

export default function InstrumentDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [recentSignals, setRecentSignals] = useState([]);

  useEffect(() => {
    const inst = DEFAULT_INSTRUMENTS.find(i => i.symbol === symbol);
    if (inst) {
      const result = analyzeInstrument(inst.symbol, inst.name, inst.asset_class);
      setAnalysis(result);
    }
    loadRecentSignals();
  }, [symbol]);

  async function loadRecentSignals() {
    try {
      const signals = await base44.entities.Signal.filter({ instrument_symbol: symbol }, '-created_date', 10);
      setRecentSignals(signals);
    } catch { /* empty */ }
  }

  async function handleGetExplanation() {
    if (!analysis?.confirmed) return;
    setLoadingExplanation(true);
    const text = await generateSignalExplanation({
      instrument_symbol: analysis.symbol,
      instrument_name: analysis.name,
      direction: analysis.confirmed.direction,
      confidence: analysis.confirmed.confidence,
      signal_type: 'confirmed',
      strategy_name: 'Combined',
      trend_context: analysis.confirmed.trend_context,
      risk_level: analysis.confirmed.risk_level,
      agreement_count: analysis.confirmed.agreement,
      strategies_agreeing: analysis.confirmed.strategiesAgreeing,
    });
    setExplanation(text);
    setLoadingExplanation(false);
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-xl">{analysis.symbol}</h1>
          <p className="text-sm text-muted-foreground">{analysis.name} · {analysis.asset_class}</p>
        </div>
        {analysis.confirmed && (
          <div className="ml-auto">
            <SignalBadge direction={analysis.confirmed.direction} confidence={analysis.confirmed.confidence} size="lg" />
          </div>
        )}
      </div>

      {/* Confirmed Signal Panel */}
      {analysis.confirmed && (
        <div className="signal-confirmed-glow rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-amber-400">Confirmed Signal</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Direction</div>
              <SignalBadge direction={analysis.confirmed.direction} size="md" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</div>
              <ConfidenceMeter value={analysis.confirmed.confidence} size="lg" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Agreement</div>
              <div className="font-mono font-bold text-lg text-amber-400">{analysis.confirmed.agreement}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk</div>
              <div className={`font-semibold ${RISK_COLORS[analysis.confirmed.risk_level]}`}>{analysis.confirmed.risk_level}</div>
              <div className="text-xs text-muted-foreground">{analysis.confirmed.trend_context}</div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            {explanation ? (
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed">{explanation}</p>
              </div>
            ) : (
              <button onClick={handleGetExplanation} disabled={loadingExplanation}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                {loadingExplanation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {loadingExplanation ? 'Generating explanation...' : 'Get AI explanation'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeframe alignment */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Timeframe Alignment</h3>
        <TimeframeBar alignment={analysis.tfAlignment} />
      </div>

      {/* Solo strategy signals */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategy Verdicts</h3>
        </div>
        <div className="divide-y divide-border/50">
          {STRATEGIES.map(s => {
            const signal = analysis.soloSignals[s.key];
            return (
              <div key={s.key} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{signal.trend_context} · Risk: {signal.risk_level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ConfidenceMeter value={signal.confidence} />
                  <SignalBadge direction={signal.direction} confidence={signal.confidence} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent signal history */}
      {recentSignals.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Signal History</h3>
          </div>
          <div className="divide-y divide-border/50">
            {recentSignals.map(sig => (
              <div key={sig.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="text-xs text-muted-foreground font-mono">{new Date(sig.created_date).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{sig.strategy_name}</div>
                <SignalBadge direction={sig.direction} confidence={sig.confidence} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}