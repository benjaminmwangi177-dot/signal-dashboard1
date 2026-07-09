import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, TrendingDown, BarChart3, Layers, Gauge, Zap } from 'lucide-react';

const generateFootprintData = (bars = 20) => {
  const data = [];
  let price = 1.0850;
  for (let i = 0; i < bars; i++) {
    const open = price + (Math.random() - 0.5) * 0.0020;
    const close = open + (Math.random() - 0.5) * 0.0015;
    const high = Math.max(open, close) + Math.random() * 0.0005;
    const low = Math.min(open, close) - Math.random() * 0.0005;

    const levels = {};
    let currentPrice = low;
    const priceStep = 0.0001;

    while (currentPrice <= high) {
      const isBuyingBar = close > open;
      const imbalance = (Math.random() - 0.3) * (isBuyingBar ? 1 : -1);
      const baseVolume = Math.floor(Math.random() * 500) + 100;
      levels[currentPrice.toFixed(5)] = {
        bidVolume: Math.floor(baseVolume * (0.5 - imbalance * 0.3)),
        askVolume: Math.floor(baseVolume * (0.5 + imbalance * 0.3)),
        delta: Math.floor((baseVolume * (0.5 + imbalance * 0.3)) - (baseVolume * (0.5 - imbalance * 0.3))),
      };
      currentPrice += priceStep;
    }

    const totalBid = Object.values(levels).reduce((sum, l) => sum + l.bidVolume, 0);
    const totalAsk = Object.values(levels).reduce((sum, l) => sum + l.askVolume, 0);

    data.push({
      time: new Date(Date.now() - (bars - i) * 60000).toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 2000) + 500,
      delta: totalAsk - totalBid,
      cumulativeDelta: (data[i - 1]?.cumulativeDelta || 0) + (totalAsk - totalBid),
      levels,
      poc: Object.entries(levels).reduce((max, [price, l]) =>
        (l.bidVolume + l.askVolume) > (levels[max]?.bidVolume + levels[max]?.askVolume || 0) ? price : max, Object.keys(levels)[0] || '0'),
    });

    price = close;
  }
  return data;
};

const generateDOMData = () => {
  const bids = [];
  const asks = [];
  let bidPrice = 1.0845;
  let askPrice = 1.0846;

  for (let i = 0; i < 10; i++) {
    const bidSize = Math.floor(Math.random() * 100) + 10;
    const askSize = Math.floor(Math.random() * 100) + 10;
    const bidOrders = Math.floor(Math.random() * 20) + 1;
    const askOrders = Math.floor(Math.random() * 20) + 1;

    bids.push({
      price: bidPrice.toFixed(5),
      size: bidSize,
      orders: bidOrders,
      isIceberg: bidSize > 80 && Math.random() > 0.5,
    });

    asks.push({
      price: askPrice.toFixed(5),
      size: askSize,
      orders: askOrders,
      isIceberg: askSize > 80 && Math.random() > 0.5,
    });

    bidPrice -= 0.0001;
    askPrice += 0.0001;
  }

  const spread = (1.0846 - 1.0845).toFixed(5);

  return { bids, asks, spread, lastPrice: 1.08453, timestamp: new Date().toISOString() };
};

function FootprintCell({ level, maxVolume }) {
  if (!level) return null;

  const total = level.bidVolume + level.askVolume;
  const bidPct = (level.bidVolume / total) * 100;
  const askPct = (level.askVolume / total) * 100;
  const intensity = total / maxVolume;

  return (
    <div className="flex h-6 text-xs font-mono relative">
      <div
        className="flex items-center justify-end pr-1 transition-all"
        style={{
          width: `${bidPct}%`,
          backgroundColor: `rgba(239, 68, 68, ${intensity * 0.6})`,
        }}
      >
        {level.bidVolume > 0 && level.bidVolume}
      </div>
      <div
        className="flex items-center pl-1 transition-all"
        style={{
          width: `${askPct}%`,
          backgroundColor: `rgba(34, 197, 94, ${intensity * 0.6})`,
        }}
      >
        {level.askVolume > 0 && level.askVolume}
      </div>
    </div>
  );
}

function FootprintChart({ data }) {
  if (!data || data.length === 0) return null;

  const allVolumes = data.flatMap(bar =>
    Object.values(bar.levels || {}).map(l => (l.bidVolume || 0) + (l.askVolume || 0))
  );
  const maxVolume = Math.max(...allVolumes, 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[2px] min-w-fit">
        {data.map((bar, barIdx) => (
          <div key={barIdx} className="flex flex-col">
            {Object.entries(bar.levels || {})
              .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
              .map(([price, level]) => (
                <FootprintCell key={price} level={level} maxVolume={maxVolume} />
              ))}
            <div className="h-1 bg-border/30 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function VolumeDeltaChart({ data }) {
  const maxDelta = Math.max(...data.map(d => Math.abs(d.delta)), 1);

  return (
    <div className="flex gap-1 h-32 items-end">
      {data.map((bar, i) => (
        <div key={i} className="flex flex-col items-center justify-end h-full">
          <div
            className="w-4 rounded-t transition-all"
            style={{
              height: `${(Math.abs(bar.delta) / maxDelta) * 100}%`,
              backgroundColor: bar.delta >= 0 ? '#22c55e' : '#ef4444',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function CumulativeDeltaChart({ data }) {
  const values = data.map(d => d.cumulativeDelta);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const zeroLine = ((0 - min) / range) * 100;

  return (
    <div className="relative h-32 border border-border/30 rounded">
      <div
        className="absolute left-0 right-0 border-t border-dashed border-border"
        style={{ bottom: `${zeroLine}%` }}
      />
      <svg className="w-full h-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.cumulativeDelta - min) / range) * 100;
            return `${x}%,${y}%`;
          }).join(' ')}
        />
      </svg>
    </div>
  );
}

function DOMPanel({ data }) {
  const maxBid = Math.max(...data.bids.map(b => b.size), 1);
  const maxAsk = Math.max(...data.asks.map(a => a.size), 1);
  const maxSize = Math.max(maxBid, maxAsk);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="text-muted-foreground">BID</div>
        <div className="text-emerald-400 font-bold">{data.lastPrice?.toFixed(5) || '-'}</div>
        <div className="text-muted-foreground">ASK</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <span>Size</span>
            <span>Price</span>
          </div>
          {data.bids.map((bid, i) => (
            <div key={i} className="relative">
              <div
                className="absolute inset-y-0 left-0 bg-red-500/20 rounded"
                style={{ width: `${(bid.size / maxSize) * 100}%` }}
              />
              <div className="grid grid-cols-2 gap-1 text-xs font-mono relative z-10 py-0.5">
                <span className="text-red-400 flex items-center gap-1">
                  {bid.isIceberg && <Zap className="w-3 h-3 text-amber-400" />}
                  {bid.size}
                </span>
                <span>{bid.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center border-x border-border/30 px-4">
          <div className="text-2xl font-bold text-emerald-400">{data.spread}</div>
          <div className="text-xs text-muted-foreground">SPREAD</div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <span>Price</span>
            <span>Size</span>
          </div>
          {data.asks.map((ask, i) => (
            <div key={i} className="relative">
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/20 rounded"
                style={{ width: `${(ask.size / maxSize) * 100}%` }}
              />
              <div className="grid grid-cols-2 gap-1 text-xs font-mono relative z-10 py-0.5">
                <span>{ask.price}</span>
                <span className="text-emerald-400 flex items-center justify-end gap-1">
                  {ask.isIceberg && <Zap className="w-3 h-3 text-amber-400" />}
                  {ask.size}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Total Bid Liquidity</div>
          <div className="text-xl font-bold text-red-400">
            {data.bids.reduce((sum, b) => sum + b.size, 0).toLocaleString()}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Imbalance Ratio</div>
          <div className="text-xl font-bold">
            {(
              (data.asks.reduce((sum, a) => sum + a.size, 0) /
                data.bids.reduce((sum, b) => sum + b.size, 0)) || 1
            ).toFixed(2)}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Total Ask Liquidity</div>
          <div className="text-xl font-bold text-emerald-400">
            {data.asks.reduce((sum, a) => sum + a.size, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImbalanceGauge({ data }) {
  const bidTotal = data.bids.reduce((sum, b) => sum + b.size, 0);
  const askTotal = data.asks.reduce((sum, a) => sum + a.size, 0);
  const total = bidTotal + askTotal;
  const askPct = (askTotal / total) * 100;
  const bidPct = (bidTotal / total) * 100;

  const latestDelta = data.latestDelta || 0;
  const deltaColor = latestDelta >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="relative h-4 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 bg-red-500 transition-all"
            style={{ width: `${bidPct}%` }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 bg-emerald-500 transition-all"
            style={{ width: `${askPct}%` }}
          />
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-border" />
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-red-400">{bidPct.toFixed(1)}%</span>
          <span className="text-muted-foreground">BID / ASK</span>
          <span className="text-emerald-400">{askPct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Volume Delta</div>
          <div className={`text-xl font-bold ${deltaColor}`}>
            {latestDelta >= 0 ? '+' : ''}{latestDelta.toLocaleString()}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Signal</div>
          <Badge variant={askPct > 55 ? 'success' : bidPct > 55 ? 'destructive' : 'secondary'}>
            {askPct > 55 ? 'BULLISH' : bidPct > 55 ? 'BEARISH' : 'NEUTRAL'}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Max Bid Size</div>
          <div className="text-sm font-mono text-red-400">
            {Math.max(...data.bids.map(b => b.size)).toLocaleString()}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Max Ask Size</div>
          <div className="text-sm font-mono text-emerald-400">
            {Math.max(...data.asks.map(a => a.size)).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderFlow() {
  const [symbol, setSymbol] = useState('EUR/USD');
  const [bars, setBars] = useState(20);
  const [showDelta, setShowDelta] = useState(true);
  const [showCumulative, setShowCumulative] = useState(true);
  const [footprintData, setFootprintData] = useState([]);
  const [domData, setDomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setFootprintData(generateFootprintData(bars));
      setDomData({
        ...generateDOMData(),
        latestDelta: footprintData[footprintData.length - 1]?.delta || Math.floor(Math.random() * 500 - 250),
      });
      setIsLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [bars]);

  useEffect(() => {
    if (footprintData.length > 0 && domData) {
      setDomData(prev => ({
        ...prev,
        ...generateDOMData(),
        latestDelta: footprintData[footprintData.length - 1]?.delta || 0,
      }));
    }
  }, [footprintData]);

  const latestBar = footprintData[footprintData.length - 1];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Flow Analysis</h1>
          <p className="text-muted-foreground">Footprint charts, DOM, and volume delta visualization</p>
        </div>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR/USD">EUR/USD</SelectItem>
            <SelectItem value="GBP/USD">GBP/USD</SelectItem>
            <SelectItem value="USD/JPY">USD/JPY</SelectItem>
            <SelectItem value="XAU/USD">XAU/USD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Latest Delta</span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${latestBar?.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {latestBar?.delta >= 0 ? '+' : ''}{latestBar?.delta?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Cumulative Delta</span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${latestBar?.cumulativeDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {latestBar?.cumulativeDelta?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">Volume</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {latestBar?.volume?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">POC Price</span>
            </div>
            <div className="text-2xl font-bold mt-2 font-mono">
              {latestBar?.poc || '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Footprint Chart
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Bars: {bars}</Label>
                  <Slider
                    value={[bars]}
                    onValueChange={([v]) => setBars(v)}
                    min={10}
                    max={50}
                    step={5}
                    className="w-24"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FootprintChart data={footprintData} />
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Oldest</span>
                <span>Latest</span>
              </div>
            </CardContent>
          </Card>

          {showDelta && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Volume Delta
                </CardTitle>
                <Badge variant="outline" className="text-xs">Per Bar</Badge>
              </CardHeader>
              <CardContent>
                <VolumeDeltaChart data={footprintData} />
              </CardContent>
            </Card>
          )}

          {showCumulative && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Cumulative Delta
                </CardTitle>
                <Badge variant="outline" className="text-xs">Running Total</Badge>
              </CardHeader>
              <CardContent>
                <CumulativeDeltaChart data={footprintData} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Depth of Market
              </CardTitle>
              <Badge variant="outline" className="text-xs">L2</Badge>
            </CardHeader>
            <CardContent>
              {domData && <DOMPanel data={domData} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Imbalance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {domData && <ImbalanceGauge data={domData} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Delta</Label>
                <Switch checked={showDelta} onCheckedChange={setShowDelta} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Cumulative</Label>
                <Switch checked={showCumulative} onCheckedChange={setShowCumulative} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
