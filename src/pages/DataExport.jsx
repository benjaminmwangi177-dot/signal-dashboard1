import React, { useState } from 'react';
import { getSignalIntelligenceDB, calculateAccuracyStats, getVolatilityIntelligence, getAdvancedRiskMetrics } from '@/lib/advancedTools';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState('');

  const datasets = [
    { key: 'signals', label: 'Signal History', getData: () => getSignalIntelligenceDB() },
    { key: 'accuracy', label: 'Strategy Accuracy', getData: () => calculateAccuracyStats() },
    { key: 'volatility', label: 'Volatility Intelligence', getData: () => getVolatilityIntelligence() },
    { key: 'risk', label: 'Risk Metrics', getData: () => getAdvancedRiskMetrics() },
  ];

  function download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON(ds) {
    setExporting(true);
    const data = ds.getData();
    download(JSON.stringify(data, null, 2), `${ds.key}_export.json`, 'application/json');
    setStatus(`Exported ${data.length} records as JSON`);
    setExporting(false);
  }

  function exportCSV(ds) {
    setExporting(true);
    const data = ds.getData();
    if (data.length === 0) { setStatus('No data to export'); setExporting(false); return; }
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const csv = [
      keys.join(','),
      ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))
    ].join('\n');
    download(csv, `${ds.key}_export.csv`, 'text/csv');
    setStatus(`Exported ${data.length} records as CSV`);
    setExporting(false);
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5 text-emerald-400" />
        <h1 className="font-heading font-bold text-lg">Data Export</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {datasets.map(ds => (
          <div key={ds.key} className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold text-sm mb-1">{ds.label}</h3>
            <p className="text-xs text-muted-foreground mb-3">{ds.getData().length} records available</p>
            <div className="flex gap-2">
              <button onClick={() => exportJSON(ds)} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium hover:bg-purple-500/20 disabled:opacity-40">
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
              <button onClick={() => exportCSV(ds)} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-40">
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {status && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-sm text-emerald-400">
          {status}
        </div>
      )}
    </div>
  );
}