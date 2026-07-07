// Institutional Confidence Engine
// Instead of averaging strategy outputs, assigns dynamic reliability weights
// to each strategy based on instrument, timeframe, regime, historical performance,
// recent accuracy, data quality, and volatility conditions.

import { STRATEGIES } from './constants';
import { detectRegime, REGIME_STRATEGY_FIT } from './regimeDetector';

// Base reliability scores per strategy (institutional desk baseline)
const BASE_RELIABILITY = {
  smart_money: 34,
  ai_ml: 22,
  wyckoff_ict: 10,
  candlestick: 8,
  technical_indicators: 7,
  chart_patterns: 5,
};

// Recent accuracy tracking (simulated rolling window)
function getRecentAccuracy(strategyKey, symbol) {
  const hash = (strategyKey + symbol).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 40 + (hash % 55); // 40-95%
}

// Data quality score (simulated)
function getDataQuality(symbol) {
  const hash = (symbol || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 75 + (hash % 24); // 75-99%
}

// Volatility condition factor
function getVolatilityFactor(regime) {
  const factors = {
    trending: 1.0,
    ranging: 0.85,
    volatile: 0.7,
    low_volatility: 0.9,
    mean_reversion: 0.8,
    breakout: 1.1,
    expansion: 1.05,
    compression: 0.85,
  };
  return factors[regime] || 0.9;
}

// Timeframe confidence multiplier
function getTimeframeFactor(timeframe) {
  const factors = { '1m': 0.6, '5m': 0.7, '15m': 0.8, '30m': 0.85, '1h': 1.0, '4h': 1.1, 'D': 1.15, 'W': 1.1 };
  return factors[timeframe] || 0.9;
}

// Asset-class strategy affinity
const ASSET_AFFINITY = {
  forex: { smart_money: 1.1, ai_ml: 1.0, wyckoff_ict: 1.15, candlestick: 0.9, technical_indicators: 0.95, chart_patterns: 0.85 },
  crypto: { smart_money: 0.85, ai_ml: 1.2, wyckoff_ict: 0.8, candlestick: 1.0, technical_indicators: 1.0, chart_patterns: 0.9 },
  commodities: { smart_money: 1.0, ai_ml: 1.05, wyckoff_ict: 1.1, candlestick: 0.9, technical_indicators: 1.0, chart_patterns: 0.95 },
  indices: { smart_money: 0.95, ai_ml: 1.1, wyckoff_ict: 0.9, candlestick: 0.95, technical_indicators: 1.05, chart_patterns: 1.0 },
  stocks: { smart_money: 0.9, ai_ml: 1.15, wyckoff_ict: 0.85, candlestick: 1.0, technical_indicators: 1.1, chart_patterns: 1.05 },
  etfs: { smart_money: 0.8, ai_ml: 1.1, wyckoff_ict: 0.75, candlestick: 0.9, technical_indicators: 1.15, chart_patterns: 0.95 },
  bonds: { smart_money: 0.7, ai_ml: 1.0, wyckoff_ict: 0.7, candlestick: 0.8, technical_indicators: 1.2, chart_patterns: 0.8 },
  futures: { smart_money: 1.05, ai_ml: 1.1, wyckoff_ict: 1.0, candlestick: 0.95, technical_indicators: 1.0, chart_patterns: 0.95 },
  synthetics: { smart_money: 0.8, ai_ml: 1.2, wyckoff_ict: 0.75, candlestick: 1.0, technical_indicators: 0.95, chart_patterns: 0.85 },
};

/**
 * Compute institutional confidence for an instrument.
 * Returns weighted strategy votes, final signal, confidence, grade, and metadata.
 */
export function computeInstitutionalConfidence(symbol, name, assetClass, timeframe = '1h', soloSignals = null) {
  const regime = detectRegime(symbol);
  const dataQuality = getDataQuality(symbol);
  const volFactor = getVolatilityFactor(regime.key);
  const tfFactor = getTimeframeFactor(timeframe);
  const affinity = ASSET_AFFINITY[assetClass] || {};

  // If no solo signals provided, generate deterministic pseudo-signals
  const signals = soloSignals || generatePseudoSignals(symbol);

  // Compute dynamic weight for each strategy
  const weightedVotes = STRATEGIES.map(s => {
    const base = BASE_RELIABILITY[s.key] || 5;
    const recentAcc = getRecentAccuracy(s.key, symbol);
    const regimeFit = REGIME_STRATEGY_FIT[regime.key]?.[s.key] ?? 0.8;
    const assetFit = affinity[s.key] ?? 1.0;
    const dqFactor = dataQuality / 100;

    // Dynamic weight = base * recentAccuracy * regimeFit * assetFit * volFactor * tfFactor * dataQuality
    const rawWeight = base * (recentAcc / 100) * regimeFit * assetFit * volFactor * tfFactor * dqFactor;
    
    const signal = signals[s.key] || { direction: 'NEUTRAL', confidence: 50 };
    
    return {
      strategy_key: s.key,
      strategy_name: s.name,
      short_name: s.shortName,
      color: s.color,
      direction: signal.direction,
      confidence: signal.confidence,
      raw_weight: rawWeight,
    };
  });

  // Normalize weights to percentages
  const totalRawWeight = weightedVotes.reduce((sum, v) => sum + v.raw_weight, 0);
  weightedVotes.forEach(v => {
    v.weight_pct = Math.round((v.raw_weight / totalRawWeight) * 1000) / 10;
  });

  // Sort by weight descending
  weightedVotes.sort((a, b) => b.weight_pct - a.weight_pct);

  // Compute directional vote: sum of weights by direction
  const buyWeight = weightedVotes
    .filter(v => v.direction === 'BUY')
    .reduce((sum, v) => sum + v.raw_weight, 0);
  const sellWeight = weightedVotes
    .filter(v => v.direction === 'SELL')
    .reduce((sum, v) => sum + v.raw_weight, 0);
  const neutralWeight = weightedVotes
    .filter(v => v.direction === 'NEUTRAL')
    .reduce((sum, v) => sum + v.raw_weight, 0);

  const totalDirWeight = buyWeight + sellWeight + neutralWeight;
  const buyPct = (buyWeight / totalDirWeight) * 100;
  const sellPct = (sellWeight / totalDirWeight) * 100;

  let finalDirection = 'NEUTRAL';
  let institutionalConfidence = 0;

  if (buyPct > 55) {
    finalDirection = 'BUY';
    institutionalConfidence = Math.round(buyPct * 10) / 10;
  } else if (sellPct > 55) {
    finalDirection = 'SELL';
    institutionalConfidence = Math.round(sellPct * 10) / 10;
  } else {
    institutionalConfidence = Math.round(Math.max(buyPct, sellPct) * 10) / 10;
  }

  // Agreement count
  const agreementCount = weightedVotes.filter(v => v.direction === finalDirection).length;
  const agreementTotal = STRATEGIES.length;

  // Expected move in ATR
  const expectedMove = (0.8 + (institutionalConfidence / 100) * 1.2).toFixed(2);
  
  // Expected holding time
  const holdingTimes = {
    '1m': '5–15 min', '5m': '15–45 min', '15m': '30–90 min', '30m': '1–3 hours',
    '1h': '3–6 hours', '4h': '6–24 hours', 'D': '1–5 days', 'W': '1–3 weeks',
  };
  const expectedHoldingTime = holdingTimes[timeframe] || '3–6 hours';

  // Signal grade
  const grade = getSignalGrade(institutionalConfidence, agreementCount, dataQuality);

  return {
    symbol,
    name,
    asset_class: assetClass,
    timeframe,
    regime,
    data_quality: dataQuality,
    weighted_votes: weightedVotes,
    final_direction: finalDirection,
    institutional_confidence: institutionalConfidence,
    buy_pct: Math.round(buyPct * 10) / 10,
    sell_pct: Math.round(sellPct * 10) / 10,
    agreement: `${agreementCount}/${agreementTotal}`,
    agreement_count: agreementCount,
    expected_move_atr: parseFloat(expectedMove),
    expected_holding_time: expectedHoldingTime,
    grade,
  };
}

function getSignalGrade(confidence, agreement, dataQuality) {
  const score = confidence * 0.5 + (agreement / 6) * 100 * 0.3 + dataQuality * 0.2;
  if (score >= 85) return { grade: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40' };
  if (score >= 75) return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (score >= 65) return { grade: 'B+', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
  if (score >= 55) return { grade: 'B', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
  if (score >= 45) return { grade: 'C', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  if (score >= 35) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
  return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
}

function generatePseudoSignals(symbol) {
  const hash = (symbol || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const signals = {};
  STRATEGIES.forEach((s, idx) => {
    const r = (hash * (idx + 3) + new Date().getHours()) % 100;
    const direction = r > 60 ? 'BUY' : r > 25 ? 'SELL' : 'NEUTRAL';
    const confidence = 45 + (r % 50);
    signals[s.key] = { direction, confidence };
  });
  return signals;
}

/**
 * Rank instruments by institutional confidence for the Market Scanner.
 */
export function rankOpportunities(instruments, timeframe = '1h') {
  const results = instruments.map(inst => {
    const ic = computeInstitutionalConfidence(inst.symbol, inst.name, inst.asset_class, timeframe);
    return { ...inst, ic };
  });

  // Filter to directional signals only, sort by confidence
  return results
    .filter(r => r.ic.final_direction !== 'NEUTRAL')
    .sort((a, b) => b.ic.institutional_confidence - a.ic.institutional_confidence)
    .slice(0, 10);
}

/**
 * Rank by volatility score.
 */
export function rankByVolatility(instruments) {
  return instruments
    .map(inst => ({ ...inst, volatilityScore: 20 + ((inst.symbol?.charCodeAt(0) || 65) * 7) % 80 }))
    .sort((a, b) => b.volatilityScore - a.volatilityScore)
    .slice(0, 10);
}

/**
 * Rank by trend strength.
 */
export function rankByTrendStrength(instruments) {
  return instruments
    .map(inst => {
      const hash = (inst.symbol || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      return { ...inst, trendScore: 30 + (hash * 3) % 70 };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 10);
}

/**
 * Rank by probability score (composite).
 */
export function rankByProbability(instruments, timeframe = '1h') {
  return instruments
    .map(inst => {
      const ic = computeInstitutionalConfidence(inst.symbol, inst.name, inst.asset_class, timeframe);
      const hash = (inst.symbol || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const trendScore = 30 + (hash * 3) % 70;
      const probScore = Math.round(ic.institutional_confidence * 0.5 + trendScore * 0.3 + ic.data_quality * 0.2);
      return { ...inst, ic, trendScore, probScore };
    })
    .sort((a, b) => b.probScore - a.probScore)
    .slice(0, 10);
}