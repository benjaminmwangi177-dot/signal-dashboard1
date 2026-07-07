// Strength Meter - per-instrument multi-dimensional strength scores

export function calculateStrength(symbol, seed) {
  const hash = (symbol || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const s = seed || 0;
  
  // Generate scores 0-100
  const trendStrength = 30 + ((hash * 3 + s) % 70);
  const momentum = 20 + ((hash * 5 + s * 2) % 80);
  const volumeStrength = 25 + ((hash * 7 + s * 3) % 75);
  const volatility = 15 + ((hash * 11 + s) % 85);
  const marketHealth = 35 + ((hash * 13 + s * 5) % 65);
  const institutionalActivity = 20 + ((hash * 17 + s * 7) % 80);
  
  return {
    trend_strength: trendStrength,
    momentum,
    volume_strength: volumeStrength,
    volatility,
    market_health: marketHealth,
    institutional_activity: institutionalActivity,
  };
}

export const STRENGTH_METRICS = [
  { key: 'trend_strength', label: 'Trend Strength', color: '#10b981', icon: 'TrendingUp' },
  { key: 'momentum', label: 'Momentum', color: '#06b6d4', icon: 'Gauge' },
  { key: 'volume_strength', label: 'Volume Strength', color: '#8b5cf6', icon: 'BarChart3' },
  { key: 'volatility', label: 'Volatility', color: '#f59e0b', icon: 'Activity' },
  { key: 'market_health', label: 'Market Health', color: '#3b82f6', icon: 'Heart' },
  { key: 'institutional_activity', label: 'Institutional Activity', color: '#ec4899', icon: 'Building2' },
];

export function getStrengthGrade(score) {
  if (score >= 80) return { grade: 'A+', color: 'text-emerald-400' };
  if (score >= 70) return { grade: 'A', color: 'text-emerald-400' };
  if (score >= 60) return { grade: 'B', color: 'text-cyan-400' };
  if (score >= 50) return { grade: 'C', color: 'text-amber-400' };
  if (score >= 40) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}