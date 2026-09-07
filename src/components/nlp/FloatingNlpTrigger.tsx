'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface FloatingNlpTriggerProps {
  onClick: () => void;
}

export const FloatingNlpTrigger: React.FC<FloatingNlpTriggerProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl hover:shadow-red-500/30 transition-all hover:scale-105 active:scale-95 group cursor-pointer border-2 border-white/80 select-none"
      title="Open Property Decision Concierge (Voice & Natural Language Intelligence)"
    >
      <div className="relative">
        <Bot className="w-5 h-5 text-white animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-red-600" />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-black tracking-wide font-sans leading-none flex items-center gap-1">
          <span>DECISION CONCIERGE</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </span>
        <span className="text-[10px] text-white/80 font-medium leading-tight">
          Voice & Natural Search (1,000 Trained)
        </span>
      </div>
    </button>
  );
};
