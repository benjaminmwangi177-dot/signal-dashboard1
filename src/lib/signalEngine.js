import { base44 } from '@/api/base44Client';
import { STRATEGIES, TIMEFRAMES } from './constants';

// Generate a simulated signal for a strategy + instrument
function generateStrategySignal(strategyKey, symbol, timeframe) {
  const rand = Math.random();
  const direction = rand > 0.6 ? 'BUY' : rand > 0.3 ? 'SELL' : 'NEUTRAL';
  const confidence = Math.floor(40 + Math.random() * 55);
  
  const trendContexts = ['Strong Bullish', 'Weak Bullish', 'Ranging', 'Weak Bearish', 'Strong Bearish'];
  const trend = trendContexts[Math.floor(Math.random() * trendContexts.length)];
  
  const riskLevels = ['Low', 'Medium', 'High'];
  const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  
  return { direction, confidence, trend_context: trend, risk_level: risk, timeframe };
}

// Run all strategies on an instrument and produce solo + combined signals
export function analyzeInstrument(symbol, name, assetClass) {
  const soloSignals = {};
  const primaryTf = '1h';

  STRATEGIES.forEach(s => {
    soloSignals[s.key] = generateStrategySignal(s.key, symbol, primaryTf);
  });

  // Timeframe alignment
  const tfAlignment = {};
  TIMEFRAMES.filter(tf => ['1m', '5m', '15m', '1h', '4h', 'D'].includes(tf)).forEach(tf => {
    const r = Math.random();
    tfAlignment[tf] = r > 0.5 ? 'BUY' : r > 0.2 ? 'SELL' : 'NEUTRAL';
  });

  // Confirmation logic
  const activeStrategies = Object.values(soloSignals).filter(s => s.direction !== 'NEUTRAL');
  const buyCount = activeStrategies.filter(s => s.direction === 'BUY').length;
  const sellCount = activeStrategies.filter(s => s.direction === 'SELL').length;
  const totalActive = activeStrategies.length;
  const totalStrategies = STRATEGIES.length;

  let confirmedDirection = 'NEUTRAL';
  let agreementCount = 0;
  let strategiesAgreeing = [];

  if (buyCount >= 4) {
    confirmedDirection = 'BUY';
    agreementCount = buyCount;
    strategiesAgreeing = Object.entries(soloSignals)
      .filter(([, s]) => s.direction === 'BUY')
      .map(([k]) => k);
  } else if (sellCount >= 4) {
    confirmedDirection = 'SELL';
    agreementCount = sellCount;
    strategiesAgreeing = Object.entries(soloSignals)
      .filter(([, s]) => s.direction === 'SELL')
      .map(([k]) => k);
  }

  const avgConfidence = agreementCount > 0
    ? Math.round(
        Object.entries(soloSignals)
          .filter(([k]) => strategiesAgreeing.includes(k))
          .reduce((sum, [, s]) => sum + s.confidence, 0) / agreementCount
      )
    : 0;

  // Quality flags
  const qualityFlags = [];
  if (avgConfidence < 60) qualityFlags.push('Low confidence');
  const conflictingAI = soloSignals.ai_ml?.direction !== confirmedDirection && confirmedDirection !== 'NEUTRAL';
  if (conflictingAI) qualityFlags.push('AI model conflicts');

  return {
    symbol,
    name,
    asset_class: assetClass,
    soloSignals,
    tfAlignment,
    confirmed: confirmedDirection !== 'NEUTRAL' ? {
      direction: confirmedDirection,
      confidence: avgConfidence,
      agreement: `${agreementCount}/${totalStrategies}`,
      agreementCount,
      strategiesAgreeing,
      risk_level: activeStrategies[0]?.risk_level || 'Medium',
      trend_context: activeStrategies[0]?.trend_context || 'Ranging',
      qualityFlags,
    } : null,
  };
}

// Generate AI explanation for a signal
export async function generateSignalExplanation(signal) {
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a trading analyst. Generate a concise 2-3 sentence explanation for this trading signal. Be specific and reference the strategies that agree.

Signal details:
- Instrument: ${signal.instrument_symbol} (${signal.instrument_name})
- Direction: ${signal.direction}
- Confidence: ${signal.confidence}%
- Signal type: ${signal.signal_type}
- Strategy: ${signal.strategy_name}
- Trend context: ${signal.trend_context}
- Risk level: ${signal.risk_level}
- Agreement: ${signal.agreement_count}
- Strategies agreeing: ${signal.strategies_agreeing?.join(', ') || 'N/A'}

Write as if briefing a trader. Example: "Buy bias: price swept liquidity below prior low, entered bullish order block on 15m, structure shifted bullish on 1h. 5/6 strategies agree. Confidence 87%."`,
      response_json_schema: {
        type: "object",
        properties: {
          explanation: { type: "string" }
        },
        required: ["explanation"]
      }
    });
    if (typeof res === 'object' && res !== null && 'explanation' in res && typeof res.explanation === 'string') {
      return res.explanation;
    }
    throw new Error('Invalid explanation response');
  } catch {
    return `${signal.direction} signal on ${signal.instrument_symbol} with ${signal.confidence}% confidence. ${signal.agreement_count || ''} strategies aligned.`;
  }
}

// Generate mock backtest data
export function generateBacktestData(strategyKey, symbol, lookback) {
  const trades = 50 + Math.floor(Math.random() * 200);
  const winRate = 45 + Math.random() * 30;
  const wins = Math.round(trades * winRate / 100);
  const avgWin = 20 + Math.random() * 80;
  const avgLoss = 15 + Math.random() * 40;
  const profitFactor = (wins * avgWin) / ((trades - wins) * avgLoss);
  
  // Equity curve
  const equityCurve = [];
  let equity = 10000;
  for (let i = 0; i < trades; i++) {
    const isWin = Math.random() < winRate / 100;
    equity += isWin ? avgWin * (0.5 + Math.random()) : -(avgLoss * (0.5 + Math.random()));
    equityCurve.push({ trade: i + 1, equity: Math.round(equity) });
  }

  const maxEquity = Math.max(...equityCurve.map(e => e.equity));
  const minAfterMax = Math.min(...equityCurve.slice(equityCurve.findIndex(e => e.equity === maxEquity)).map(e => e.equity));
  const maxDrawdown = ((maxEquity - minAfterMax) / maxEquity * 100).toFixed(1);

  return {
    strategy_key: strategyKey,
    instrument_symbol: symbol,
    lookback_period: lookback,
    total_trades: trades,
    win_rate: Math.round(winRate * 10) / 10,
    profit_factor: Math.round(profitFactor * 100) / 100,
    sharpe_ratio: Math.round((0.5 + Math.random() * 2.5) * 100) / 100,
    max_drawdown: parseFloat(maxDrawdown),
    expectancy: Math.round((winRate / 100 * avgWin - (1 - winRate / 100) * avgLoss) * 100) / 100,
    equity_curve: equityCurve,
  };
}