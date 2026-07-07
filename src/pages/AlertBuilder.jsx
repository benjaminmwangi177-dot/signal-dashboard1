import React, { useState, useMemo } from 'react';
import { generateSampleAlerts, ALERT_CONDITIONS } from '@/lib/advancedTools';
import { DEFAULT_INSTRUMENTS } from '@/lib/constants';
import { Bell, Plus, Trash2, Zap } from 'lucide-react';

export default function AlertBuilder() {
  const [alerts, setAlerts] = useState(generateSampleAlerts());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: 'EURUSD', condition: 'confidence_gt', value: '80' });

  function toggleAlert(id) {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  }

  function deleteAlert(id) {
    setAlerts(alerts.filter(a => a.id !== id));
  }

  function addAlert() {
    const newId = Math.max(0, ...alerts.map(a => a.id)) + 1;
    setAlerts([...alerts, { id: newId, symbol: form.symbol, condition: form.condition, value: parseFloat(form.value) || null, active: true, triggered: 0 }]);
    setShowForm(false);
  }

  const conditionLabel = (key) => ALERT_CONDITIONS.find(c => c.key === key)?.label || key;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-amber-400" />
        <h1 className="font-heading font-bold text-lg">Alert Builder</h1>
        <button onClick={() => setShowForm(!showForm)} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20">
          <Plus className="w-3.5 h-3.5" /> New Alert
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <select value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border">
              {DEFAULT_INSTRUMENTS.map(i => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
            </select>
            <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border">
              {ALERT_CONDITIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <input type="text" placeholder="Value" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="bg-secondary text-sm rounded-lg px-2 py-2 border border-border" />
          </div>
          <button onClick={addAlert} className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30">Create Alert</button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {alerts.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
              <div className={`w-2 h-2 rounded-full ${a.active ? 'bg-emerald-400 pulse-live' : 'bg-slate-600'}`} />
              <div className="text-sm font-mono font-bold w-20">{a.symbol}</div>
              <div className="flex-1 text-sm text-muted-foreground">
                {conditionLabel(a.condition)} {a.value !== null && <span className="font-mono font-bold text-foreground">{a.value}</span>}
              </div>
              {a.triggered > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Zap className="w-3 h-3" /> {a.triggered}x
                </div>
              )}
              <button onClick={() => toggleAlert(a.id)} className={`px-2 py-1 rounded text-[10px] font-bold ${a.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                {a.active ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => deleteAlert(a.id)} className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {alerts.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No alerts configured.</div>}
        </div>
      </div>
    </div>
  );
}