import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { STRATEGIES } from '@/lib/constants';
import { Activity, ToggleLeft, ToggleRight, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_PARAMS = {
  smart_money: { bos_enabled: true, fvg_enabled: true, ob_enabled: true, liquidity_sweep: true, volume_profile: true },
  ai_ml: { gradient_boost: true, random_forest: true, lstm: true, rl_weighting: true, bayesian: true },
  chart_patterns: { head_shoulders: true, double_top_bottom: true, triangles: true, harmonics: true, flags: true },
  candlestick: { pin_bar: true, engulfing: true, doji: true, hammer: true, morning_evening_star: true },
  technical_indicators: { ema: true, rsi: true, macd: true, atr: true, bollinger: true, ichimoku: true, supertrend: true, vwap: true },
  wyckoff_ict: { accumulation: true, distribution: true, spring_upthrust: true, judas_swing: true, killzone: true },
};

export default function Strategies() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      const saved = await base44.entities.StrategyConfig.list();
      const map = {};
      saved.forEach(c => { map[c.strategy_key] = c; });

      // Fill defaults for missing
      STRATEGIES.forEach(s => {
        if (!map[s.key]) {
          map[s.key] = {
            strategy_key: s.key,
            display_name: s.name,
            enabled: true,
            weight: 1.0,
            parameters: DEFAULT_PARAMS[s.key] || {},
            accuracy_history: 50,
            total_signals: 0,
            correct_signals: 0,
          };
        }
      });
      setConfigs(map);
    } catch { /* empty */ }
    setLoading(false);
  }

  function toggleStrategy(key) {
    setConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  }

  function updateWeight(key, weight) {
    setConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], weight: parseFloat(weight) || 1 }
    }));
  }

  function toggleParam(stratKey, paramKey) {
    setConfigs(prev => ({
      ...prev,
      [stratKey]: {
        ...prev[stratKey],
        parameters: {
          ...prev[stratKey].parameters,
          [paramKey]: !prev[stratKey].parameters[paramKey]
        }
      }
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const [key, config] of Object.entries(configs)) {
        if (config.id) {
          await base44.entities.StrategyConfig.update(config.id, config);
        } else {
          const created = await base44.entities.StrategyConfig.create(config);
          setConfigs(prev => ({ ...prev, [key]: created }));
        }
      }
      toast({ title: 'Saved', description: 'Strategy configurations updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h1 className="font-heading font-bold text-xl">Strategy Modules</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All
        </button>
      </div>

      <div className="space-y-4">
        {STRATEGIES.map(s => {
          const config = configs[s.key];
          if (!config) return null;

          return (
            <div key={s.key} className={`rounded-xl border bg-card overflow-hidden transition-all ${
              config.enabled ? 'border-border' : 'border-border opacity-50'
            }`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <div>
                    <h3 className="font-semibold text-sm">{s.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span>Accuracy: {config.accuracy_history}%</span>
                      <span>Signals: {config.total_signals}</span>
                      <span>Correct: {config.correct_signals}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-muted-foreground uppercase">Weight</label>
                    <input
                      type="number" step="0.1" min="0" max="5"
                      value={config.weight}
                      onChange={e => updateWeight(s.key, e.target.value)}
                      className="w-16 px-2 py-1 text-sm font-mono bg-secondary rounded border border-border text-center"
                    />
                  </div>
                  <button onClick={() => toggleStrategy(s.key)}>
                    {config.enabled
                      ? <ToggleRight className="w-8 h-8 text-emerald-400" />
                      : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                    }
                  </button>
                </div>
              </div>

              {config.enabled && config.parameters && (
                <div className="px-4 pb-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(config.parameters).map(([pk, pv]) => (
                      <button key={pk} onClick={() => toggleParam(s.key, pk)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                          pv
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-secondary text-muted-foreground border-border'
                        }`}>
                        {pk.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}