export const ASSET_CLASSES = [
  { key: 'forex', label: 'Forex', icon: 'DollarSign' },
  { key: 'crypto', label: 'Crypto', icon: 'Bitcoin' },
  { key: 'commodities', label: 'Commodities', icon: 'Gem' },
  { key: 'indices', label: 'Indices', icon: 'BarChart3' },
  { key: 'stocks', label: 'Stocks', icon: 'TrendingUp' },
  { key: 'etfs', label: 'ETFs', icon: 'Layers' },
  { key: 'bonds', label: 'Bonds', icon: 'Shield' },
  { key: 'futures', label: 'Futures', icon: 'Timer' },
  { key: 'synthetics', label: 'Synthetics', icon: 'Zap' },
];

export const TIMEFRAMES = ['1s', '5s', '15s', '1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'];

export const STRATEGIES = [
  { key: 'smart_money', name: 'Smart Money / ICT', shortName: 'SM', color: '#6366f1' },
  { key: 'ai_ml', name: 'AI/ML Ensemble', shortName: 'AI', color: '#8b5cf6' },
  { key: 'chart_patterns', name: 'Chart Patterns', shortName: 'CP', color: '#06b6d4' },
  { key: 'candlestick', name: 'Candlestick', shortName: 'CS', color: '#f59e0b' },
  { key: 'technical_indicators', name: 'Technical Indicators', shortName: 'TI', color: '#10b981' },
  { key: 'wyckoff_ict', name: 'Wyckoff / ICT', shortName: 'WY', color: '#ec4899' },
];

export const RISK_COLORS = {
  Low: 'text-green-400',
  Medium: 'text-amber-400',
  High: 'text-red-400',
};

export const DIRECTION_COLORS = {
  BUY: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  SELL: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  NEUTRAL: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-400' },
};

export const DEFAULT_INSTRUMENTS = [
  // Forex
  { symbol: 'EURUSD', name: 'EUR/USD', asset_class: 'forex' },
  { symbol: 'GBPUSD', name: 'GBP/USD', asset_class: 'forex' },
  { symbol: 'USDJPY', name: 'USD/JPY', asset_class: 'forex' },
  { symbol: 'AUDUSD', name: 'AUD/USD', asset_class: 'forex' },
  { symbol: 'USDCAD', name: 'USD/CAD', asset_class: 'forex' },
  { symbol: 'USDCHF', name: 'USD/CHF', asset_class: 'forex' },
  { symbol: 'NZDUSD', name: 'NZD/USD', asset_class: 'forex' },
  { symbol: 'EURGBP', name: 'EUR/GBP', asset_class: 'forex' },
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin', asset_class: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', asset_class: 'crypto' },
  { symbol: 'SOLUSD', name: 'Solana', asset_class: 'crypto' },
  { symbol: 'XRPUSD', name: 'XRP', asset_class: 'crypto' },
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', asset_class: 'commodities' },
  { symbol: 'XAGUSD', name: 'Silver', asset_class: 'commodities' },
  { symbol: 'WTIUSD', name: 'WTI Oil', asset_class: 'commodities' },
  { symbol: 'NATGAS', name: 'Natural Gas', asset_class: 'commodities' },
  // Indices
  { symbol: 'NAS100', name: 'NASDAQ 100', asset_class: 'indices' },
  { symbol: 'SPX500', name: 'S&P 500', asset_class: 'indices' },
  { symbol: 'US30', name: 'Dow Jones', asset_class: 'indices' },
  { symbol: 'GER40', name: 'DAX 40', asset_class: 'indices' },
  // Stocks
  { symbol: 'AAPL', name: 'Apple', asset_class: 'stocks' },
  { symbol: 'MSFT', name: 'Microsoft', asset_class: 'stocks' },
  { symbol: 'TSLA', name: 'Tesla', asset_class: 'stocks' },
  { symbol: 'NVDA', name: 'Nvidia', asset_class: 'stocks' },
  // Synthetics
  { symbol: 'V75', name: 'Volatility 75', asset_class: 'synthetics' },
  { symbol: 'V100', name: 'Volatility 100', asset_class: 'synthetics' },
  { symbol: 'BOOM1000', name: 'Boom 1000', asset_class: 'synthetics' },
  { symbol: 'CRASH1000', name: 'Crash 1000', asset_class: 'synthetics' },
];