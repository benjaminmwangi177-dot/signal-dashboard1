import React, { useMemo } from 'react';
import { getAdvancedRiskMetrics } from '@/lib/advancedTools';
import { Shield } from 'lucide-react';

export default function RiskMetrics() {
  const data = useMemo(() => getAdvancedRiskMetrics(), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-amber-400" />
        <h1 className="font-heading font-bold text-lg">Advanced Risk Metrics</h1>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              <th className="px-3 py-2 text-left">Symbol</th>
              <th className="px-3 py-2 text-right">MFE</th>
              <th className="px-3 py-2 text-right">MAE</th>
              <th className="px-3 py-2 text-right">Exp. Payoff</th>
              <th className="px-3 py-2 text-right">Kelly %</th>
              <th className="px-3 py-2 text-right">Recovery</th>
              <th className="px-3 py-2 text-right">Calmar</th>
              <th className="px-3 py-2 text-right">Sortino</th>
              <th className="px-3 py-2 text-right">Ulcer Idx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map(d => (
              <tr key={d.symbol} className="hover:bg-secondary/30">
                <td className="px-3 py-2.5 font-mono font-bold">{d.symbol}</td>
                <td className="px-3 py-2.5 text-right font-mono text-emerald-400">+{d.mfe}</td>
                <td className="px-3 py-2.5 text-right font-mono text-red-400">-{d.mae}</td>
                <td className={`px-3 py-2.5 text-right font-mono ${d.expected_payoff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {d.expected_payoff >= 0 ? '+' : ''}{d.expected_payoff}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-cyan-400">{(d.kelly_criterion * 100).toFixed(0)}%</td>
                <td className="px-3 py-2.5 text-right font-mono">{d.recovery_factor}</td>
                <td className="px-3 py-2.5 text-right font-mono">{d.calmar_ratio}</td>
                <td className="px-3 py-2.5 text-right font-mono">{d.sortino_ratio}</td>
                <td className="px-3 py-2.5 text-right font-mono text-amber-400">{d.ulcer_index}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}