import React, { useMemo } from 'react';
import { calculateCurrencyStrength } from '@/lib/advancedTools';
import { DIRECTION_COLORS } from '@/lib/constants';
import { Coins } from 'lucide-react';

export default function CurrencyStrength() {
  const data = useMemo(() => calculateCurrencyStrength(), []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Coins className="w-5 h-5 text-amber-400" />
        <h1 className="font-heading font-bold text-lg">Currency Strength Meter</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-4">Relative strength of major currencies. Strong = buy bias, weak = sell bias.</p>
        <div className="space-y-3">
          {data.map(c => {
            const colors = DIRECTION_COLORS[c.direction];
            return (
              <div key={c.currency} className="flex items-center gap-3">
                <div className="w-12 text-sm font-bold font-mono">{c.currency}</div>
                <div className="flex-1 relative h-7 rounded-lg bg-secondary/30 overflow-hidden">
                  <div className="absolute top-0 left-1/2 w-px h-full bg-border" />
                  <div
                    className={`absolute top-0 h-full ${c.strength > 50 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                    style={{
                      width: `${Math.abs(c.strength - 50)}%`,
                      left: c.strength > 50 ? '50%' : `${c.strength}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold">
                    {c.strength}
                  </div>
                </div>
                <div className={`w-16 text-xs font-mono font-bold ${colors.text}`}>
                  {c.change > 0 ? '+' : ''}{c.change}
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                  {c.direction}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strongest vs weakest pair suggestion */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Optimal Pair Suggestion</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            Buy <span className="font-mono font-bold text-emerald-400">{data[0]?.currency}</span>
            {' / '}
            Sell <span className="font-mono font-bold text-red-400">{data[data.length - 1]?.currency}</span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            Strength differential: <span className="font-mono font-bold">{(data[0]?.strength || 0) - (data[data.length - 1]?.strength || 0)} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}