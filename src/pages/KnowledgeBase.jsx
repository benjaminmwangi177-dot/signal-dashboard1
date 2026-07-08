import React, { useState } from 'react';
import { KNOWLEDGE_BASE } from '@/lib/advancedTools';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function KnowledgeBase() {
  const [openCategory, setOpenCategory] = useState(0);
  const [openArticle, setOpenArticle] = useState(null);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h1 className="font-heading font-bold text-lg">Knowledge Base</h1>
      </div>

      <div className="space-y-2">
        {KNOWLEDGE_BASE.map((cat, ci) => (
          <div key={ci} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenCategory(openCategory === ci ? -1 : ci)}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-secondary/30"
            >
              <span className="font-semibold text-sm">{cat.category}</span>
              <span className="text-xs text-muted-foreground">({cat.articles.length})</span>
              <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${openCategory === ci ? 'rotate-180' : ''}`} />
            </button>
            {openCategory === ci && (
              <div className="divide-y divide-border/50 border-t border-border">
                {cat.articles.map((art, ai) => (
                  <div key={ai}>
                    <button
                      onClick={() => setOpenArticle(openArticle === `${ci}-${ai}` ? null : `${ci}-${ai}`)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-secondary/20"
                    >
                      <span className="text-sm font-medium">{art.title}</span>
                      <ChevronDown className={`w-3.5 h-3.5 ml-auto text-muted-foreground transition-transform ${openArticle === `${ci}-${ai}` ? 'rotate-180' : ''}`} />
                    </button>
                    {openArticle === `${ci}-${ai}` && (
                      <div className="px-4 pb-3">
                        <p className="text-sm text-foreground/70 leading-relaxed">{art.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}