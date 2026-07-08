import React, { useState } from 'react';
import { CandlestickChart } from 'lucide-react';

const TV_SYMBOLS = [
  { symbol: 'EURUSD', label: 'EUR/USD' },
  { symbol: 'GBPUSD', label: 'GBP/USD' },
  { symbol: 'BTCUSD', label: 'Bitcoin' },
  { symbol: 'ETHUSD', label: 'Ethereum' },
  { symbol: 'XAUUSD', label: 'Gold' },
  { symbol: 'NAS100', label: 'NASDAQ 100' },
  { symbol: 'SPX500', label: 'S&P 500' },
  { symbol: 'AAPL', label: 'Apple' },
];

export default function TradingViewCharts() {
  const [symbol, setSymbol] = useState('EURUSD');

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <CandlestickChart className="w-5 h-5 text-cyan-400" />
        <h1 className="font-heading font-bold text-lg">TradingView Charts</h1>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} className="ml-auto bg-secondary text-sm rounded-lg px-3 py-1.5 border border-border">
          {TV_SYMBOLS.map(s => <option key={s.symbol} value={s.symbol}>{s.label}</option>)}
        </select>
      </div>

      {/* TradingView Advanced Chart Widget */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{symbol} · Advanced Chart</span>
          <span className="text-[10px] text-muted-foreground">Powered by TradingView</span>
        </div>
        <iframe
          key={symbol}
          src={`https://s3.tradingview.com/advanced-chart/?symbol=${symbol}&theme=dark&style=1&interval=60&hide_side_toolbar=false&studies=[]`}
          className="w-full"
          style={{ height: '500px' }}
          frameBorder="0"
          allowTransparency="true"
          title="TradingView Chart"
        />
      </div>

      {/* Market Overview Widget */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Overview</span>
        </div>
        <iframe
          src="https://s.tradingview.com/embed-market-overview/?theme=dark&showOnlyActive=true"
          className="w-full"
          style={{ height: '400px' }}
          frameBorder="0"
          allowTransparency="true"
          title="TradingView Market Overview"
        />
      </div>
    </div>
  );
}