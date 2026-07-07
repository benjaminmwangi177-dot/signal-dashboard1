import React from 'react';

export default function ConfidenceMeter({ value, size = 'sm' }) {
  const radius = size === 'lg' ? 28 : 16;
  const stroke = size === 'lg' ? 4 : 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const dim = (radius + stroke) * 2;

  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none"
          stroke="hsl(220, 16%, 18%)" strokeWidth={stroke} />
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700" />
      </svg>
      <span className={`absolute font-mono font-bold ${size === 'lg' ? 'text-sm' : 'text-[9px]'}`}
        style={{ color }}>{value}</span>
    </div>
  );
}