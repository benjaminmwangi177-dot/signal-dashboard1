import React, { useState } from 'react';
import { STRATEGY_BLOCKS } from '@/lib/advancedTools';
import { Blocks, Plus, X, Play, Save } from 'lucide-react';

export default function StrategyBuilder() {
  const [blocks, setBlocks] = useState({ entry_condition: null, confirmation: null, stop_loss: null, take_profit: null, filter: null });
  const [name, setName] = useState('My Custom Strategy');

  function selectOption(blockKey, option) {
    setBlocks({ ...blocks, [blockKey]: option });
  }

  function clearBlock(blockKey) {
    setBlocks({ ...blocks, [blockKey]: null });
  }

  const isComplete = Object.values(blocks).every(v => v !== null);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Blocks className="w-5 h-5 text-purple-400" />
        <h1 className="font-heading font-bold text-lg">Strategy Builder</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-secondary text-sm rounded-lg px-3 py-2 border border-border w-full mb-4" placeholder="Strategy name" />
        
        <div className="space-y-3">
          {STRATEGY_BLOCKS.map(block => (
            <div key={block.key} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{block.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{block.category}</span>
                {blocks[block.key] && (
                  <button onClick={() => clearBlock(block.key)} className="ml-auto p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {block.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => selectOption(block.key, opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      blocks[block.key] === opt
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button disabled={!isComplete} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 disabled:opacity-40">
            <Play className="w-3.5 h-3.5" /> Test Strategy
          </button>
          <button disabled={!isComplete} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 disabled:opacity-40">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          {!isComplete && <span className="text-xs text-muted-foreground">Select all blocks to enable</span>}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Strategy Summary</h3>
        <div className="space-y-1.5 text-sm">
          {STRATEGY_BLOCKS.map(block => (
            <div key={block.key} className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-32">{block.label}:</span>
              <span className={`font-mono ${blocks[block.key] ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                {blocks[block.key] || '— not set —'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}