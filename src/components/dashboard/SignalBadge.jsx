import React from 'react';
import { DIRECTION_COLORS } from '@/lib/constants';

export default function SignalBadge({ direction, confidence = null, size = 'sm' }) {
  const colors = DIRECTION_COLORS[direction] || DIRECTION_COLORS.NEUTRAL;
  const sizeClasses = size === 'lg'
    ? 'px-3 py-1.5 text-sm font-semibold'
    : size === 'md'
    ? 'px-2 py-1 text-xs font-semibold'
    : 'px-1.5 py-0.5 text-[10px] font-bold';

  return (
    <span className={`inline-flex items-center gap-1 rounded ${colors.bg} ${colors.border} border ${colors.text} ${sizeClasses} font-mono tracking-wide`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {direction}
      {confidence != null && (
        <span className="opacity-70 ml-0.5">{confidence}%</span>
      )}
    </span>
  );
}