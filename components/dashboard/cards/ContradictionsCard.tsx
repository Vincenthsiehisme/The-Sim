
import React from 'react';
import { ShieldAlert, Split, Zap, Quote, AlertTriangle } from 'lucide-react';
import { SectionTitle } from '../ui/SectionTitle';
import { EvidenceBadge } from '../ui/EvidenceBadge';
import { ContradictionsAndInsights } from '../../../types';

export const ContradictionsCard: React.FC<{ 
  data: ContradictionsAndInsights 
}> = ({ data }) => {
  const { conflicts, paradox_core, irrational_triggers } = data;
  
  // Safe defaults
  const safeParadox = paradox_core || "尚無核心矛盾描述。";
  const safeTriggers = irrational_triggers || [];
  const safeConflicts = conflicts || [];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col min-w-0">
      <SectionTitle 
        title="矛盾與洞察" 
        subtitle="行為背後的深層衝突" 
        icon={ShieldAlert} 
        info="揭示使用者言行不一的具體情境，以及容易引發非理性行為的關鍵字。"
      />

      <div className="flex-1 flex flex-col gap-4">
        
        {/* 1. Paradox Core (The Headline) */}
        <div className="relative bg-slate-900 rounded-xl p-4 overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                    <Split className="w-3 h-3" />
                    Paradox Core (核心矛盾)
                </div>
                <div className="flex gap-3">
                    <Quote className="w-8 h-8 text-slate-700 shrink-0 transform -scale-x-100" />
                    <p className="text-sm md:text-base font-medium text-slate-200 leading-relaxed italic">
                        {safeParadox}
                    </p>
                </div>
            </div>
        </div>

        {/* 2. Irrational Triggers (The Minefield) */}
        {safeTriggers.length > 0 && (
            <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                    <Zap className="w-3 h-3 fill-current" />
                    理智斷線關鍵字 (Irrational Triggers)
                </div>
                <div className="flex flex-wrap gap-2">
                    {safeTriggers.map((trigger, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg shadow-sm">
                            <AlertTriangle className="w-3 h-3" />
                            {trigger}
                        </span>
                    ))}
                </div>
            </div>
        )}

        {/* 3. Conflicts Grid (The Evidence) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-[120px]">
            {safeConflicts.length > 0 ? (
                safeConflicts.slice(0, 2).map((conflict, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col h-full hover:border-slate-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 truncate max-w-[120px]">
                                {conflict.type}
                            </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mb-3 flex-1 line-clamp-3">
                            {conflict.description}
                        </p>
                        <EvidenceBadge text={conflict.evidence} />
                    </div>
                ))
            ) : (
                <div className="col-span-2 flex items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-100 rounded-xl">
                    數據一致，無顯著行為衝突
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
