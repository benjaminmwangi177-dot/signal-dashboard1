import { DEFAULT_INSTRUMENTS, STRATEGIES } from './constants';
import { computeInstitutionalConfidence } from './confidenceEngine';
import { detectRegime } from './regimeDetector';

// ─── 1. CORRELATION ENGINE ───
export function computeCorrelationMatrix(instruments = DEFAULT_INSTRUMENTS) {
  const symbols = instruments.map(i => i.symbol);
  const matrix = {};
  symbols.forEach(s1 => {
    matrix[s1] = {};
    const h1 = s1.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    symbols.forEach(s2 => {
      if (s1 === s2) { matrix[s1][s2] = 1.0; return; }
      const h2 = s2.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const corr = ((h1 * h2) % 200 - 100) / 100;
      matrix[s1][s2] = Math.round(corr * 100) / 100;
    });
  });
  return { symbols, matrix };
}

// ─── 2. SESSION INTELLIGENCE ───
export const TRADING_SESSIONS = [
  { key: 'sydney', label: 'Sydney', start: 22, end: 7, color: '#06b6d4', vol: 'Low' },
  { key: 'tokyo', label: 'Tokyo', start: 0, end: 9, color: '#ec4899', vol: 'Medium' },
  { key: 'london', label: 'London', start: 8, end: 17, color: '#10b981', vol: 'High' },
  { key: 'new_york', label: 'New York', start: 13, end: 22, color: '#f59e0b', vol: 'High' },
];

export function getSessionIntelligence() {
  const hour = new Date().getUTCHours();
  const sessions = TRADING_SESSIONS.map(s => {
    const active = s.start < s.end
      ? hour >= s.start && hour < s.end
      : hour >= s.start || hour < s.end;
    return { ...s, active, current_hour: hour };
  });
  const active = sessions.filter(s => s.active);
  const isOverlap = active.length >= 2;
  return { sessions, active, isOverlap, currentHour: hour };
}

export function getSessionStats(symbol) {
  const hash = (symbol || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TRADING_SESSIONS.map(s => ({
    ...s,
    pip_range: 20 + ((hash + s.start) % 80),
    win_rate: 45 + ((hash * s.start) % 40),
    trade_count: 5 + ((hash + s.end) % 20),
  }));
}

// ─── 3. HEAT MAPS ───
export function generateHeatMap(instruments = DEFAULT_INSTRUMENTS) {
  return instruments.map(i => {
    const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const hour = new Date().getHours();
    const change = ((hash * 7 + hour * 13) % 200 - 100) / 100 * 3;
    return {
      ...i,
      change_pct: Math.round(change * 100) / 100,
      intensity: Math.min(1, Math.abs(change) / 3),
    };
  });
}

// ─── 4. CURRENCY STRENGTH METER ───
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

export function calculateCurrencyStrength() {
  const hour = new Date().getHours();
  return CURRENCIES.map(c => {
    const hash = c.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const strength = 50 + ((hash * 3 + hour * 7) % 100) - 50;
    return {
      currency: c,
      strength: Math.round(strength),
      change: Math.round((strength - 50) * 10) / 10,
      direction: strength > 55 ? 'BUY' : strength < 45 ? 'SELL' : 'NEUTRAL',
    };
  }).sort((a, b) => b.strength - a.strength);
}

// ─── 5. SMART WATCHLISTS ───
export function getSmartWatchlists(instruments = DEFAULT_INSTRUMENTS) {
  const watchlists = [
    { key: 'momentum', label: 'Momentum Leaders', filter: 'trend' },
    { key: 'breakout', label: 'Breakout Candidates', filter: 'breakout' },
    { key: 'reversal', label: 'Reversal Setups', filter: 'reversal' },
    { key: 'high_confidence', label: 'High Confidence', filter: 'confidence' },
  ];
  return watchlists.map(wl => {
    const ranked = instruments.map(i => {
      const ic = computeInstitutionalConfidence(i.symbol, i.name, i.asset_class, '1h');
      const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      let score = ic.institutional_confidence;
      if (wl.filter === 'trend') score = 40 + (hash % 60);
      if (wl.filter === 'breakout') score = 30 + ((hash * 3) % 70);
      if (wl.filter === 'reversal') score = 35 + ((hash * 5) % 65);
      return { ...i, ic, score };
    }).sort((a, b) => b.score - a.score).slice(0, 6);
    return { ...wl, instruments: ranked };
  });
}

// ─── 6. ECONOMIC CALENDAR ───
export function generateEconomicCalendar() {
  const events = [
    { currency: 'USD', event: 'Non-Farm Payrolls', impact: 'High', time: '13:30', forecast: '180K', previous: '175K' },
    { currency: 'EUR', event: 'ECB Interest Rate Decision', impact: 'High', time: '13:45', forecast: '4.25%', previous: '4.25%' },
    { currency: 'GBP', event: 'GDP q/q', impact: 'Medium', time: '07:00', forecast: '0.3%', previous: '0.4%' },
    { currency: 'JPY', event: 'BoJ Policy Rate', impact: 'High', time: '03:00', forecast: '0.10%', previous: '0.10%' },
    { currency: 'USD', event: 'CPI m/m', impact: 'High', time: '13:30', forecast: '0.3%', previous: '0.4%' },
    { currency: 'AUD', event: 'Employment Change', impact: 'Medium', time: '01:30', forecast: '25K', previous: '38K' },
    { currency: 'CAD', event: 'Ivey PMI', impact: 'Low', time: '15:00', forecast: '52.5', previous: '51.2' },
    { currency: 'EUR', event: 'German ZEW Sentiment', impact: 'Medium', time: '10:00', forecast: '35.0', previous: '32.5' },
    { currency: 'USD', event: 'FOMC Meeting Minutes', impact: 'High', time: '19:00', forecast: '—', previous: '—' },
    { currency: 'GBP', event: 'BoE Gov Speech', impact: 'Medium', time: '11:00', forecast: '—', previous: '—' },
  ];
  const today = new Date().toISOString().split('T')[0];
  return events.map((e, i) => ({ ...e, id: i, date: today }));
}

// ─── 7. REPLAY MODE ───
export function generateReplayData(symbol) {
  const hash = (symbol || 'X').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const candles = [];
  let price = 1.1000 + (hash % 1000) / 10000;
  for (let i = 0; i < 100; i++) {
    const trend = Math.sin(i / 15) * 0.002;
    const noise = ((hash * (i + 3)) % 100 - 50) / 10000;
    price += trend + noise;
    const open = price;
    const close = price + noise;
    const high = Math.max(open, close) + Math.abs(noise) * 0.5;
    const low = Math.min(open, close) - Math.abs(noise) * 0.5;
    candles.push({ i, open, close, high, low, time: i });
  }
  return candles;
}

// ─── 8. SIGNAL REPLAY ───
export function generateSignalReplay(symbol) {
  const hash = (symbol || 'X').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const signals = [];
  for (let i = 0; i < 20; i++) {
    const r = (hash * (i + 5)) % 100;
    signals.push({
      id: i,
      time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${String((i % 2) * 30).padStart(2, '0')}`,
      direction: r > 60 ? 'BUY' : r > 30 ? 'SELL' : 'NEUTRAL',
      strategy: STRATEGIES[(hash + i) % STRATEGIES.length].name,
      confidence: 50 + (r % 45),
      outcome: r > 70 ? 'win' : r > 40 ? 'loss' : 'breakeven',
      pnl: Math.round((r - 50) * 10) / 10,
    });
  }
  return signals;
}

// ─── 9. TRADE JOURNAL ───
export function generateJournalEntries() {
  const entries = [];
  const moods = ['Confident', 'Cautious', 'FOMO', 'Patient', 'Revenge', 'Disciplined'];
  for (let i = 0; i < 15; i++) {
    const inst = DEFAULT_INSTRUMENTS[i % DEFAULT_INSTRUMENTS.length];
    const r = Math.random();
    entries.push({
      id: i,
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      symbol: inst.symbol,
      direction: r > 0.5 ? 'BUY' : 'SELL',
      entry: 1.1 + Math.random() * 0.1,
      exit: 1.1 + Math.random() * 0.1,
      pnl: Math.round((Math.random() - 0.4) * 200),
      mood: moods[i % moods.length],
      notes: `Trade taken on ${inst.name}. Followed plan${i % 3 === 0 ? ' partially' : ''}.`,
      strategy: STRATEGIES[i % STRATEGIES.length].name,
    });
  }
  return entries;
}

// ─── 10. ALERT BUILDER ───
export const ALERT_CONDITIONS = [
  { key: 'price_above', label: 'Price Above', type: 'price' },
  { key: 'price_below', label: 'Price Below', type: 'price' },
  { key: 'confidence_gt', label: 'Confidence >', type: 'confidence' },
  { key: 'confidence_lt', label: 'Confidence <', type: 'confidence' },
  { key: 'regime_change', label: 'Regime Change', type: 'regime' },
  { key: 'strategy_align', label: 'Strategy Alignment', type: 'strategy' },
  { key: 'correlation_break', label: 'Correlation Break', type: 'correlation' },
];

export function generateSampleAlerts() {
  return [
    { id: 1, symbol: 'EURUSD', condition: 'confidence_gt', value: 80, active: true, triggered: 3 },
    { id: 2, symbol: 'BTCUSD', condition: 'price_above', value: 68000, active: true, triggered: 0 },
    { id: 3, symbol: 'XAUUSD', condition: 'regime_change', value: null, active: true, triggered: 1 },
    { id: 4, symbol: 'NAS100', condition: 'strategy_align', value: 5, active: false, triggered: 7 },
  ];
}

// ─── 11. STRATEGY BUILDER ───
export const STRATEGY_BLOCKS = [
  { key: 'entry_condition', label: 'Entry Condition', category: 'entry', options: ['Price > EMA200', 'RSI < 30', 'MACD Cross', 'Bullish OB Touch', 'Liquidity Sweep'] },
  { key: 'confirmation', label: 'Confirmation', category: 'confirm', options: ['Volume Spike', 'Higher TF Agreement', 'Session Active', 'News Avoidance'] },
  { key: 'stop_loss', label: 'Stop Loss', category: 'risk', options: ['1 ATR', '2 ATR', 'Swing Low', 'Order Block Low'] },
  { key: 'take_profit', label: 'Take Profit', category: 'risk', options: ['1.5 R:R', '2 R:R', '3 R:R', 'Next Liquidity'] },
  { key: 'filter', label: 'Filter', category: 'filter', options: ['Trend Filter', 'Volatility Filter', 'Session Filter', 'Correlation Filter'] },
];

// ─── 12. PROBABILITY DASHBOARD ───
export function calculateProbabilities(instruments = DEFAULT_INSTRUMENTS) {
  return instruments.map(i => {
    const ic = computeInstitutionalConfidence(i.symbol, i.name, i.asset_class, '1h');
    const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const winProb = Math.min(95, Math.round(ic.institutional_confidence * 0.6 + (hash % 30) + 10));
    const lossProb = 100 - winProb;
    const expectedValue = Math.round((winProb / 100 * 2 - lossProb / 100 * 1) * 100) / 100;
    return {
      ...i,
      ic,
      win_probability: winProb,
      loss_probability: lossProb,
      expected_value: expectedValue,
      kelly_fraction: Math.round(Math.max(0, (winProb / 100 * 2 - 1) / 1.5) * 100) / 100,
    };
  }).sort((a, b) => b.win_probability - a.win_probability);
}

// ─── 13. DYNAMIC SUPPORT & RESISTANCE ───
export function calculateSupportResistance(symbol) {
  const hash = (symbol || 'X').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 1.1 + (hash % 100) / 100;
  return {
    resistances: [
      { level: Math.round((base + 0.03) * 10000) / 10000, strength: 85, touches: 7, type: 'R3' },
      { level: Math.round((base + 0.02) * 10000) / 10000, strength: 70, touches: 5, type: 'R2' },
      { level: Math.round((base + 0.01) * 10000) / 10000, strength: 60, touches: 4, type: 'R1' },
    ],
    supports: [
      { level: Math.round((base - 0.01) * 10000) / 10000, strength: 65, touches: 6, type: 'S1' },
      { level: Math.round((base - 0.02) * 10000) / 10000, strength: 75, touches: 8, type: 'S2' },
      { level: Math.round((base - 0.03) * 10000) / 10000, strength: 90, touches: 10, type: 'S3' },
    ],
    pivot: Math.round(base * 10000) / 10000,
  };
}

// ─── 14. LIQUIDITY MAP ───
export function generateLiquidityMap(symbol) {
  const hash = (symbol || 'X').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 1.1 + (hash % 100) / 100;
  return [
    { level: Math.round((base + 0.04) * 10000) / 10000, type: 'sell_side', liquidity: 85, zone: 'Asia High' },
    { level: Math.round((base + 0.02) * 10000) / 10000, type: 'sell_side', liquidity: 70, zone: 'London High' },
    { level: Math.round((base - 0.02) * 10000) / 10000, type: 'buy_side', liquidity: 75, zone: 'London Low' },
    { level: Math.round((base - 0.04) * 10000) / 10000, type: 'buy_side', liquidity: 90, zone: 'Asia Low' },
    { level: Math.round((base + 0.06) * 10000) / 10000, type: 'sell_side', liquidity: 60, zone: 'Equal Highs' },
    { level: Math.round((base - 0.06) * 10000) / 10000, type: 'buy_side', liquidity: 65, zone: 'Equal Lows' },
  ];
}

// ─── 15. SIGNAL QUEUE ───
export function generateSignalQueue(instruments = DEFAULT_INSTRUMENTS) {
  return instruments.slice(0, 12).map((i, idx) => {
    const ic = computeInstitutionalConfidence(i.symbol, i.name, i.asset_class, '1h');
    const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const minutesAgo = idx * 3 + (hash % 5);
    return {
      id: idx,
      ...i,
      ic,
      queued_at: new Date(Date.now() - minutesAgo * 60000).toISOString(),
      status: ic.institutional_confidence > 70 ? 'ready' : ic.institutional_confidence > 55 ? 'forming' : 'watching',
      queue_position: idx + 1,
    };
  });
}

// ─── 16. ACCURACY DASHBOARD ───
export function calculateAccuracyStats() {
  return STRATEGIES.map(s => {
    const hash = s.key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const total = 50 + (hash % 200);
    const wins = Math.round(total * (0.45 + (hash % 30) / 100));
    return {
      ...s,
      total_signals: total,
      wins,
      losses: total - wins,
      win_rate: Math.round((wins / total) * 1000) / 10,
      avg_confidence: 55 + (hash % 35),
      best_pair: DEFAULT_INSTRUMENTS[hash % DEFAULT_INSTRUMENTS.length].symbol,
      worst_pair: DEFAULT_INSTRUMENTS[(hash + 3) % DEFAULT_INSTRUMENTS.length].symbol,
      streak: (hash % 10) - 3,
    };
  });
}

// ─── 17. PORTFOLIO EXPOSURE ───
export function calculatePortfolioExposure() {
  const positions = DEFAULT_INSTRUMENTS.slice(0, 8).map((i, idx) => {
    const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const direction = hash % 2 === 0 ? 'BUY' : 'SELL';
    const size = 1000 + (hash % 9000);
    return {
      ...i,
      direction,
      size,
      pnl: Math.round((hash % 200 - 100)),
      risk_pct: Math.round((1 + (hash % 5)) * 10) / 10,
    };
  });
  const totalExposure = positions.reduce((s, p) => s + p.size, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalRisk = positions.reduce((s, p) => s + p.risk_pct, 0);
  return { positions, totalExposure, totalPnl, totalRisk };
}

// ─── 18. DATA QUALITY MONITOR ───
export function getDataQualityStats(instruments = DEFAULT_INSTRUMENTS) {
  return instruments.map(i => {
    const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const score = 75 + (hash % 24);
    return {
      ...i,
      quality_score: score,
      latency_ms: 50 + (hash % 200),
      gaps: hash % 5,
      last_update: `${hash % 60}s ago`,
      status: score > 90 ? 'excellent' : score > 80 ? 'good' : score > 70 ? 'fair' : 'poor',
    };
  });
}

// ─── 19. PERFORMANCE OPTIMIZER ───
export function getPerformanceMetrics() {
  return {
    engine_latency: { current: 45, target: 50, unit: 'ms', status: 'good' },
    signal_throughput: { current: 120, target: 100, unit: 'sig/s', status: 'good' },
    memory_usage: { current: 68, target: 80, unit: '%', status: 'good' },
    cpu_usage: { current: 34, target: 70, unit: '%', status: 'good' },
    cache_hit_rate: { current: 94, target: 90, unit: '%', status: 'good' },
    api_calls: { current: 1240, target: 2000, unit: 'calls/min', status: 'good' },
    optimizations: [
      { id: 1, name: 'Strategy Parallelization', impact: 'High', applied: true, gain: '40% faster' },
      { id: 2, name: 'Signal Caching', impact: 'Medium', applied: true, gain: '25% less API' },
      { id: 3, name: 'Lazy Regime Detection', impact: 'Medium', applied: false, gain: '15% less CPU' },
      { id: 4, name: 'WebSocket Streaming', impact: 'High', applied: false, gain: '60% less latency' },
      { id: 5, name: 'Pre-computed Correlations', impact: 'Low', applied: true, gain: '10% faster' },
    ],
  };
}

// ─── 20. SYSTEM HEALTH DASHBOARD ───
export function getSystemHealth() {
  return {
    overall: 'operational',
    uptime: '99.97%',
    services: [
      { name: 'Signal Engine', status: 'operational', latency: 45, uptime: '99.99%' },
      { name: 'Confidence Engine', status: 'operational', latency: 32, uptime: '99.98%' },
      { name: 'Regime Detector', status: 'operational', latency: 28, uptime: '100%' },
      { name: 'Data Feeds', status: 'degraded', latency: 180, uptime: '99.85%' },
      { name: 'AI/ML Pipeline', status: 'operational', latency: 220, uptime: '99.95%' },
      { name: 'Notification Service', status: 'operational', latency: 15, uptime: '99.99%' },
      { name: 'Paper Trading', status: 'operational', latency: 12, uptime: '100%' },
      { name: 'WebSocket Gateway', status: 'operational', latency: 8, uptime: '99.97%' },
    ],
    incidents: [
      { time: '2h ago', message: 'Data feed latency spike on commodities stream', severity: 'warning', resolved: true },
      { time: '1d ago', message: 'Scheduled maintenance completed', severity: 'info', resolved: true },
      { time: '3d ago', message: 'AI/ML model updated to v2.4', severity: 'info', resolved: true },
    ],
  };
}

// ─── 21. LIVE PRICE TICKER ───
export function generateLivePrices(instruments = DEFAULT_INSTRUMENTS) {
  return instruments.map(i => {
    const hash = i.symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = i.asset_class === 'crypto' ? 50000 + (hash % 50000) : 1.1 + (hash % 100) / 100;
    const change = ((hash * 7) % 200 - 100) / 100 * 2;
    return {
      ...i,
      price: Math.round(base * 10000) / 10000,
      change_pct: Math.round(change * 100) / 100,
      bid: Math.round(base * 9998) / 10000,
      ask: Math.round(base * 10002) / 10000,
    };
  });
}