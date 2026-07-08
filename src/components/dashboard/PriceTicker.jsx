import React, { useState, useEffect, useMemo } from 'react';
import { generateLivePrices } from '@/lib/advancedTools';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PriceTicker() {
  const [prices, setPrices] = useState(() => generateLivePrices());

  // Update prices periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const delta = ((Math.random() - 0.5) * 0.002);
        const newPrice = Math.max(0.0001, p.price + delta);
        return { ...p, price: Math.round(newPrice * 10000) / 10000, change_pct: Math.round((p.change_pct + delta * 100) * 100) / 100 };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayPrices = useMemo(() => [...prices, ...prices], [prices]);

  return (
    <div className="relative overflow-hidden h-7 bg-[hsl(220,18%,6%)] border-b border-border flex items-center">
      <div className="flex items-center gap-8 whitespace-nowrap animate-ticker">
        {displayPrices.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono px-4 border-r border-border/30 last:border-0">
            <span className="text-muted-foreground font-bold">{p.symbol}</span>
            <span className="text-foreground">{p.price}</span>
            <span className={`flex items-center gap-0.5 ${p.change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {p.change_pct >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {p.change_pct >= 0 ? '+' : ''}{p.change_pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}