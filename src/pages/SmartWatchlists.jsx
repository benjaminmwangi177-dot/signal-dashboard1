import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSmartWatchlists } from '@/lib/advancedTools';
import SignalBadge from '@/components/dashboard/SignalBadge';
import { Star, Bookmark } from 'lucide-react';

export default function SmartWatchlists() {
  const navigate = useNavigate();
  const watchlists = useMemo(() => getSmartWatchlists(), []);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Bookmark className="w-5 h-5 text-amber-400" />
        <h1 className="font-heading font-bold text-lg">Smart Watchlists</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watchlists.map(wl => (
          <div key={wl.key} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold">{wl.label}</h3>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">{wl.instruments.length} items</span>
            </div>
            <div className="divide-y divide-border/50">
              {wl.instruments.map((inst, idx) => (
                <button
                  key={inst.symbol}
                  onClick={() => navigate(`/instrument/${inst.symbol}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors text-left"
                >
                  <div className="text-[10px] text-muted-foreground font-mono w-4">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium font-mono">{inst.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">{inst.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold">{inst.score}</div>
                    <div className="text-[9px] text-muted-foreground">score</div>
                  </div>
                  <SignalBadge direction={inst.ic.final_direction} confidence={inst.ic.institutional_confidence} size="sm" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}