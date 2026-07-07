import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Save, Loader2, MessageCircle, Mail, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CHANNELS = [
  { key: 'telegram', label: 'Telegram', icon: MessageCircle, fields: ['chat_id', 'webhook_url'] },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, fields: ['webhook_url'] },
  { key: 'email', label: 'Email', icon: Mail, fields: ['email_address'] },
  { key: 'discord', label: 'Discord', icon: Hash, fields: ['webhook_url'] },
  { key: 'browser_push', label: 'Browser Push', icon: Bell, fields: [] },
];

export default function Notifications() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadConfigs(); }, []);

  async function loadConfigs() {
    try {
      const saved = await base44.entities.NotificationConfig.list();
      const map = {};
      saved.forEach(c => { map[c.channel] = c; });
      CHANNELS.forEach(ch => {
        if (!map[ch.key]) {
          map[ch.key] = { channel: ch.key, enabled: false, signal_tier: 'confirmed_only', min_confidence: 70 };
        }
      });
      setConfigs(map);
    } catch { /* empty */ }
    setLoading(false);
  }

  function updateConfig(channel, field, value) {
    setConfigs(prev => ({
      ...prev,
      [channel]: { ...prev[channel], [field]: value }
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const [key, config] of Object.entries(configs)) {
        if (config.id) {
          await base44.entities.NotificationConfig.update(config.id, config);
        } else {
          const created = await base44.entities.NotificationConfig.create(config);
          setConfigs(prev => ({ ...prev, [key]: created }));
        }
      }
      toast({ title: 'Saved', description: 'Notification settings updated.' });
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-400" />
          <h1 className="font-heading font-bold text-xl">Notifications</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <div className="space-y-4">
        {CHANNELS.map(ch => {
          const config = configs[ch.key];
          if (!config) return null;
          const Icon = ch.icon;

          return (
            <div key={ch.key} className={`rounded-xl border bg-card p-4 transition-all ${config.enabled ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{ch.label}</span>
                </div>
                <button onClick={() => updateConfig(ch.key, 'enabled', !config.enabled)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    config.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-secondary text-muted-foreground'
                  }`}>
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {config.enabled && (
                <div className="space-y-3 mt-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase block mb-1">Signal Tier</label>
                      <select value={config.signal_tier} onChange={e => updateConfig(ch.key, 'signal_tier', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border">
                        <option value="confirmed_only">Confirmed Only</option>
                        <option value="all_signals">All Signals</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase block mb-1">Min Confidence</label>
                      <input type="number" min="0" max="100" value={config.min_confidence}
                        onChange={e => updateConfig(ch.key, 'min_confidence', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono" />
                    </div>
                  </div>
                  {ch.fields.map(f => (
                    <div key={f}>
                      <label className="text-[10px] text-muted-foreground uppercase block mb-1">{f.replace(/_/g, ' ')}</label>
                      <input type="text" value={config[f] || ''} onChange={e => updateConfig(ch.key, f, e.target.value)}
                        placeholder={`Enter ${f.replace(/_/g, ' ')}...`}
                        className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-border" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}