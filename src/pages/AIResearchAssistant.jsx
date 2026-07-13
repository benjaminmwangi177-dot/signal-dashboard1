import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getSignalIntelligenceDB, calculateAccuracyStats, getVolatilityIntelligence } from '@/lib/advancedTools';
import { Search, Sparkles, Send } from 'lucide-react';

const SAMPLE_QUERIES = [
  'Show all bullish setups above 80% confidence',
  'Which strategy performed best this week?',
  'What markets are in breakout conditions?',
  'Best session for EURUSD trades?',
];

export default function AIResearchAssistant() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask(q) {
    const question = q || query;
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');

    const signals = getSignalIntelligenceDB();
    const accuracy = calculateAccuracyStats();
    const vol = getVolatilityIntelligence();
    const context = JSON.stringify({ signals: signals.slice(0, 20), accuracy, volatility: vol.slice(0, 10) });

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a trading research assistant. Answer the user's question based on this market data context. Be concise and specific.

Context data: ${context}

Question: ${question}`,
        response_json_schema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] },
      });
      if (typeof res === 'object' && res !== null && 'answer' in res && typeof res.answer === 'string') {
        setAnswer(res.answer);
      } else {
        throw new Error('Invalid research response');
      }
    } catch {
      setAnswer('Unable to process your query at this time. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">AI Research Assistant</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="Ask about signals, strategies, or market conditions..."
              className="w-full bg-secondary text-sm rounded-lg pl-10 pr-4 py-2.5 border border-border focus:border-purple-500/50 outline-none"
            />
          </div>
          <button onClick={() => ask()} disabled={loading || !query.trim()} className="px-4 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-40 flex items-center gap-1.5 text-sm font-medium">
            <Send className="w-4 h-4" /> Ask
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {SAMPLE_QUERIES.map(q => (
            <button key={q} onClick={() => { setQuery(q); ask(q); }} className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      )}

      {answer && !loading && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Response</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}