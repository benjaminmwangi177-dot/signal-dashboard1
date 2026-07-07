import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { analyzeInstrument, generateSignalExplanation } from '@/lib/signalEngine';
import { computeInstitutionalConfidence } from '@/lib/confidenceEngine';
import { calculateStrength } from '@/lib/strengthMeter';
import { DEFAULT_INSTRUMENTS, STRATEGIES, RISK_COLORS } from '@/lib/constants';
import SignalBadge from '@/components/dashboard/SignalBadge';
import ConfidenceMeter from '@/components/dashboard/ConfidenceMeter';
import TimeframeBar from '@/components/dashboard/TimeframeBar';
import RegimeBadge from '@/components/dashboard/RegimeBadge';
import StrengthMeter from '@/components/dashboard/StrengthMeter';
import ConsensusMatrix from '@/components/dashboard/ConsensusMatrix';
import InstitutionalConfidencePanel from '@/components/dashboard/InstitutionalConfidencePanel';
import { ArrowLeft, Zap, Brain, Loader2, Activity, Gauge } from 'lucide-react';

export default function InstrumentDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [recentSignals, setRecentSignals] = useState([]);

  const ic = useMemo(() => {
    if (!analysis) return null;
    return computeInstitutionalConfidence(
      analysis.symbol, analysis.name, analysis.asset_class, '1h', analysis.soloSignals
    );
  }, [analysis]);

  const strength = useMemo(() => {
    if (!analysis) return null;
    return calculateStrength(analysis.symbol);
  }, [analysis]);

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
    if (!ic) return;
    setLoadingExplanation(true);
    const text = await generateSignalExplanation({
      instrument_symbol: ic.symbol,
      instrument_name: ic.name,
      direction: ic.final_direction,
      confidence: ic.institutional_confidence,
      signal_type: 'confirmed',
      strategy_name: 'Institutional Confidence Engine',
      trend_context: ic.regime?.label || 'N/A',
      risk_level: 'Medium',
      agreement_count: ic.agreement,
      strategies_agreeing: ic.weighted_votes?.filter(v => v.direction === ic.final_direction).map(v => v.strategy_name),
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
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-xl">{analysis.symbol}</h1>
          <p className="text-sm text-muted-foreground">{analysis.name} · {analysis.asset_class}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {ic?.regime && <RegimeBadge regime={ic.regime} size="lg" />}
        </div>
      </div>

      {/* Institutional Confidence Panel */}
      {ic && <InstitutionalConfidencePanel ic={ic} />}

      {/* AI Market Commentary */}
      <div className="rounded-xl border border-purple-500/20 bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400">AI Market Commentary</h3>
        </div>
        {explanation ? (
          <p className="text-sm text-foreground/80 leading-relaxed">{explanation}</p>
        ) : (
          <button onClick={handleGetExplanation} disabled={loadingExplanation}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
            {loadingExplanation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loadingExplanation ? 'Generating commentary...' : 'Generate AI market commentary'}
          </button>
        )}
      </div>

      {/* AI Consensus Matrix */}
      {ic && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Consensus Matrix</h3>
          </div>
          <ConsensusMatrix weightedVotes={ic.weighted_votes} />
        </div>
      )}

      {/* Strength Meter */}
      {strength && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strength Meter</h3>
          </div>
          <StrengthMeter scores={strength} />
        </div>
      )}

      {/* Market Regime detail */}
      {ic?.regime && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Market Regime Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Detected Regime</div>
              <RegimeBadge regime={ic.regime} size="lg" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ADX (Trend)</div>
              <div className="font-mono font-bold text-lg">{ic.regime.metrics.adx}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ATR %</div>
              <div className="font-mono font-bold text-lg">{ic.regime.metrics.atr_percent}%</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">BB Width</div>
              <div className="font-mono font-bold text-lg">{ic.regime.metrics.bollinger_width}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{ic.regime.description}</p>
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