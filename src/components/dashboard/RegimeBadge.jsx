import React from 'react';
import { Activity, TrendingUp, MoveHorizontal, Zap, Minus, RefreshCw, Rocket, Maximize, Minimize2 } from 'lucide-react';

const ICON_MAP = {
  TrendingUp,
  MoveHorizontal,
  Zap,
  Minus,
  RefreshCw,
  Rocket,
  Maximize,
  Minimize2,
  Activity,
};

export default function RegimeBadge({ regime, size = 'sm' }) {
  if (!regime) return null;
  const Icon = ICON_MAP[regime.icon] || Activity;
  const sizeClass = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${sizeClass}`}
      style={{ backgroundColor: `${regime.color}15`, borderColor: `${regime.color}40`, color: regime.color }}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {regime.label}
      {regime.confidence != null && size === 'lg' && (
        <span className="opacity-60 font-mono text-xs">{regime.confidence}%</span>
      )}
    </span>
  );
}