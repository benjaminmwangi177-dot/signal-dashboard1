import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_INSTRUMENTS, ASSET_CLASSES } from '@/lib/constants';
import { Settings, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInst, setNewInst] = useState({ symbol: '', name: '', asset_class: 'forex' });
  const [confirmThreshold, setConfirmThreshold] = useState(4);
  const [defaultTf, setDefaultTf] = useState('1h');

  useEffect(() => { loadInstruments(); }, []);

  async function loadInstruments() {
    try {
      const saved = await base44.entities.Instrument.list();
      setInstruments(saved.length > 0 ? saved : DEFAULT_INSTRUMENTS.map(i => ({ ...i, enabled: true })));
    } catch {
      setInstruments(DEFAULT_INSTRUMENTS.map(i => ({ ...i, enabled: true })));
    }
    setLoading(false);
  }

  function toggleInstrument(idx) {
    setInstruments(prev => prev.map((inst, i) => i === idx ? { ...inst, enabled: !inst.enabled } : inst));
  }

  function addInstrument() {
    if (!newInst.symbol || !newInst.name) return;
    setInstruments(prev => [...prev, { ...newInst, enabled: true }]);
    setNewInst({ symbol: '', name: '', asset_class: 'forex' });
  }

  function removeInstrument(idx) {
    setInstruments(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Delete existing and recreate
      const existing = await base44.entities.Instrument.list();
      for (const inst of existing) {
        await base44.entities.Instrument.delete(inst.id);
      }
      for (const inst of instruments) {
        const { id, created_date, updated_date, created_by_id, ...data } = inst;
        await base44.entities.Instrument.create(data);
      }
      toast({ title: 'Saved', description: 'Instrument list updated.' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
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
          <Settings className="w-5 h-5 text-slate-400" />
          <h1 className="font-heading font-bold text-xl">Settings</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      {/* Confirmation settings */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Confirmation Engine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Min Strategies to Confirm</label>
            <input type="number" min="2" max="6" value={confirmThreshold}
              onChange={e => setConfirmThreshold(parseInt(e.target.value) || 4)}
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Default Timeframe</label>
            <select value={defaultTf} onChange={e => setDefaultTf(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
              {['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Instrument management */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Instruments ({instruments.filter(i => i.enabled !== false).length} active)
          </h3>
        </div>

        {/* Add new */}
        <div className="flex items-end gap-2 p-4 border-b border-border bg-secondary/30">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Symbol</label>
            <input type="text" value={newInst.symbol} onChange={e => setNewInst({ ...newInst, symbol: e.target.value.toUpperCase() })}
              placeholder="EURUSD" className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Name</label>
            <input type="text" value={newInst.name} onChange={e => setNewInst({ ...newInst, name: e.target.value })}
              placeholder="EUR/USD" className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border" />
          </div>
          <div className="w-32">
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Class</label>
            <select value={newInst.asset_class} onChange={e => setNewInst({ ...newInst, asset_class: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
              {ASSET_CLASSES.map(ac => <option key={ac.key} value={ac.key}>{ac.label}</option>)}
            </select>
          </div>
          <button onClick={addInstrument}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
          {instruments.map((inst, idx) => (
            <div key={idx} className={`flex items-center justify-between px-4 py-2.5 ${inst.enabled === false ? 'opacity-40' : ''}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleInstrument(idx)}
                  className={`w-4 h-4 rounded border ${inst.enabled !== false ? 'bg-emerald-500 border-emerald-500' : 'border-border'}`} />
                <span className="font-mono text-sm font-medium">{inst.symbol}</span>
                <span className="text-xs text-muted-foreground">{inst.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground capitalize px-2 py-0.5 bg-secondary rounded">{inst.asset_class}</span>
                <button onClick={() => removeInstrument(idx)} className="text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}