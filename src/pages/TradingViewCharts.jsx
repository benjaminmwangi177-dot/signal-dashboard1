import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CandlestickChart, BarChart3, Calendar, Flame, Signal, Target } from 'lucide-react';
import SignalBadge from '@/components/dashboard/SignalBadge';

const TV_SYMBOLS = [
  { symbol: 'FX:EURUSD', label: 'EUR/USD', category: 'Forex' },
  { symbol: 'FX:GBPUSD', label: 'GBP/USD', category: 'Forex' },
  { symbol: 'FX:USDJPY', label: 'USD/JPY', category: 'Forex' },
  { symbol: 'FX:AUDUSD', label: 'AUD/USD', category: 'Forex' },
  { symbol: 'FX:USDCAD', label: 'USD/CAD', category: 'Forex' },
  { symbol: 'BITSTAMP:BTCUSD', label: 'Bitcoin', category: 'Crypto' },
  { symbol: 'BITSTAMP:ETHUSD', label: 'Ethereum', category: 'Crypto' },
  { symbol: 'TVC:GOLD', label: 'Gold', category: 'Commodities' },
  { symbol: 'TVC:SILVER', label: 'Silver', category: 'Commodities' },
  { symbol: 'NASDAQ:NQ', label: 'Nasdaq 100', category: 'Indices' },
  { symbol: 'SPX', label: 'S&P 500', category: 'Indices' },
  { symbol: 'DJI', label: 'Dow 30', category: 'Indices' },
  { symbol: 'NYMEX:CL', label: 'Crude Oil', category: 'Commodities' },
];

const TIMEFRAMES = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
];

export default function TradingViewCharts() {
  const [symbol, setSymbol] = useState('FX:EURUSD');
  const [timeframe, setTimeframe] = useState('60');
  const [signals, setSignals] = useState([]);
  const [chartStyle, setChartStyle] = useState('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, [symbol]);

  async function loadSignals() {
    setLoading(true);
    try {
      const symbolBase = symbol.split(':')[1] || symbol;
      const data = await base44.entities.Signal.list('-created_date', 10);
      const filtered = data.filter(s =>
        s.instrument_symbol?.includes(symbolBase) ||
        s.instrument_symbol === symbolBase.replace('USD', '/USD').replace('JPY', '/JPY')
      );
      setSignals(filtered);
    } catch {
      setSignals([]);
    }
    setLoading(false);
  }

  const currentLabel = TV_SYMBOLS.find(s => s.symbol === symbol)?.label || symbol;
  const currentCategory = TV_SYMBOLS.find(s => s.symbol === symbol)?.category || 'Markets';

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CandlestickChart className="w-5 h-5 text-cyan-400" />
          <h1 className="font-heading font-bold text-lg">Trading Terminal</h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-secondary text-sm rounded-lg px-3 py-1.5 border border-border min-w-[140px]"
          >
            <optgroup label="Forex">
              {TV_SYMBOLS.filter(s => s.category === 'Forex').map(s => (
                <option key={s.symbol} value={s.symbol}>{s.label}</option>
              ))}
            </optgroup>
            <optgroup label="Crypto">
              {TV_SYMBOLS.filter(s => s.category === 'Crypto').map(s => (
                <option key={s.symbol} value={s.symbol}>{s.label}</option>
              ))}
            </optgroup>
            <optgroup label="Indices">
              {TV_SYMBOLS.filter(s => s.category === 'Indices').map(s => (
                <option key={s.symbol} value={s.symbol}>{s.label}</option>
              ))}
            </optgroup>
            <optgroup label="Commodities">
              {TV_SYMBOLS.filter(s => s.category === 'Commodities').map(s => (
                <option key={s.symbol} value={s.symbol}>{s.label}</option>
              ))}
            </optgroup>
          </select>

          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="bg-secondary text-sm rounded-lg px-2 py-1.5 border border-border"
          >
            {TIMEFRAMES.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>

          <select
            value={chartStyle}
            onChange={e => setChartStyle(e.target.value)}
            className="bg-secondary text-sm rounded-lg px-2 py-1.5 border border-border"
          >
            <option value="1">Candles</option>
            <option value="2">Bars</option>
            <option value="3">Line</option>
            <option value="9">Heikin Ashi</option>
          </select>
        </div>
      </div>

      {/* Main terminal layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Left panel - Signals */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Recent signals for this symbol */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Signal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Signals · {currentLabel}
              </h3>
            </div>
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                </div>
              ) : signals.length > 0 ? (
                signals.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <SignalBadge direction={s.direction} />
                      <span className="text-xs font-mono">{s.strategy_name?.slice(0, 12)}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${s.confidence >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {s.confidence}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No signals for this symbol
                </div>
              )}
            </div>
          </div>

          {/* Technical Analysis Widget */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Technical Analysis
              </h3>
            </div>
            <iframe
              key={symbol}
              src={`https://s.tradingview.com/embed-widget/technical-analysis/?symbol=${encodeURIComponent(symbol)}&interval=${timeframe}&showIntervalTabs=false&theme=dark&width=100%25&height=350&locale=en`}
              className="w-full"
              style={{ height: '350px' }}
              frameBorder="0"
              title="Technical Analysis"
            />
          </div>
        </div>

        {/* Center - Main Chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Advanced Chart */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex-1 min-h-[500px]">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">{currentLabel}</span>
                <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-secondary rounded">{currentCategory}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Powered by TradingView</span>
            </div>
            <iframe
              key={`${symbol}-${timeframe}-${chartStyle}`}
              src={`https://s3.tradingview.com/advanced-chart/?symbol=${encodeURIComponent(symbol)}&theme=dark&style=${chartStyle}&interval=${timeframe}&hide_side_toolbar=false&studies=[]&timezone=Etc/UTC`}
              className="w-full"
              style={{ height: 'calc(100% - 41px)', minHeight: '450px' }}
              frameBorder="0"
              title="TradingView Advanced Chart"
            />
          </div>

          {/* Ticker Tape */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex-shrink-0">
            <iframe
              src="https://s.tradingview.com/embed-widget/ticker-tape/?symbols=FX:EURUSD,FX:GBPUSD,FX:USDJPY,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,TVC:GOLD,NASDAQ:NQ&theme=dark&showSymbolLogo=false&colorTheme=dark"
              className="w-full"
              style={{ height: '46px' }}
              frameBorder="0"
              title="Ticker Tape"
            />
          </div>
        </div>

        {/* Right panel - Heat map & Calendar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Crypto Heat Map */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Crypto Heat Map
              </h3>
            </div>
            <iframe
              src="https://s.tradingview.com/embed-widget/crypto-mcap-heatmap/?theme=dark&colorTheme=dark"
              className="w-full"
              style={{ height: '300px' }}
              frameBorder="0"
              title="Crypto Heat Map"
            />
          </div>

          {/* Market Overview */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Market Overview
              </h3>
            </div>
            <iframe
              src="https://s.tradingview.com/embed-widget/markets/?height=400&theme=dark&colorTheme=dark"
              className="w-full"
              style={{ height: '400px' }}
              frameBorder="0"
              title="Market Overview"
            />
          </div>

          {/* Economic Calendar Widget */}
          <div className="rounded-xl border border-border bg-card overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Economic Calendar
              </h3>
            </div>
            <iframe
              src="https://s.tradingview.com/embed-widget/events/?height=300&theme=dark&colorTheme=dark"
              className="w-full"
              style={{ height: '300px' }}
              frameBorder="0"
              title="Economic Calendar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
