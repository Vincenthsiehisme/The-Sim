
import React, { useState, useEffect } from 'react';
import { usePersona } from '../context/PersonaContext';
import { Sliders, RotateCcw, Wallet, EyeOff, Search, Info, AlertTriangle, PanelRightClose, PanelRightOpen, ShoppingCart, BookOpen, Check, Coffee, Clock, MessageCircle, MessageSquareDashed, Instagram, User, ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import { calculateBaselines } from '../utils/personaAnalytics';
import { ScenarioMode, SimulationModifiers, SocialPlatform } from '../types';
import { getTierConfig, SLIDER_LABELS, PLATFORM_PRESETS } from '../utils/contextMapping';

// Helper: Find nearest tier index
const getTierIndex = (val: number) => {
  if (val <= 20) return 0;
  if (val <= 40) return 1;
  if (val <= 60) return 2;
  if (val <= 80) return 3;
  return 4;
};

// Component: 5-Step Segmented Control
const TierControl: React.FC<{
  label: string;
  icon: React.ElementType;
  value: number;
  baseline: number;
  configKey: keyof ReturnType<typeof getTierConfig>;
  mode: ScenarioMode;
  onChange: (val: number) => void;
}> = ({ label, icon: Icon, value, baseline, configKey, mode, onChange }) => {
  
  const tiers = getTierConfig(mode)[configKey];
  const currentIndex = getTierIndex(value);
  const baselineIndex = getTierIndex(baseline);
  const activeTier = tiers[currentIndex];

  const isExtreme = currentIndex === 0 || currentIndex === 4;
  const isChanged = currentIndex !== baselineIndex;

  return (
    <div className="space-y-3 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Icon className={`w-4 h-4 ${isChanged ? 'text-indigo-500' : 'text-slate-400'}`} />
          {label}
        </div>
        {/* Current State Label (Top Right) */}
        <div className={`text-xs font-black ${activeTier.color} transition-colors duration-300`}>
           {activeTier.label}
        </div>
      </div>

      {/* The 5-Step Track */}
      <div className="relative h-10 flex items-center justify-between px-1 bg-slate-50 rounded-xl border border-slate-100 select-none">
         {/* Baseline Marker (Ghost) */}
         <div 
            className="absolute h-full w-[20%] border-2 border-slate-300/50 rounded-lg pointer-events-none transition-all duration-300 z-0 top-0"
            style={{ left: `${baselineIndex * 20}%` }}
            title="原始分析設定 (Original)"
         >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-300 rounded-full"></div>
         </div>

         {/* Steps */}
         {tiers.map((tier, idx) => {
            const isActive = idx === currentIndex;
            return (
               <button
                 key={idx}
                 onClick={() => onChange(tier.value)}
                 className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group focus:outline-none`}
               >
                  <div className={`
                     w-3 h-3 rounded-full transition-all duration-300
                     ${isActive ? `${tier.bg} scale-150 shadow-md` : 'bg-slate-200 group-hover:bg-slate-300'}
                  `}></div>
               </button>
            );
         })}
      </div>

      {/* Impact Preview Box */}
      <div className={`
         relative p-3 rounded-lg border text-xs leading-relaxed transition-all duration-300 whitespace-pre-line
         ${isExtreme ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-100'}
      `}>
         {isExtreme && (
            <div className="absolute top-2 right-2 animate-pulse">
               <AlertTriangle className="w-3 h-3 text-amber-400" />
            </div>
         )}
         <div className="flex gap-2">
            <Info className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeTier.color}`} />
            <span className="text-slate-600">
               {activeTier.desc}
            </span>
         </div>
      </div>
    </div>
  );
};

interface ContextTunerProps {
  excludeModes?: ScenarioMode[];
}

export const ContextTuner: React.FC<ContextTunerProps> = ({ excludeModes = [] }) => {
  const { persona, simulationModifiers, resetModifiers, applyModifiers, scenarioMode, setScenarioMode } = usePersona();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Local Draft State
  const [draftModifiers, setDraftModifiers] = useState<SimulationModifiers | null>(null);
  const [draftMode, setDraftMode] = useState<ScenarioMode>(scenarioMode);

  // Sync draft with global context on mount or when context changes externally
  useEffect(() => {
    if (simulationModifiers) {
      setDraftModifiers(simulationModifiers);
    }
    setDraftMode(scenarioMode);
  }, [simulationModifiers, scenarioMode]);

  if (!persona || !draftModifiers) return null;

  const baselines = calculateBaselines(persona);

  const updateDraft = (key: keyof SimulationModifiers, val: any) => {
     setDraftModifiers(prev => prev ? ({ ...prev, [key]: val }) : null);
  };

  const activePlatform = draftModifiers.social_context?.platform || 'General';

  const handlePlatformSelect = (platform: SocialPlatform) => {
      const preset = PLATFORM_PRESETS[platform];
      let updates: Partial<SimulationModifiers> = {};

      if (platform === 'General') {
          // Reset logic
          updates = {
              budget_anxiety: baselines.budget_anxiety,
              patience: baselines.patience,
              social_mask: baselines.social_mask,
              purchase_intent: baselines.purchase_intent,
              social_context: undefined
          };
      } else if (platform === 'IG') {
          // IG Specific dynamic logic (needs current baseline)
          updates = {
              ...preset.modifiers,
              budget_anxiety: Math.max(draftModifiers.budget_anxiety - 20, 10), // Spend for vibes
              social_context: { platform, description: preset.description }
          };
      } else {
          // Standard Preset (LINE, PTT)
          updates = {
              ...preset.modifiers,
              social_context: { platform, description: preset.description }
          };
      }

      setDraftModifiers(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  const handleApply = () => {
    if (draftModifiers) {
      const platform = draftModifiers.social_context?.platform;
      let msg = '--- 系統狀態已更新 (System Updated) ---';
      
      // Smart message logic
      if (platform && platform !== 'General') {
          msg = `--- 切換場景：${platform} ---`;
      } else if (draftMode !== scenarioMode) {
          const modeLabels: Record<string, string> = { sales: '銷售模式', content: '內容模式', friend: '閒聊模式' };
          msg = `--- 切換為：${modeLabels[draftMode]} ---`;
      }

      applyModifiers(draftModifiers, msg);
      setScenarioMode(draftMode);
    }
  };
  
  const handleReset = () => {
      resetModifiers();
      setDraftMode(scenarioMode);
  };

  const isDirty = (JSON.stringify(draftModifiers) !== JSON.stringify(simulationModifiers)) || (draftMode !== scenarioMode);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[70px]' : 'w-[320px]'}`}>
      
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center h-[24px]">
            {isCollapsed ? (
            <button onClick={toggleCollapse} className="w-full flex justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                <PanelRightOpen className="w-5 h-5" />
            </button>
            ) : (
            <>
                <div className="flex items-center gap-2 text-indigo-900 font-black text-sm uppercase tracking-wide">
                <LayoutGrid className="w-4 h-4" />
                平台場景 (Context)
                </div>
                <div className="flex items-center gap-1">
                <button 
                    onClick={handleReset}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="重置回原始數據"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={toggleCollapse} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    <PanelRightClose className="w-4 h-4" />
                </button>
                </div>
            </>
            )}
        </div>

        {/* Platform Switcher Grid */}
        {!isCollapsed && (
            <div className="grid grid-cols-4 gap-2 mb-1">
               <button 
                  onClick={() => handlePlatformSelect('LINE')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                     activePlatform === 'LINE' 
                       ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                       : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                  }`}
               >
                  <MessageCircle className={`w-5 h-5 mb-1 ${activePlatform === 'LINE' ? 'fill-emerald-200' : ''}`} />
                  <span className="text-[9px] font-bold">LINE</span>
               </button>
               <button 
                  onClick={() => handlePlatformSelect('PTT')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                     activePlatform === 'PTT' 
                       ? 'bg-slate-800 border-slate-900 text-white shadow-md' 
                       : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                  }`}
               >
                  <MessageSquareDashed className={`w-5 h-5 mb-1 ${activePlatform === 'PTT' ? 'text-amber-400' : ''}`} />
                  <span className="text-[9px] font-bold">PTT</span>
               </button>
               <button 
                  onClick={() => handlePlatformSelect('IG')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                     activePlatform === 'IG' 
                       ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 shadow-sm' 
                       : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                  }`}
               >
                  <Instagram className={`w-5 h-5 mb-1 ${activePlatform === 'IG' ? 'text-fuchsia-500' : ''}`} />
                  <span className="text-[9px] font-bold">IG</span>
               </button>
               <button 
                  onClick={() => handlePlatformSelect('General')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                     activePlatform === 'General' 
                       ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                       : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                  }`}
               >
                  <User className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold">原始</span>
               </button>
            </div>
        )}
        
        {/* Narrative Feedback */}
        {!isCollapsed && activePlatform !== 'General' && draftModifiers.social_context && (
            <div className="bg-white/50 border border-slate-200/50 p-2 rounded-lg text-[10px] text-slate-500 leading-snug animate-fade-in flex gap-2">
               <Info className="w-3 h-3 shrink-0 mt-0.5 text-indigo-400" />
               {draftModifiers.social_context.description}
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative pb-20">
         {isCollapsed ? (
            /* MINI MODE (Icons only) */
            <div className="flex flex-col gap-4 py-4 items-center">
               <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 mb-2">
                  {draftMode === 'sales' ? <ShoppingCart className="w-4 h-4"/> : draftMode === 'content' ? <BookOpen className="w-4 h-4"/> : <Coffee className="w-4 h-4" />}
               </div>
               <div className="w-8 h-px bg-slate-100"></div>
               <button onClick={toggleCollapse} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                  <Wallet className="w-5 h-5" />
               </button>
            </div>
         ) : (
            /* FULL MODE */
            <div className="p-5 space-y-6">
                
                {/* 1. Mode Switcher (Moved here for better flow) */}
                <div className="space-y-2">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">目標模式</div>
                   <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-100">
                      {!excludeModes.includes('sales') && (
                      <button 
                         onClick={() => setDraftMode('sales')}
                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                            draftMode === 'sales' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'
                         }`}
                      >
                         <ShoppingCart className="w-3.5 h-3.5" /> 銷售
                      </button>
                      )}
                      {!excludeModes.includes('content') && (
                      <button 
                         onClick={() => setDraftMode('content')}
                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                            draftMode === 'content' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'
                         }`}
                      >
                         <BookOpen className="w-3.5 h-3.5" /> 內容
                      </button>
                      )}
                      {!excludeModes.includes('friend') && (
                      <button 
                         onClick={() => setDraftMode('friend')}
                         className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                            draftMode === 'friend' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'
                         }`}
                      >
                         <Coffee className="w-3.5 h-3.5" /> 閒聊
                      </button>
                      )}
                   </div>
                </div>

                {/* 2. Advanced Parameters (Collapsible) */}
                <div className="border-t border-slate-100 pt-4">
                   <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full text-left group mb-2"
                   >
                      <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                         <Sliders className="w-3.5 h-3.5" />
                         微調社交參數 (Advanced)
                      </span>
                      {showAdvanced ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                   </button>
                   
                   {/* Always keep Purchase Intent visible or put it outside? Let's put everything inside for cleaner look as requested by "Details-Collapsed" */}
                   {showAdvanced && (
                      <div className="space-y-8 pt-2 animate-fade-in">
                        <TierControl 
                           label={SLIDER_LABELS[draftMode].social_mask} 
                           icon={EyeOff} 
                           configKey="social_mask"
                           value={draftModifiers.social_mask} 
                           baseline={baselines.social_mask}
                           mode={draftMode}
                           onChange={(v) => updateDraft('social_mask', v)}
                        />

                        <TierControl 
                           label={SLIDER_LABELS[draftMode].purchase_intent} 
                           icon={Search} 
                           configKey="purchase_intent"
                           value={draftModifiers.purchase_intent} 
                           baseline={baselines.purchase_intent}
                           mode={draftMode}
                           onChange={(v) => updateDraft('purchase_intent', v)}
                        />

                        <TierControl 
                           label={SLIDER_LABELS[draftMode].budget_anxiety} 
                           icon={Wallet} 
                           configKey="budget_anxiety"
                           value={draftModifiers.budget_anxiety} 
                           baseline={baselines.budget_anxiety}
                           mode={draftMode}
                           onChange={(v) => updateDraft('budget_anxiety', v)}
                        />

                        <TierControl 
                           label={SLIDER_LABELS[draftMode].patience} 
                           icon={Clock} 
                           configKey="patience"
                           value={draftModifiers.patience} 
                           baseline={baselines.patience}
                           mode={draftMode}
                           onChange={(v) => updateDraft('patience', v)}
                        />
                      </div>
                   )}
                </div>
            </div>
         )}
         
         {/* Floating Apply Button */}
         {!isCollapsed && isDirty && (
             <div className="absolute bottom-4 left-4 right-4 z-20 animate-fade-in-up">
                <button 
                   onClick={handleApply}
                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                   <Check className="w-5 h-5" />
                   套用變更 (Apply)
                </button>
             </div>
         )}
      </div>
    </div>
  );
};
