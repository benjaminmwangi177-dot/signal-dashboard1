// Market Regime Detection
// Identifies current market state so strategies can adapt

export const REGIMES = [
  { key: 'trending', label: 'Trending', color: '#10b981', icon: 'TrendingUp' },
  { key: 'ranging', label: 'Ranging', color: '#64748b', icon: 'MoveHorizontal' },
  { key: 'volatile', label: 'Volatile', color: '#ef4444', icon: 'Zap' },
  { key: 'low_volatility', label: 'Low Volatility', color: '#3b82f6', icon: 'Minus' },
  { key: 'mean_reversion', label: 'Mean Reversion', color: '#a855f7', icon: 'RefreshCw' },
  { key: 'breakout', label: 'Breakout', color: '#f59e0b', icon: 'Rocket' },
  { key: 'expansion', label: 'Expansion', color: '#06b6d4', icon: 'Maximize' },
  { key: 'compression', label: 'Compression', color: '#8b5cf6', icon: 'Minimize' },
];

// Strategy effectiveness by regime (0-1 multiplier)
export const REGIME_STRATEGY_FIT = {
  trending: { smart_money: 1.0, ai_ml: 1.0, chart_patterns: 0.9, candlestick: 0.5, technical_indicators: 1.0, wyckoff_ict: 0.9 },
  ranging: { smart_money: 0.6, ai_ml: 0.8, chart_patterns: 0.7, candlestick: 0.8, technical_indicators: 0.7, wyckoff_ict: 0.6 },
  volatile: { smart_money: 0.8, ai_ml: 0.9, chart_patterns: 0.5, candlestick: 0.6, technical_indicators: 0.4, wyckoff_ict: 0.8 },
  low_volatility: { smart_money: 0.5, ai_ml: 0.7, chart_patterns: 0.8, candlestick: 0.7, technical_indicators: 0.9, wyckoff_ict: 0.5 },
  mean_reversion: { smart_money: 0.6, ai_ml: 0.9, chart_patterns: 0.7, candlestick: 0.8, technical_indicators: 0.9, wyckoff_ict: 0.6 },
  breakout: { smart_money: 0.9, ai_ml: 0.8, chart_patterns: 0.9, candlestick: 0.7, technical_indicators: 0.8, wyckoff_ict: 0.9 },
  expansion: { smart_money: 0.9, ai_ml: 0.9, chart_patterns: 0.8, candlestick: 0.6, technical_indicators: 0.7, wyckoff_ict: 0.9 },
  compression: { smart_money: 0.7, ai_ml: 0.8, chart_patterns: 0.6, candlestick: 0.5, technical_indicators: 0.6, wyckoff_ict: 0.8 },
};

export function detectRegime(symbol, seed) {
  // Deterministic-ish pseudo regime based on symbol + time
  const hash = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hour = new Date().getHours();
  const noise = (hash + hour + (seed || 0)) % 8;
  const regime = REGIMES[noise];
  
  // Confidence in regime detection
  const confidence = 60 + Math.floor((hash % 30));
  
  // Regime metrics
  const adx = 15 + Math.floor((hash * 7) % 45); // trend strength
  const atrPercent = 0.3 + ((hash % 30) / 10); // volatility
  const bbWidth = 0.5 + ((hash % 20) / 10); // bollinger width
  
  return {
    ...regime,
    confidence,
    metrics: {
      adx,
      atr_percent: parseFloat(atrPercent.toFixed(2)),
      bollinger_width: parseFloat(bbWidth.toFixed(2)),
    },
    description: getRegimeDescription(regime.key),
  };
}

function getRegimeDescription(key) {
  const descs = {
    trending: 'Clear directional bias. Trend-following strategies favored. Look for pullback entries in trend direction.',
    ranging: 'Price consolidating between support and resistance. Mean-reversion and range-bound strategies preferred.',
    volatile: 'Elevated volatility with sharp moves. Reduce position size. Breakout and momentum strategies viable.',
    low_volatility: 'Quiet, compressed market. Breakout setups building. Patience required.',
    mean_reversion: 'Price oscillating around a mean. Fade extremes, target mid-range. Trend strategies underperform.',
    breakout: 'Price breaking key levels with momentum. Breakout and momentum strategies favored. Watch for false breaks.',
    expansion: 'Volatility expanding after compression. Trend strategies gaining edge. Position for sustained moves.',
    compression: 'Volatility contracting. Range tightening. Prepare for imminent expansion. Watch breakout direction.',
  };
  return descs[key] || '';
}