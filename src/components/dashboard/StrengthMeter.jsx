import React from 'react';
import { STRENGTH_METRICS, getStrengthGrade } from '@/lib/strengthMeter';
import { TrendingUp, Gauge, BarChart3, Activity, Heart, Building2 } from 'lucide-react';

const ICON_MAP = {
  TrendingUp,
  Gauge,
  BarChart3,
  Activity,
  Heart,
  Building2,
};

export default function StrengthMeter({ scores, compact = false }) {
  if (!scores) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STRENGTH_METRICS.map(m => {
          const val = scores[m.key] || 0;
          return (
            <div key={m.key} className="flex flex-col items-center gap-1" title={`${m.label}: ${val}`}>
              <div className="w-1.5 h-8 rounded-full bg-secondary relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
                  style={{ height: `${val}%`, backgroundColor: m.color }}
                />
              </div>
              <span className="text-[7px] font-mono text-muted-foreground">{val}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {STRENGTH_METRICS.map(m => {
        const val = scores[m.key] || 0;
        const grade = getStrengthGrade(val);
        const Icon = ICON_MAP[m.icon] || Activity;
        return (
          <div key={m.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-40 flex-shrink-0">
              <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${val}%`, backgroundColor: m.color }}
              />
            </div>
            <div className="flex items-center gap-2 w-16 justify-end">
              <span className="text-xs font-mono font-semibold">{val}</span>
              <span className={`text-[10px] font-bold ${grade.color}`}>{grade.grade}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}