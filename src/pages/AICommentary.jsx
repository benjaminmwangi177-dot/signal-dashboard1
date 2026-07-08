import React, { useState, useMemo } from 'react';
import { generateMarketCommentary } from '@/lib/advancedTools';
import { MessageSquare, RefreshCw } from 'lucide-react';
import SignalBadge from '@/components/dashboard/SignalBadge';

export default function AICommentary() {
  const [refreshKey, setRefreshKey] = useState(0);
  const commentary = useMemo(() => generateMarketCommentary(), [refreshKey]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">AI Market Commentary</h1>
        <button onClick={() => setRefreshKey(k => k + 1)} className="ml-auto p-2 rounded-lg hover:bg-secondary">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {commentary.map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-bold text-sm">{c.symbol}</span>
              <span className="text-xs text-muted-foreground">{c.name}</span>
              <SignalBadge direction={c.direction} confidence={Math.round(c.confidence)} size="sm" />
              <span className="ml-auto text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">Grade: {c.grade}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{c.commentary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}