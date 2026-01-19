
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, ArrowRight, Sparkles, FileSpreadsheet, Settings2, X, ShoppingCart, MessageSquare, Trash2, History, Database, HelpCircle, AlertTriangle, BrainCircuit, PenTool, FileCheck, CheckCircle2, Terminal, Plus, FileText, Quote, Eye, CreditCard, ScanLine, Lightbulb, UserCog, Dna, FlaskConical, Target, Zap, ShieldAlert, Heart, RefreshCw, Search, Fingerprint, Microscope, Atom, RotateCcw, Download, Activity, TrendingUp, DollarSign, Crown, Lock, Scale, FileBarChart, Clock, Package, ShoppingBag, ArrowDown, Info, Hammer, MapPin, Eraser, UserX, Anchor, TrendingDown, ChevronsDown, Radar, AlertOctagon, Ban, Brain, MousePointer2 } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { analyzeDataAndCreatePersona, synthesizePersonaData, enrichPersonaRole, mirrorPersonaFromProduct } from '../services/geminiService';
import { useChatMessages } from '../context/PersonaContext';
import { getAvatarTitle } from '../utils/personaAnalytics';
import { scanCsvData, DataHealthReport } from '../utils/simpleScanner';
import { DataHealthIndicator } from '../components/upload/DataHealthIndicator';
import { OriginProfile, PersonaDNA, GenderOption, PersonaCandidate, DigitalTwinPersona, SociologyOverrides, FrictionDimensionKey, ProductDiagnosis, FrictionDimension, StrategicCoordinates } from '../types';
import { AvatarDisplay } from '../components/dashboard';
import { openDataService } from '../services/OpenDataService';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit
const STORAGE_KEY_PRODUCT_RADAR = 'the_sim_product_radar_v1';
const STORAGE_KEY_LAB_DRAFT = 'the_sim_lab_draft_v1';

// Optimized Sample Data
const SAMPLE_CSV_DATA = `timestamp,action,category,subject,value,context,details
2023-10-01 23:15:00,search,Health,Sleep_Quality,,Mobile,"query: how to cure insomnia naturally"
2023-10-01 23:20:00,view,Health,Blog_Deep_Sleep_Tips,180,Mobile,
2023-10-01 23:45:00,view,Shopping,Weighted_Blanket_Pro,2500,Mobile,"checking specs"
2023-10-01 23:50:00,add_to_cart,Shopping,Weighted_Blanket_Pro,2500,Mobile,
2023-10-01 23:55:00,checkout_start,Shopping,Checkout_Page,,Mobile,
2023-10-01 23:56:00,abandon_cart,Shopping,Checkout_Page,,Mobile,"shipping fee 150 is too high"
2023-10-02 12:10:00,search,Finance,High_Yield_Savings,,Desktop,"query: best savings account 2023"
2023-10-02 12:15:00,view,Finance,Bank_Comparison_Table,300,Desktop,"comparing interest rates"
2023-10-02 12:25:00,sort,Shopping,Weighted_Blanket_List,,Desktop,"sort by: price low to high"
2023-10-02 12:30:00,view,Shopping,Cheap_Fleece_Blanket,499,Desktop,
2023-10-03 20:00:00,click,Ad,Supplement_Magnesium,10,Mobile,"campaign: retargeting_sleep"
2023-10-03 20:05:00,view,Health,Magnesium_Benefits,120,Mobile,
2023-10-04 09:00:00,view,News,Tech_New_iPhone_Review,60,Desktop,"just skimming"
2023-10-05 23:30:00,view,Social,Forum_Sleep_Disorders,400,Mobile,"reading comments"
2023-10-05 23:40:00,comment,Social,Forum_Post,,Mobile,"I've tried everything, nothing works."
2023-10-06 12:00:00,search,Shopping,Discount_Code_SleepWell,,Desktop,
2023-10-06 12:05:00,purchase,Shopping,Magnesium_Supplement,850,Desktop,"used coupon: WELCOME10"
2023-10-07 19:30:00,view,Entertainment,Youtube_LoFi_Music,1200,Tablet,"background music"
2023-10-08 10:00:00,survey,Feedback,NPS_Score,7,Mobile,
2023-10-08 10:05:00,survey,Feedback,Comment,,Mobile,"Good product but delivery was slow."
2023-10-10 22:15:00,view,Finance,Crypto_Bitcoin_Price,15,Mobile,"quick check"
2023-10-10 22:20:00,view,Finance,Crypto_ETH_Price,10,Mobile,
2023-10-12 23:50:00,search,Health,Melatonin_Side_Effects,,Mobile,`;

// Pipeline Steps
const PIPELINE_STEPS = [
  { id: 'init', label: '初始化', icon: Loader2 },
  { id: 'analyst', label: 'Omniscient Observer', icon: Database, desc: '全知視角：事實與意圖提取' },
  { id: 'psych', label: 'Profiler', icon: BrainCircuit, desc: '心理側寫：極端性格建模' },
  { id: 'actor', label: 'Method Actor', icon: PenTool, desc: '方法演技：缺陷與語氣注入' },
  { id: 'reviewer', label: 'Assembly', icon: FileCheck, desc: '最終審核與系統組裝' },
  { id: 'visual', label: 'Avatar Rendering', icon: Sparkles, desc: '3D 頭像與視覺生成' }
];

// Scenario Options
const SCENARIO_OPTIONS = [
  { 
    id: 'auto', 
    title: '智能託管 (Auto)', 
    desc: '由 AI 分析角色身份，自動匹配最合適的性格弱點。',
    default_chaos: 50,
    icon: BrainCircuit,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    accent: 'bg-indigo-500'
  },
  { 
    id: 'fomo', 
    title: '爆款潛力測試', 
    desc: '模擬「跟風盲從」心態，測試產品話題性。', 
    default_chaos: 60,
    icon: TrendingUp,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    accent: 'bg-rose-500'
  },
  { 
    id: 'cp', 
    title: '定價防禦測試', 
    desc: '模擬「極致比價」心態，對價格極度敏感。', 
    default_chaos: 20,
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500'
  },
  { 
    id: 'vibe', 
    title: '品牌溢價測試', 
    desc: '模擬「外貌協會」心態，重視顏值與氛圍。', 
    default_chaos: 70,
    icon: Crown,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    accent: 'bg-violet-500'
  },
  { 
    id: 'hater', 
    title: '酸民壓力測試', 
    desc: '模擬「預設懷疑」心態，進行最嚴苛的信任考驗。', 
    default_chaos: 80,
    icon: ShieldAlert,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'bg-amber-500'
  }
];

// ... MethodologyVisualizer ...
const MethodologyVisualizer: React.FC<{ mode: 'upload' | 'lab' | 'product' }> = ({ mode }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 mb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
           <div className="md:w-1/3 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                 <div className={`p-2 rounded-lg ${mode === 'upload' ? 'bg-indigo-100 text-indigo-600' : mode === 'lab' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {mode === 'upload' ? <Search className="w-5 h-5" /> : mode === 'lab' ? <FlaskConical className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                 </div>
                 <h3 className="font-black text-slate-800 text-lg">
                    {mode === 'upload' ? '行為偵測模式' : mode === 'lab' ? '基因合成模式' : '差異化分析 (Gap Analysis)'}
                 </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                 {mode === 'upload' 
                    ? '「全知觀察者」將分析您的原始數據，並透過 Open Data 進行現實校準，揪出言行不一的矛盾。' 
                    : mode === 'lab' 
                      ? '「社會工程師」將根據您的設定，注入台灣真實社會參數，從零建構具備合理缺陷的虛擬人格。'
                      : '「市場人類學家」將對產品進行三維戰略掃描，計算需求張力、競品鎖定與切入可行性，逆向生成最具代表性的潛在客群。'
                 }
              </p>
           </div>
           <div className="flex-1 w-full mt-4 md:mt-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                 <div className="flex flex-col items-center gap-2 text-center w-24">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                       {mode === 'upload' ? <FileSpreadsheet className="w-5 h-5" /> : mode === 'lab' ? <UserCog className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">
                       {mode === 'upload' ? '原始 Log' : mode === 'lab' ? '角色骨架' : '產品規格'}
                    </span>
                 </div>
                 <div className="hidden md:block flex-1 h-px bg-slate-200 relative mx-2">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full"></div>
                 </div>
                 <div className="md:hidden w-px h-8 bg-slate-200 relative my-1">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-300 rounded-full"></div>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-center relative group w-32">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 ${
                       mode === 'upload' 
                         ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-200' 
                         : mode === 'lab' 
                           ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-violet-200'
                           : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200'
                    }`}>
                       {mode === 'product' ? <Radar className="w-6 h-6 animate-pulse" /> : <Scale className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div className="flex flex-col">
                       <span className={`text-xs font-black ${mode === 'upload' ? 'text-indigo-600' : mode === 'lab' ? 'text-violet-600' : 'text-emerald-600'}`}>
                          {mode === 'product' ? '戰略矩陣運算' : '社會動力學校準'}
                       </span>
                       <span className="text-[9px] text-slate-400 font-mono mt-0.5">{mode === 'product' ? 'Trinity Core' : 'Sociology Engine'}</span>
                    </div>
                 </div>
                 <div className="hidden md:block flex-1 h-px bg-slate-200 relative mx-2">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-slate-300 rotate-45"></div>
                 </div>
                 <div className="md:hidden w-px h-8 bg-slate-200 relative my-1">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-b border-r border-slate-300 rotate-45"></div>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-center w-24">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm ${
                       mode === 'upload' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : mode === 'lab' ? 'bg-violet-50 border-violet-100 text-violet-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'
                    }`}>
                       {mode === 'upload' ? <Fingerprint className="w-5 h-5" /> : <Dna className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">
                       {mode === 'upload' ? '真實人格' : '機會客群'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
};

const DnaSkeleton: React.FC = () => (
  <div className="relative w-full h-full flex flex-col bg-white rounded-3xl border border-violet-100 shadow-xl overflow-hidden p-6 md:p-8 animate-pulse">
     <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
           <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 rounded"></div>
              <div className="w-20 h-2 bg-slate-100 rounded"></div>
           </div>
        </div>
     </div>
     <div className="space-y-6 flex-1">
        <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 w-full"></div>
        <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 w-full"></div>
     </div>
  </div>
);

const HolographicDnaCard: React.FC<{ 
    dna: PersonaDNA; 
    isStale: boolean;
    onRefresh: () => void;
}> = ({ dna, isStale, onRefresh }) => {
  const level = dna.reality_check?.coherence_level || 'Analysing';
  const description = dna.reality_check?.reality_gap_description || "System checks nominal.";
  const isDelusional = level === 'Delusional';
  
  // Extract context settings for display
  const geoId = dna._context_settings?.geo_id;
  const householdId = dna._context_settings?.household_id;
  const geoLabel = geoId ? openDataService.getGeoOptions().find(g => g.id === geoId)?.label.split(' ')[0] : null;
  const houseLabel = householdId ? openDataService.getHouseholdOptions().find(h => h.id === householdId)?.label.split(' ')[0] : null;

  return (
  <div className={`relative w-full h-full flex flex-col bg-slate-900 rounded-3xl border shadow-xl overflow-hidden transition-all duration-500 ${isStale ? 'border-amber-500/50 grayscale-[0.3]' : 'border-violet-500/30 hover:border-violet-500/50'}`}>
     <div className="relative z-10 flex-1 flex flex-col p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 shadow-inner"><Dna className="w-5 h-5 text-violet-400 animate-pulse" /></div>
              <div>
                 <h4 className="text-white font-black tracking-wide text-lg">DNA SEQUENCE</h4>
                 <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">ID: {dna.role.substring(0, 15)}...</p>
              </div>
           </div>
           {isStale && (
              <button onClick={onRefresh} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-amber-500/20 animate-bounce">
                 <RefreshCw className="w-3.5 h-3.5" /> 重新解析
              </button>
           )}
        </div>
        <div className="space-y-6 flex-1 flex flex-col">
           {/* Context Override Display */}
           {(geoLabel || houseLabel) && (
               <div className="flex gap-2 mb-2">
                   {geoLabel && <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 flex items-center gap-1"><MapPin className="w-3 h-3"/> {geoLabel}</span>}
                   {houseLabel && <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1"><UserCog className="w-3 h-3"/> {houseLabel}</span>}
               </div>
           )}

           <div className="group">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2 tracking-widest">Life Style</span>
              <div className="flex flex-wrap gap-2">
                 {dna.lifestyle.map((tag, i) => (
                    <span key={i} className="text-xs font-bold text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-sm backdrop-blur-sm">{tag}</span>
                 ))}
              </div>
           </div>
           <div className="group bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 relative overflow-hidden">
              <span className="text-[10px] text-rose-400/70 uppercase font-bold block mb-1 tracking-widest flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Core Anxiety</span>
              <div className="text-sm font-medium text-rose-200 leading-relaxed relative z-10 flex gap-2 items-start">{dna.anxiety}</div>
           </div>
           <div className="group bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
              <span className="text-[10px] text-emerald-400/70 uppercase font-bold block mb-1 tracking-widest flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Spending Logic</span>
              <div className="text-sm font-medium text-emerald-100 leading-relaxed flex items-start gap-3">{dna.spending_habit}</div>
           </div>
           {dna.reality_check && (
               <div className={`mt-auto pt-3 border-t border-slate-800 transition-colors duration-500`}>
                  <div className={`flex items-start gap-2 font-mono text-[10px] text-slate-500`}>
                     <Terminal className={`w-3.5 h-3.5 shrink-0 mt-0.5`} />
                     <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-wider">SYSTEM DIAGNOSTIC: {level.toUpperCase()}</span>
                        <span className={`opacity-80 mt-0.5 font-sans leading-snug ${isDelusional ? 'text-rose-300' : 'text-slate-400'}`}>{">"} {description}</span>
                     </div>
                  </div>
               </div>
           )}
        </div>
     </div>
     {isStale && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
           <div className="bg-slate-800 text-amber-400 px-4 py-2 rounded-xl shadow-2xl border border-amber-500/50 font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 參數已變更</div>
        </div>
     )}
  </div>
  );
};

// ... existing SessionStatusBanner ...
const SessionStatusBanner: React.FC<{ 
    persona: DigitalTwinPersona | null, 
    onReset: () => void 
}> = ({ persona, onReset }) => {
    if (!persona) return null;

    const name = getAvatarTitle(persona);
    
    return (
        <div className="w-full bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl rounded-l-sm p-4 flex items-center justify-between animate-fade-in mb-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                    <AvatarDisplay avatarUrl={persona.avatar_url} isLoading={false} error={null} simple />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-white bg-indigo-50 px-2 py-0.5 rounded-full tracking-wider uppercase">SESSION ACTIVE</span>
                        <span className="text-xs text-slate-400 font-medium">ID: {persona.twin_id.substring(0, 8)}...</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        正在編輯分身: <span className="text-indigo-600">{name}</span>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-all group"
                title="清除目前分身狀態，開啟新的分析"
            >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                <span className="text-xs font-bold">結束並開啟新對話 (Reset)</span>
            </button>
        </div>
    );
};

// === NEW: Tactical Gauge Component ===
const TacticalGauge: React.FC<{ 
    label: string, 
    score: number, 
    color: string, 
    icon: any 
}> = ({ label, score, color, icon: Icon }) => {
    
    // Convert 0-100 Score to Qualitative Level
    const getQualitativeLevel = (s: number) => {
        if (s >= 70) return "高 (High)";
        if (s >= 40) return "中 (Med)";
        return "低 (Low)";
    };

    return (
        <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${color}`}>
                    <Icon className="w-3 h-3" /> {label}
                </div>
                <span className={`text-[10px] font-black ${color}`}>{getQualitativeLevel(score)}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

// === NEW: Strategic Matrix Chart (Cockpit Edition) ===
interface ChartData {
    id: string;
    x: number;
    y: number;
    z: number;
    lockin: number;
    label: string;
    grade: string;
    gradeColor: string;
}

const StrategicMatrixChart: React.FC<{ 
    candidates: PersonaCandidate[], 
    onSelect: (id: string) => void,
    selectedId: string | null
}> = ({ candidates, onSelect, selectedId }) => {
    
    // Sort and Grade (PR Logic)
    const sorted = [...candidates].sort((a, b) => 
        (b.strategic_coordinates?.opportunity_volume || 0) - (a.strategic_coordinates?.opportunity_volume || 0)
    );
    const total = sorted.length;

    const data: ChartData[] = candidates.map(c => {
        const coords = c.strategic_coordinates || { 
            demand_tension: { score: 50 }, 
            entry_feasibility: { score: 50 }, 
            competitive_lockin: { score: 50 },
            opportunity_volume: 50 
        };
        
        // Calculate Rank/Grade
        const rank = sorted.findIndex(s => s.id === c.id);
        const percentile = (total - rank) / total;
        let grade = 'B';
        let gradeColor = '#94a3b8'; // Slate-400
        
        if (percentile > 0.8) { grade = 'S'; gradeColor = '#f43f5e'; } // Rose-500
        else if (percentile > 0.3) { grade = 'A'; gradeColor = '#6366f1'; } // Indigo-500

        return {
            id: c.id,
            x: coords.demand_tension.score, // X: Pain
            y: coords.entry_feasibility.score, // Y: Ability to Enter
            z: coords.opportunity_volume, // Z: Size
            lockin: coords.competitive_lockin.score, // Color intensity
            label: c.role,
            grade,
            gradeColor
        };
    });

    return (
      <div className="w-full h-full relative">
         <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
               <XAxis 
                  type="number" dataKey="x" name="痛點張力" domain={[0, 100]} 
                  tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={{stroke: '#e2e8f0'}}
                  label={{ value: "痛點張力 (Pain) →", position: "insideBottomRight", offset: -5, fontSize: 10, fill: '#cbd5e1', fontWeight: 'bold' }}
               />
               <YAxis 
                  type="number" dataKey="y" name="切入可行性" domain={[0, 100]} 
                  tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={{stroke: '#e2e8f0'}}
                  label={{ value: "切入可行性 (Ease) →", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: '#cbd5e1', fontWeight: 'bold' }}
               />
               <ZAxis type="number" dataKey="z" range={[60, 400]} />
               <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                          const d = payload[0].payload as ChartData;
                          return (
                              <div className="bg-white/95 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-xl z-50 min-w-[260px] space-y-3">
                                  <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                                      <div className="font-black text-slate-800 text-sm truncate max-w-[150px]">{d.label}</div>
                                      <span className="text-xs font-black px-2 py-0.5 rounded text-white" style={{ backgroundColor: d.gradeColor }}>
                                          {d.grade}級機會
                                      </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono space-y-2">
                                      <div className="flex justify-between gap-4 items-center">
                                          <span>痛點張力 (Pain)</span> 
                                          <div className="flex items-center gap-2">
                                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-rose-500" style={{ width: `${d.x}%` }}></div>
                                              </div>
                                              <span className="font-bold text-rose-500 w-6 text-right">{d.x}</span>
                                          </div>
                                      </div>
                                      <div className="flex justify-between gap-4 items-center">
                                          <span>切入可行性 (Ease)</span> 
                                          <div className="flex items-center gap-2">
                                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-emerald-500" style={{ width: `${d.y}%` }}></div>
                                              </div>
                                              <span className="font-bold text-emerald-500 w-6 text-right">{d.y}</span>
                                          </div>
                                      </div>
                                      <div className="flex justify-between gap-4 items-center">
                                          <span>競品鎖定 (Lock)</span> 
                                          <div className="flex items-center gap-2">
                                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-slate-500" style={{ width: `${d.lockin}%` }}></div>
                                              </div>
                                              <span className="font-bold text-slate-500 w-6 text-right">{d.lockin}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          );
                      }
                      return null;
                  }}
               />
               <Scatter name="Opportunities" data={data} onClick={(d) => onSelect(d.id)}>
                  {data.map((entry, index) => {
                      const isSelected = selectedId === entry.id;
                      // Color Logic: Use Lockin for Fill (Darker = Harder)
                      // High Lockin (>70) = Dark Gray
                      // Medium Lockin (>40) = Gray
                      // Low Lockin = Light Gray
                      const fillOpacity = isSelected ? 1 : 0.6;
                      const strokeColor = isSelected ? entry.gradeColor : '#fff';
                      
                      // Bubble Color based on Lock-in (Grey Scale) but Grade Color for Ring
                      // Let's use Grade Color for Fill to make it pop as requested "Rose/Indigo/Slate"
                      const fillColor = entry.gradeColor;

                      return (
                          <Cell 
                             key={`cell-${index}`} 
                             fill={fillColor} 
                             fillOpacity={fillOpacity}
                             stroke={strokeColor}
                             strokeWidth={isSelected ? 3 : 1}
                             className={`transition-all duration-300 cursor-pointer hover:opacity-100 ${isSelected ? 'filter drop-shadow-md' : ''}`}
                          />
                      );
                  })}
               </Scatter>
            </ScatterChart>
         </ResponsiveContainer>
         
         {/* Legend Overlay */}
         <div className="absolute top-0 right-0 flex gap-3 text-[9px] text-slate-400 font-bold pointer-events-none bg-white/80 p-1 rounded backdrop-blur-sm border border-slate-100">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> S級 (Top 20%)</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> A級 (Mid)</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> B級 (Base)</div>
         </div>
      </div>
    );
};

// === NEW: Candidate Detail Panel (HUD) ===
const CandidateDetailPanel: React.FC<{ 
    candidate: PersonaCandidate | null, 
    onGenerate: (c: PersonaCandidate) => void,
    isProcessing: boolean,
    processingId: string | null
}> = ({ candidate, onGenerate, isProcessing, processingId }) => {
    
    if (!candidate) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                <MousePointer2 className="w-12 h-12 mb-3 opacity-20 text-indigo-300" />
                <p className="text-sm font-bold text-slate-500">戰略駕駛艙待命</p>
                <p className="text-xs opacity-60 mt-1">請點擊左側氣泡查看戰術細節</p>
            </div>
        );
    }

    const coords = candidate.strategic_coordinates || { 
        demand_tension: { score: 50 }, 
        competitive_lockin: { score: 50 }, 
        entry_feasibility: { score: 50 } 
    };

    const isProcessingThis = processingId === candidate.id;

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden relative">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Target className="w-3 h-3" /> TARGET PROFILE
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300">ID: {candidate.id.split('_').pop()}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-3">{candidate.role}</h3>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded border border-slate-200">{candidate.age_range}</span>
                    <span className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded border border-slate-200">{candidate.income_level}</span>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                
                {/* Trinity Gauges */}
                <div className="space-y-4">
                    <TacticalGauge label="痛點張力 (Pain)" score={coords.demand_tension.score} color="text-rose-600" icon={TrendingDown} />
                    <TacticalGauge label="競品鎖定 (Lock-in)" score={coords.competitive_lockin.score} color="text-slate-500" icon={Lock} />
                    <TacticalGauge label="切入可行性 (Ease)" score={coords.entry_feasibility.score} color="text-emerald-600" icon={MousePointer2} />
                </div>

                {/* Strategy Hook */}
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 攻克策略 (Hook)
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-400 italic text-sm text-slate-700 leading-relaxed shadow-sm">
                        "{candidate.resonance_analysis.marketing_hook}"
                    </div>
                </div>
                
                {/* Additional Intel - Vertical Stack for Better Readability */}
                <div className="flex flex-col gap-3">
                    <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                        <div className="text-[9px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Winning Reason
                        </div>
                        <div className="text-xs font-bold text-emerald-600 leading-relaxed">
                            {candidate.resonance_analysis.market_audit?.price_gap_description || "AI 正在計算針對競品的勝出策略..."}
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                        <div className="text-[9px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Pain Context
                        </div>
                        <div className="text-xs font-bold text-rose-500 leading-relaxed">
                            {candidate.resonance_analysis.pain_point || "未偵測到明顯痛點"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                 <button 
                    onClick={() => onGenerate(candidate)}
                    disabled={isProcessing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {isProcessing && isProcessingThis ? (
                        <Loader2 className="w-5 h-5 animate-spin" /> 
                    ) : (
                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                    )}
                    {isProcessing && isProcessingThis ? "正在生成..." : "生成數位分身 (Generate)"}
                </button>
            </div>
        </div>
    );
};

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { persona, setPersona, setIsLoading, setChatSession, clearSession } = usePersona();
  const { clearChat } = useChatMessages();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'lab' | 'product'>('upload');

  // Upload State
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'qualitative' | 'behavioral'>('qualitative');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Lab State
  const [labConfig, setLabConfig] = useState<{
     role: string;
     age: string;
     income: string;
     shadow: string; 
     chaos: number;
     gender: GenderOption; 
     geoId: string; 
     householdId: string; 
  }>({
     role: '',
     age: '25-34',
     income: '一般標準 (Standard)', 
     shadow: 'auto', 
     chaos: 50,
     gender: 'General',
     geoId: '', 
     householdId: '' 
  });
  
  const [showAdvancedLab, setShowAdvancedLab] = useState(false);

  // Product Mirror State
  const [productInput, setProductInput] = useState({
      name: '',
      priceAmount: '',
      priceUnit: 'NT$',
      priceCycle: '一次性 (One-time)',
      category: '',
      specs: [] as string[],
      currentSpecInput: '', 
      competitorName: '',
      competitorPrice: ''
  });
  const [candidates, setCandidates] = useState<PersonaCandidate[]>([]);
  const [productDiagnosis, setProductDiagnosis] = useState<ProductDiagnosis | null>(null);
  
  // Interaction State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState(false);
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null);

  // Stale State Logic
  const [isAnalyzingDNA, setIsAnalyzingDNA] = useState(false);
  const [enrichedDNA, setEnrichedDNA] = useState<PersonaDNA | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  
  const processingLock = useRef(false);

  // Report & Live Stats
  const [finalReport, setFinalReport] = useState<DataHealthReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [liveStats, setLiveStats] = useState({ hasTime: false, hasQuotes: false, hasAction: false, rowCount: 0 });
  const [loadingStage, setLoadingStage] = useState<string>("系統初始化中...");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userScenario, setUserScenario] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence State
  const [isRestored, setIsRestored] = useState(false);
  const [isLabRestored, setIsLabRestored] = useState(false);

  // Is Mobile Check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // === GUARD: MOUNTED STATE & CONTEXT CLEANUP ===
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    setIsProcessing(false);
    setIsLoading(false);
    setIsButtonLoading(false);
    setProcessingCandidateId(null);
    setLoadingStage("系統初始化中...");
    setCurrentStepIndex(0);
    setError(null);
    processingLock.current = false;

    return () => { 
        isMounted.current = false;
        if (processingLock.current) {
            console.warn("UploadPage unmounted while processing. Forcing global unlock.");
            setIsLoading(false); 
            processingLock.current = false; 
        }
    };
  }, []);

  // Persistence Effect: Product Radar
  useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCT_RADAR);
      if (saved) {
          try {
              const data = JSON.parse(saved);
              // Restore data
              if (data.productInput) setProductInput(data.productInput);
              if (data.candidates) setCandidates(data.candidates);
              if (data.productDiagnosis) setProductDiagnosis(data.productDiagnosis);
              
              // Auto-switch tab if we have data
              if (data.productInput?.name) {
                  setActiveTab('product');
                  setIsRestored(true);
                  setTimeout(() => setIsRestored(false), 5000); // Hide after 5 seconds
              }
              
              // Restore selection if candidates exist
              if (data.candidates && data.candidates.length > 0) {
                  setSelectedCandidateId(data.candidates[0].id);
              }
          } catch (e) {
              console.error("Failed to restore product radar data", e);
          }
      }
  }, []);

  // Persistence Effect: Lab Draft
  useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY_LAB_DRAFT);
      if (saved) {
          try {
              const data = JSON.parse(saved);
              if (data.labConfig) setLabConfig(data.labConfig);
              if (data.enrichedDNA) setEnrichedDNA(data.enrichedDNA);
              // Optional: show restored state if we are already on lab tab or just set flag
              if (data.labConfig?.role) {
                  setIsLabRestored(true);
                  setTimeout(() => setIsLabRestored(false), 5000);
              }
          } catch (e) {
              console.error("Failed to restore lab draft", e);
          }
      }
  }, []);

  // Save Effect: Product Radar
  useEffect(() => {
      const data = {
          productInput,
          candidates,
          productDiagnosis
      };
      localStorage.setItem(STORAGE_KEY_PRODUCT_RADAR, JSON.stringify(data));
  }, [productInput, candidates, productDiagnosis]);

  // Save Effect: Lab Draft
  useEffect(() => {
      const data = {
          labConfig,
          enrichedDNA
      };
      localStorage.setItem(STORAGE_KEY_LAB_DRAFT, JSON.stringify(data));
  }, [labConfig, enrichedDNA]);

  // Config Hash Calculation
  const currentConfigHash = useMemo(() => JSON.stringify({
      role: labConfig.role,
      age: labConfig.age,
      income: labConfig.income,
      shadow: labConfig.shadow,
      gender: labConfig.gender,
      geo: labConfig.geoId,
      household: labConfig.householdId
  }), [labConfig]);

  const isDnaStale = useMemo(() => {
      if (!enrichedDNA) return false;
      return enrichedDNA.config_signature !== currentConfigHash;
  }, [enrichedDNA, currentConfigHash]);

  // Sync step index
  useEffect(() => {
    if (!isProcessing) return;
    const lowerMsg = loadingStage.toLowerCase();
    if (lowerMsg.includes('schema') || lowerMsg.includes('distillation') || lowerMsg.includes('fact')) setCurrentStepIndex(1);
    else if (lowerMsg.includes('profiling') || lowerMsg.includes('psych')) setCurrentStepIndex(2);
    else if (lowerMsg.includes('actor') || lowerMsg.includes('simulation') || lowerMsg.includes('synthesis')) setCurrentStepIndex(3);
    else if (lowerMsg.includes('assembly') || lowerMsg.includes('組裝')) setCurrentStepIndex(4);
    else if (lowerMsg.includes('visual') || lowerMsg.includes('avatar') || lowerMsg.includes('頭像')) setCurrentStepIndex(5);
    else setCurrentStepIndex(0);
  }, [loadingStage, isProcessing]);

  useEffect(() => {
    const checkLiveStats = () => {
        const text = textInput;
        const hasTime = !!text.match(/20\d{2}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}/);
        const hasQuotes = !!(text.match(/["'「」]/) || (text.length > 50 && inputMode === 'qualitative')); 
        const hasAction = !!text.match(/view|buy|click|purchase|瀏覽|購買|下單|speak|comment|訪談|留言/i);
        const rowCount = text.split('\n').filter(l => l.trim()).length;
        setLiveStats({ hasTime, hasQuotes, hasAction, rowCount });
        if (selectedFile) setLiveStats(prev => ({ ...prev, rowCount: prev.rowCount + 50, hasTime: true }));
    };
    const timer = setTimeout(checkLiveStats, 300);
    return () => clearTimeout(timer);
  }, [textInput, inputMode, selectedFile]);

  // Auto-Clear State on Tab Switch (MODIFIED: Removed Product & Lab Clear)
  useEffect(() => {
      // NOTE: We now persist Lab and Product data across tabs.
      // Only error and transient processing states are cleared.
      setError(null);
      setProcessingCandidateId(null);
      setIsButtonLoading(false);
      // setSelectedCandidateId(null); // Keep selection or clear? Better keep it if we persist candidates.
      processingLock.current = false; 
  }, [activeTab]);

  const handleClearProductData = () => {
      if (!window.confirm("確定要清除所有產品分析紀錄嗎？")) return;
      
      const emptyInput = {
          name: '',
          priceAmount: '',
          priceUnit: 'NT$',
          priceCycle: '一次性 (One-time)',
          category: '',
          specs: [],
          currentSpecInput: '',
          competitorName: '',
          competitorPrice: ''
      };
      setProductInput(emptyInput);
      setCandidates([]);
      setProductDiagnosis(null);
      setSelectedCandidateId(null);
      setIsRestored(false);
      localStorage.removeItem(STORAGE_KEY_PRODUCT_RADAR);
  };

  const handleClearLabData = () => {
      if (!window.confirm("確定要清除角色實驗室的草稿嗎？")) return;
      setLabConfig({
         role: '',
         age: '25-34',
         income: '一般標準 (Standard)',
         shadow: 'auto',
         chaos: 50,
         gender: 'General',
         geoId: '',
         householdId: ''
      });
      setEnrichedDNA(null);
      setIsLabRestored(false);
      localStorage.removeItem(STORAGE_KEY_LAB_DRAFT);
  };

  const handleScenarioChange = (scenarioId: string) => {
      const selected = SCENARIO_OPTIONS.find(s => s.id === scenarioId);
      if (selected) {
          setLabConfig(prev => ({
              ...prev,
              shadow: scenarioId,
              chaos: selected.default_chaos
          }));
      }
  };

  const handleAddSpec = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && productInput.currentSpecInput.trim()) {
          e.preventDefault();
          setProductInput(prev => ({
              ...prev,
              specs: [...prev.specs, prev.currentSpecInput.trim()],
              currentSpecInput: ''
          }));
      }
  };

  const handleRemoveSpec = (index: number) => {
      setProductInput(prev => ({
          ...prev,
          specs: prev.specs.filter((_, i) => i !== index)
      }));
  };

  const handleProductAnalysis = async (focusDimension?: FrictionDimensionKey) => {
      if (!productInput.name) { setError("請輸入產品名稱"); return; }
      if (!productInput.priceAmount) { setError("請輸入價格"); return; }
      if (isAnalyzingProduct) return; 

      setIsAnalyzingProduct(true);
      setError(null);
      
      setCandidates([]); 
      setSelectedCandidateId(null);

      try {
          const results = await mirrorPersonaFromProduct({
              ...productInput,
              focusDimension
          });
          
          if (isMounted.current) {
             setCandidates(results.candidates);
             if (results.diagnosis) setProductDiagnosis(results.diagnosis);
             if (results.candidates.length > 0) setSelectedCandidateId(results.candidates[0].id);
          }
      } catch (e) {
          if (isMounted.current) {
             console.error("Product Mirror Failed", e);
             setError("受眾分析失敗，請稍後再試。");
          }
      } finally {
          if (isMounted.current) {
             setIsAnalyzingProduct(false);
          }
      }
  };

  const handleDirectGeneration = async (c: PersonaCandidate) => {
      if (processingLock.current) return; 
      
      if (!c.resonance_analysis || !c.source_snapshot) {
          alert("此候選人資料結構不完整 (缺少快照或分析數據)，請重新分析產品。");
          return;
      }

      if (persona) {
          if (!window.confirm("偵測到已存在的數位分身。建立新分析將會覆蓋目前的進度與對話紀錄。\n\n確定要繼續嗎？")) return;
      }

      processingLock.current = true;
      setIsButtonLoading(true); 
      setProcessingCandidateId(c.id); 
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsProcessing(true); 
      setIsLoading(true);
      setError(null);
      setLoadingStage("啟動快速生成通道 (Direct Mode)...");
      setCurrentStepIndex(0);
      
      try {
          setLoadingStage("🧬 正在解析角色基因 (DNA Analysis)...");
          
          const shadowId = SCENARIO_OPTIONS.some(s => s.id === c.shadow_id) ? c.shadow_id : 'auto';
          const gender = c.gender_guess || 'General';
          const productName = c.source_snapshot.product_name;

          const resonancePayload = {
              product_name: productName,
              pain_point: c.resonance_analysis.pain_point || "未知痛點",
              marketing_hook: c.resonance_analysis.marketing_hook || "未知行銷點",
              strategy_label: c.resonance_analysis.strategy_label || "General",
              value_layer: c.resonance_analysis.value_layer,
              observable_signals: c.observable_signals || [] 
          };

          const dna = await enrichPersonaRole(
              c.role, 
              c.age_range, 
              c.income_level, 
              shadowId, 
              gender,
              resonancePayload
          );

          setLoadingStage("📊 正在合成行為數據 (Data Synthesis)...");
          const skeleton = {
              role: c.role,
              age: c.age_range,
              income: c.income_level,
              gender: gender
          };
          
          const rawData = await synthesizePersonaData(skeleton, shadowId, 60, dna);

          setLoadingStage("🧠 正在初始化核心運算模組 (System Boot)...");
          
          const creationConfig: OriginProfile = {
              source_type: 'synthetic',
              parent_candidate_id: c.id, 
              skeleton: skeleton,
              dna: dna,
              shadow: { 
                  id: shadowId, 
                  label: SCENARIO_OPTIONS.find(s => s.id === shadowId)?.title || shadowId 
              },
              humanity_score: 60
          };

          const generatedPersona = await analyzeDataAndCreatePersona(rawData, {
              dataSource: 'synthetic_lab',
              scenario: `Product Mirror: ${productName}`,
              creationConfig: creationConfig
          }, (stage) => { if(isMounted.current) setLoadingStage(stage); });

          if (isMounted.current) {
              clearSession(); 
              localStorage.removeItem('the_sim_persona_v1'); 
              setEnrichedDNA(null); 

              setPersona(generatedPersona); 
              
              setIsProcessing(false);
              setIsLoading(false);
              setProcessingCandidateId(null);
              setIsButtonLoading(false);
              processingLock.current = false;

              navigate('/dashboard');
          }

      } catch (e: any) {
          if (isMounted.current) {
              console.error("Direct Generation Failed", e);
              const errorMsg = e.message || "生成失敗，請稍後再試。";
              const displayMsg = errorMsg.includes('429') 
                  ? "系統忙碌中 (API 流量限制)，請等待 10 秒後再試。" 
                  : `生成過程中斷: ${errorMsg}`;
              
              setError(displayMsg);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              
              setIsProcessing(false);
              setIsLoading(false);
              setProcessingCandidateId(null);
              setIsButtonLoading(false);
              processingLock.current = false; 
          }
      } 
  };

  const handleEnrichDNA = async () => {
      if (!labConfig.role) {
          setError("請先輸入角色身份");
          return;
      }
      setIsAnalyzingDNA(true);
      setError(null);
      
      const overrides: SociologyOverrides = {};
      if (labConfig.geoId) overrides.geo_id = labConfig.geoId;
      if (labConfig.householdId) overrides.household_id = labConfig.householdId;

      try {
          const dna = await enrichPersonaRole(
              labConfig.role, 
              labConfig.age, 
              labConfig.income, 
              labConfig.shadow, 
              labConfig.gender,
              undefined,
              Object.keys(overrides).length > 0 ? overrides : undefined 
          );
          dna.config_signature = currentConfigHash;
          
          if (isMounted.current) {
             setEnrichedDNA(dna);
          }

      } catch (e) {
          if (isMounted.current) {
             console.error("Enrichment Failed", e);
             setError("角色解析失敗，請稍後再試。");
          }
      } finally {
          if (isMounted.current) {
             setIsAnalyzingDNA(false);
          }
      }
  };

  const runFullScan = async () => {
    setIsScanning(true);
    setFinalReport(null);
    try {
      let content = textInput;
      let size = 0;
      
      if (selectedFile) {
        content = await selectedFile.text();
        size = selectedFile.size;
        if (textInput.trim()) content += "\n" + textInput;
      } else {
        if (!content.trim() && isSampleLoaded) {
            content = SAMPLE_CSV_DATA;
        }
        size = new Blob([content]).size;
      }
      
      if (!content.trim()) {
        setError("請輸入數據或上傳檔案");
        setIsScanning(false);
        return;
      }
      
      setTimeout(() => {
        if (isMounted.current) {
            const report = scanCsvData(content, size);
            setFinalReport(report);
            setIsScanning(false);
        }
      }, 600);
    } catch (e) {
      if (isMounted.current) {
          console.error("Scan failed", e);
          setIsScanning(false);
          setError("掃描失敗，請檢查檔案格式");
      }
    }
  };

  const processData = async () => {
    if (processingLock.current || isButtonLoading || isProcessing) return;

    processingLock.current = true;
    setIsButtonLoading(true);
    setError(null);

    if (persona) {
      if (!window.confirm("即將覆蓋目前的數位分身。確定要繼續嗎？")) {
          setIsButtonLoading(false); 
          processingLock.current = false;
          return;
      }
    }

    let effectiveRawData = "";
    let effectiveDataSource = "";
    let creationConfig: OriginProfile = { source_type: 'upload' };
    
    try {
        if (activeTab === 'lab') {
            if (!labConfig.role) {
                setError("請輸入角色身份");
                setIsButtonLoading(false);
                processingLock.current = false;
                return;
            }
            
            let currentDNA = enrichedDNA;
            const overrides: SociologyOverrides = {};
            if (labConfig.geoId) overrides.geo_id = labConfig.geoId;
            if (labConfig.householdId) overrides.household_id = labConfig.householdId;
            
            if (!currentDNA || currentDNA.config_signature !== currentConfigHash) {
                setIsAnalyzingDNA(true);
                try {
                    currentDNA = await enrichPersonaRole(
                        labConfig.role, 
                        labConfig.age, 
                        labConfig.income, 
                        labConfig.shadow, 
                        labConfig.gender,
                        undefined,
                        Object.keys(overrides).length > 0 ? overrides : undefined
                    );
                    currentDNA.config_signature = currentConfigHash;
                    if (isMounted.current) {
                        setEnrichedDNA(currentDNA);
                    } else {
                        return; 
                    }
                } catch (e: any) { 
                    if (isMounted.current) {
                        const msg = e.message?.includes('429') 
                            ? "系統忙碌中 (429)，無法解析角色，請稍後再試。" 
                            : "背景解析失敗，無法生成數據。";
                        setError(msg);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsAnalyzingDNA(false);
                        setIsButtonLoading(false);
                        processingLock.current = false;
                    }
                    return; 
                } finally { 
                    if (isMounted.current) setIsAnalyzingDNA(false); 
                }
            }

            setIsProcessing(true); 
            setIsLoading(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLoadingStage("🧬 正在合成行為基因 (Synthesizing DNA)...");
            setCurrentStepIndex(0); 

            effectiveRawData = await synthesizePersonaData(
                { 
                    role: labConfig.role, 
                    age: labConfig.age, 
                    income: labConfig.income,
                    gender: labConfig.gender 
                },
                labConfig.shadow,
                labConfig.chaos,
                currentDNA || undefined
            );
            effectiveDataSource = 'synthetic_lab';
            creationConfig = {
               source_type: 'synthetic',
               skeleton: { 
                   role: labConfig.role, 
                   age: labConfig.age, 
                   income: labConfig.income,
                   gender: labConfig.gender
               },
               dna: currentDNA || undefined,
               shadow: { 
                   id: labConfig.shadow, 
                   label: SCENARIO_OPTIONS.find(s => s.id === labConfig.shadow)?.title || labConfig.shadow 
               },
               humanity_score: labConfig.chaos
            };

        } else {
            effectiveRawData = textInput;
            if (!effectiveRawData.trim() && isSampleLoaded) {
                effectiveRawData = SAMPLE_CSV_DATA;
            }

            if (selectedFile) {
                try {
                    const fileText = await selectedFile.text();
                    effectiveRawData = selectedFile ? (fileText + "\n" + textInput) : textInput;
                } catch (e) { 
                    setError("讀取檔案失敗"); 
                    setIsButtonLoading(false); 
                    processingLock.current = false;
                    return; 
                }
            }
            if (!effectiveRawData.trim()) { 
                setError("數據內容為空"); 
                setIsButtonLoading(false); 
                processingLock.current = false;
                return; 
            }
            
            effectiveDataSource = inputMode === 'qualitative' ? 'qualitative_feedback' : 'transactional_data';
            creationConfig = { source_type: 'upload' };

            setIsProcessing(true);
            setIsLoading(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLoadingStage("初始化核心運算模組...");
            setCurrentStepIndex(0);
        }

        const generatedPersona = await analyzeDataAndCreatePersona(effectiveRawData, {
            dataSource: effectiveDataSource,
            scenario: activeTab === 'lab' ? `Persona Lab: ${labConfig.role}` : userScenario,
            creationConfig: creationConfig 
        }, (stage) => { if(isMounted.current) setLoadingStage(stage); });
      
        if (isMounted.current) {
            clearSession(); 
            localStorage.removeItem('the_sim_persona_v1');

            // NOTE: We do NOT clear DNA here anymore to allow "back button" refinement.
            // if (activeTab !== 'lab') setEnrichedDNA(null);

            setPersona(generatedPersona); 
            
            setIsProcessing(false);
            setIsLoading(false);
            setIsButtonLoading(false);
            processingLock.current = false;
            
            navigate('/dashboard');
        }

    } catch (err: any) {
      if (isMounted.current) {
          console.error(err);
          const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
          const errorMsg = isRateLimit 
              ? "系統忙碌中 (429 Too Many Requests)。請等待 10-15 秒後再試。" 
              : "無法生成數位雙生。請確認數據內容是否足夠清晰，或稍後再試。";
          
          setError(errorMsg);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          setIsProcessing(false);
          setIsLoading(false);
          setIsButtonLoading(false);
          processingLock.current = false;
      }
    } 
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`檔案過大 (限制 5MB)`);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextInput(e.target.value);
      setIsSampleLoaded(false); 
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { handleFileChange(e.target.files?.[0] || null); if (e.target) e.target.value = ''; };
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]); };
  const removeSelectedFile = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedFile(null); setFinalReport(null); };
  
  const loadSampleData = () => { 
      setIsSampleLoaded(true); 
      setSelectedFile(null); 
      setTextInput(SAMPLE_CSV_DATA); 
      setUserScenario('最近覺得體力變差，想要改善生活習慣'); 
      setFinalReport(null); 
  };
  
  const downloadTemplate = (type: 'general' | 'ecommerce' | 'qualitative') => {
    let content = "";
    let filename = "";

    if (type === 'general') {
      content = `timestamp,action,category,subject,value,content_body\n2023-10-01 09:00,view,News,Tech Report,120,Reading about AI\n2023-10-01 09:30,search,Shopping,Headphones,,best noise cancelling headphones\n2023-10-02 20:00,purchase,Shopping,Sony WH-1000XM5,10900,Birthday gift\n`;
      filename = "general_template.csv";
    } else {
      content = `timestamp,interviewer,respondent,transcript\n2023-10-05 14:00,Alex,User123,"我覺得這產品最大的問題是太貴了，雖然功能不錯。"\n2023-10-05 14:05,Alex,User123,"如果能有試用期，我可能會考慮購買。"\n`;
      filename = "interview_template.csv";
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getHumanityLabel = (val: number) => {
    if (val <= 30) return { label: "完美人設 (Stereotype)", color: "text-blue-600" };
    if (val <= 70) return { label: "真實人類 (Realistic)", color: "text-emerald-600" };
    return { label: "複雜矛盾 (Complex)", color: "text-rose-600" };
  };
  const humanityState = getHumanityLabel(labConfig.chaos);

  const handleSessionReset = () => {
      clearSession(); 
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in px-4 md:px-6 py-6 min-h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">虛擬市民</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {activeTab === 'lab' ? "透過 DNA 合成技術，創造具備真實性格的虛擬分身。" : 
           activeTab === 'product' ? "輸入產品規格與競品，逆向推導市場上的機會客群。" :
           "將數據轉化為具備「人性瑕疵」與「獨特觀點」的數位分身。"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold max-w-3xl mx-auto shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}

      {!isProcessing && persona && (
          <SessionStatusBanner persona={persona} onReset={handleSessionReset} />
      )}

      {isProcessing ? (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative p-12 text-center animate-fade-in">
           <div className="mb-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-lg border border-indigo-50">
                 <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-30"></div>
                 {(() => { const StepIcon = PIPELINE_STEPS[currentStepIndex]?.icon || Loader2; return <StepIcon className="w-10 h-10 text-indigo-600 animate-pulse" />; })()}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">{PIPELINE_STEPS[currentStepIndex]?.label}</h3>
              <p className="text-slate-500 font-medium text-sm animate-pulse">{loadingStage}</p>
           </div>
           <div className="h-1 bg-slate-100 w-full rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${Math.min(100, (currentStepIndex / 5) * 100 + 10)}%` }}></div>
           </div>
        </div>
      ) : (
        <div className={`rounded-3xl shadow-2xl border relative overflow-hidden transition-colors duration-500 bg-white ${activeTab === 'lab' ? 'border-violet-200 shadow-violet-100' : activeTab === 'product' ? 'border-emerald-200 shadow-emerald-100' : 'border-slate-200'}`}>
          
          <div className="flex border-b border-slate-100">
             <button onClick={() => setActiveTab('upload')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'upload' ? 'bg-white text-slate-800 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Upload className="w-4 h-4" /> 數據上傳
             </button>
             <button onClick={() => setActiveTab('lab')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'lab' ? 'bg-white text-violet-700 border-b-2 border-violet-600' : 'bg-slate-50 text-slate-400'}`}>
                <FlaskConical className="w-4 h-4" /> 角色實驗室
             </button>
             <button onClick={() => setActiveTab('product')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'product' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <ShoppingBag className="w-4 h-4" /> 產品雷達
             </button>
          </div>

          <div className="p-6 md:p-8 min-h-[500px]">
            
            <MethodologyVisualizer mode={activeTab} />

            {activeTab === 'upload' && (
               <div className="max-w-3xl mx-auto">
                  {!finalReport ? (
                     <div className="space-y-6">
                        <div 
                           className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-indigo-50 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
                           onClick={() => fileInputRef.current?.click()}
                           onDragOver={handleDrag}
                           onDragLeave={() => setDragActive(false)}
                           onDrop={handleDrop}
                        >
                           <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                           <p className="text-sm font-bold text-slate-600 mb-1">{selectedFile ? selectedFile.name : "拖曳 CSV/TXT 檔案或點擊上傳"}</p>
                           <p className="text-xs text-slate-400">支援格式: .csv, .txt (Max 5MB)</p>
                           <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.txt" />
                           
                           {selectedFile && (
                              <button 
                                 onClick={removeSelectedFile} 
                                 className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                 <X className="w-4 h-4"/>
                              </button>
                           )}
                        </div>
                        
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                           <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">或直接貼上數據</span>
                              <div className="flex bg-slate-200 p-0.5 rounded-lg">
                                 <button onClick={() => setInputMode('qualitative')} className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${inputMode === 'qualitative' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>訪談內容</button>
                                 <button onClick={() => setInputMode('behavioral')} className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${inputMode === 'behavioral' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>行為Log</button>
                              </div>
                           </div>
                           <textarea 
                              value={textInput} 
                              onChange={handleTextChange} 
                              ref={textareaRef} 
                              className="w-full p-4 min-h-[180px] outline-none text-sm font-mono text-slate-700 resize-y" 
                              placeholder={inputMode === 'qualitative' ? "Q: 你平常怎麼決定要買什麼?\nA: 我通常會先在網路上看別人的開箱文..." : "2023-10-01 10:00, view, product_A\n2023-10-01 10:05, cart, product_A"} 
                           />
                           {liveStats.rowCount > 0 && (
                              <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex gap-4 text-[10px] font-mono text-slate-500">
                                 <span>Rows: {liveStats.rowCount}</span>
                                 <span className={liveStats.hasTime ? "text-emerald-600" : "text-amber-600"}>Time: {liveStats.hasTime ? 'DETECTED' : 'MISSING'}</span>
                                 <span className={liveStats.hasAction ? "text-emerald-600" : "text-amber-600"}>Action: {liveStats.hasAction ? 'DETECTED' : 'MISSING'}</span>
                              </div>
                           )}
                        </div>

                        <div className="flex gap-4">
                           <button onClick={loadSampleData} className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
                              <FileText className="w-4 h-4" /> 載入範例
                           </button>
                           
                           <div className="flex gap-2">
                              <button onClick={() => downloadTemplate('general')} className="px-3 py-3 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all" title="下載通用模板">
                                 <Download className="w-4 h-4" />
                              </button>
                           </div>

                           <button 
                              onClick={runFullScan} 
                              disabled={(!selectedFile && !textInput && !isSampleLoaded) || isScanning} 
                              className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                           >
                              {isScanning ? <Loader2 className="w-5 h-5 animate-spin"/> : "開始分析"}
                              {!isScanning && <ArrowRight className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-6 animate-fade-in">
                        <DataHealthIndicator report={finalReport} />
                        
                        <button 
                           onClick={processData}
                           disabled={isButtonLoading}
                           className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-1 ${isButtonLoading ? 'opacity-70 cursor-wait' : 'hover:bg-indigo-700 hover:shadow-2xl'}`}
                        >
                           {isButtonLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
                           {isButtonLoading ? "讀取中..." : (persona ? "覆蓋並重新生成 (Overwrite)" : "生成數位分身")}
                        </button>
                        {error && (
                           <p className="text-center text-rose-500 font-bold text-xs bg-rose-50 p-2 rounded-lg border border-rose-200">
                              ⚠️ {error}
                           </p>
                        )}
                        <button onClick={() => setFinalReport(null)} className="w-full text-slate-500 text-sm hover:underline py-2">
                           返回編輯
                        </button>
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'lab' && (
                <div className="flex flex-col lg:flex-row gap-8 h-full items-stretch animate-fade-in">
                   
                   {/* Restored Banner for Lab */}
                   {isLabRestored && (
                      <div className="absolute top-2 right-6 left-6 z-20 pointer-events-none flex justify-center">
                          <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg animate-fade-in-down">
                              <History className="w-4 h-4" />
                              已還原上次的草稿 (Draft Restored)
                          </div>
                      </div>
                   )}

                   <div className="w-full lg:w-[40%] flex flex-col gap-6">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <UserCog className="w-5 h-5 text-violet-600" />
                                <h3 className="font-black text-slate-700">社會骨架 (Skeleton)</h3>
                            </div>
                            {(labConfig.role || enrichedDNA) && (
                                <button 
                                    onClick={handleClearLabData}
                                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-white rounded-lg border border-slate-200 hover:border-rose-200 shadow-sm"
                                    title="清除實驗室草稿"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            )}
                         </div>
                         
                         <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">角色設定</label>
                            <input 
                               type="text" 
                               value={labConfig.role}
                               onChange={(e) => setLabConfig(prev => ({...prev, role: e.target.value}))}
                               placeholder="e.g. 焦慮的新手爸爸"
                               className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                         </div>

                         <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">生理性別 (Gender)</label>
                            <div className="flex bg-slate-200 p-1 rounded-xl">
                                {['Male', 'Female', 'General'].map((g) => {
                                    const isSelected = labConfig.gender === g;
                                    let label = g === 'Male' ? '男 (Male)' : g === 'Female' ? '女 (Female)' : '不拘 (Any)';
                                    let activeClass = g === 'Male' 
                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                                        : g === 'Female' 
                                            ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' 
                                            : 'bg-white text-slate-700 shadow-sm';
                                    
                                    return (
                                        <button
                                            key={g}
                                            onClick={() => setLabConfig(prev => ({...prev, gender: g as GenderOption}))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                isSelected ? activeClass : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div>
                               <label className="text-xs font-bold text-slate-500 block mb-1">年齡層</label>
                               <select 
                                  value={labConfig.age}
                                  onChange={(e) => setLabConfig(prev => ({...prev, age: e.target.value}))}
                                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                               >
                                  {['18-24', '25-34', '35-44', '45-54', '55+'].map(o => <option key={o} value={o}>{o}</option>)}
                               </select>
                            </div>
                            <div>
                               <label className="text-xs font-bold text-slate-500 block mb-1">財務背景</label>
                               <select 
                                  value={labConfig.income}
                                  onChange={(e) => setLabConfig(prev => ({...prev, income: e.target.value}))}
                                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                               >
                                  {['高負擔/負債 (High Burden)', '一般標準 (Standard)', '家境優渥/業外收入 (Wealthy)'].map(o => <option key={o} value={o}>{o}</option>)}
                               </select>
                            </div>
                         </div>

                         <div className="pt-2 border-t border-slate-200/50">
                             <button 
                                onClick={() => setShowAdvancedLab(!showAdvancedLab)}
                                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 py-1 hover:text-violet-600 transition-colors"
                             >
                                 <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 社會情境參數 (Advanced)</span>
                                 <ChevronsDown className={`w-4 h-4 transition-transform ${showAdvancedLab ? 'rotate-180' : ''}`} />
                             </button>
                             
                             {showAdvancedLab && (
                                 <div className="space-y-3 mt-3 animate-fade-in bg-white p-3 rounded-xl border border-slate-100 shadow-inner">
                                     <div>
                                         <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">地緣經濟 (Geo-Economics)</label>
                                         <select 
                                            value={labConfig.geoId}
                                            onChange={(e) => setLabConfig(prev => ({...prev, geoId: e.target.value}))}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white"
                                         >
                                            <option value="">自動推論 (Auto-Detect)</option>
                                            {openDataService.getGeoOptions().map(geo => (
                                                <option key={geo.id} value={geo.id}>{geo.label}</option>
                                            ))}
                                         </select>
                                     </div>
                                     <div>
                                         <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">家庭結構 (Household)</label>
                                         <select 
                                            value={labConfig.householdId}
                                            onChange={(e) => setLabConfig(prev => ({...prev, householdId: e.target.value}))}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white"
                                         >
                                            <option value="">自動推論 (Auto-Detect)</option>
                                            {openDataService.getHouseholdOptions().map(h => (
                                                <option key={h.id} value={h.id}>{h.label}</option>
                                            ))}
                                         </select>
                                     </div>
                                     <p className="text-[10px] text-amber-600 leading-tight bg-amber-50 p-2 rounded border border-amber-100 flex gap-1">
                                         <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> 
                                         手動鎖定參數將覆蓋系統的自動推論，可能導致與角色設定的衝突。
                                     </p>
                                 </div>
                             )}
                         </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-1 flex flex-col gap-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-5 h-5 text-violet-600" />
                                <h3 className="font-black text-slate-700">壓力測試場景</h3>
                            </div>
                            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                               {SCENARIO_OPTIONS.find(s => s.id === labConfig.shadow)?.title || "自訂"}
                            </span>
                         </div>

                         <div className="flex flex-col gap-2">
                            {SCENARIO_OPTIONS.map((option) => (
                               <button 
                                 key={option.id}
                                 onClick={() => handleScenarioChange(option.id)}
                                 className={`group relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all overflow-hidden ${
                                    labConfig.shadow === option.id 
                                      ? `bg-white ${option.border} shadow-md ring-1 ring-black/5` 
                                      : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300'
                                 }`}
                               >
                                  {labConfig.shadow === option.id && (
                                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${option.accent}`}></div>
                                  )}

                                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 transition-colors ${
                                      labConfig.shadow === option.id ? option.bg : 'bg-slate-100 group-hover:bg-slate-200'
                                  }`}>
                                     <option.icon className={`w-4 h-4 ${labConfig.shadow === option.id ? option.color : 'text-slate-400'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0 pl-1">
                                     <div className={`text-sm font-bold flex justify-between items-center ${
                                         labConfig.shadow === option.id ? 'text-slate-800' : 'text-slate-600'
                                     }`}>
                                        {option.title}
                                        {labConfig.shadow === option.id && <CheckCircle2 className={`w-4 h-4 ${option.color}`} />}
                                     </div>
                                     <p className="text-xs text-slate-400 leading-snug mt-0.5 truncate opacity-80">
                                        {option.desc}
                                     </p>
                                  </div>
                               </button>
                            ))}
                         </div>

                         <div className="pt-4 border-t border-slate-200/50 mt-2">
                            <div className="flex justify-between items-center mb-3">
                               <label className="text-xs font-bold text-slate-500">人性偏差 (Chaos)</label>
                               <span className={`text-xs font-black ${humanityState.color}`}>
                                  {labConfig.chaos}% - {humanityState.label.split(' ')[0]}
                               </span>
                            </div>
                            
                            <div className="relative h-2 rounded-full w-full bg-gradient-to-r from-blue-200 via-emerald-200 to-rose-200">
                               <input 
                                  type="range" 
                                  min="0" max="100" step="10"
                                  value={labConfig.chaos}
                                  onChange={(e) => setLabConfig(prev => ({...prev, chaos: parseInt(e.target.value)}))}
                                  className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                               />
                               <div 
                                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-400 rounded-full shadow-md z-10 pointer-events-none transition-all duration-700"
                                  style={{ left: `calc(${labConfig.chaos}% - 8px)` }}
                               ></div>
                            </div>

                            <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400 select-none">
                               <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => setLabConfig(prev => ({...prev, chaos: 10}))}>
                                  <div className="w-px h-1 bg-slate-300"></div>
                                  完美人設
                               </div>
                               <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setLabConfig(prev => ({...prev, chaos: 50}))}>
                                  <div className="w-px h-1 bg-slate-300"></div>
                                  真實人類
                               </div>
                               <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setLabConfig(prev => ({...prev, chaos: 90}))}>
                                  <div className="w-px h-1 bg-slate-300"></div>
                                  極端混亂
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <button
                           onClick={handleEnrichDNA}
                           disabled={!labConfig.role || isAnalyzingDNA}
                           className="w-full py-3 bg-white border-2 border-violet-100 text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                            {isAnalyzingDNA ? <Loader2 className="w-4 h-4 animate-spin"/> : <Microscope className="w-4 h-4"/>}
                            {enrichedDNA ? "重新解析 DNA" : "解析角色基因 (Analyze)"}
                         </button>
                         
                         <button
                           onClick={processData}
                           disabled={!labConfig.role || isButtonLoading}
                           className="w-full py-4 bg-violet-600 text-white font-bold rounded-xl shadow-lg hover:bg-violet-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-1"
                         >
                            {isButtonLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 animate-pulse" />}
                            {persona ? "覆蓋並生成 (Synthesize)" : "生成行為數據 (Synthesize)"}
                         </button>
                         {error && (
                            <p className="text-center text-rose-500 font-bold text-xs bg-rose-50 p-2 rounded-lg border border-rose-200">
                               ⚠️ {error}
                            </p>
                         )}
                         <p className="text-center text--[10px] text-slate-400">
                            {isDnaStale ? "⚠️ 注意：左側參數已變更，系統將在背景重新解析 DNA。" : "系統將根據 DNA 特徵生成 30 筆行為數據。"}
                         </p>
                      </div>
                   </div>

                   <div className="w-full lg:w-[60%] flex flex-col min-h-[400px]">
                      {isAnalyzingDNA ? (
                         <DnaSkeleton />
                      ) : enrichedDNA ? (
                         <HolographicDnaCard 
                            dna={enrichedDNA} 
                            isStale={isDnaStale}
                            onRefresh={handleEnrichDNA}
                         />
                      ) : (
                         <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                               <Atom className="w-10 h-10 text-slate-300" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-600 mb-2">等待樣本注入</h4>
                            <p className="text-sm text-slate-400 max-w-xs">
                               請在左側填寫角色骨架，並點擊「解析角色基因」以啟動賽博實驗室。
                            </p>
                         </div>
                      )}
                   </div>

                </div>
            )}

            {activeTab === 'product' && (
               <div className="flex flex-col gap-8 animate-fade-in">
                  
                  {isRestored && (
                      <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold animate-fade-in mb-4">
                          <History className="w-4 h-4" />
                          已還原上次的分析紀錄 (Restored from session)
                      </div>
                  )}

                  <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 z-0 pointer-events-none"></div>
                     <div className="relative z-10 flex flex-col gap-6">
                        
                        <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide border-b border-emerald-100 pb-2">
                           <Package className="w-4 h-4" /> 產品事實 (Product Identity)
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1">產品名稱 (Product Name)</label>
                              <input 
                                 type="text" 
                                 value={productInput.name}
                                 onChange={(e) => setProductInput({...productInput, name: e.target.value})}
                                 placeholder="e.g. UltraFit 智慧手錶 Pro"
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:font-normal"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1">產品類別 (選填)</label>
                              <input 
                                 type="text" 
                                 value={productInput.category}
                                 onChange={(e) => setProductInput({...productInput, category: e.target.value})}
                                 placeholder="e.g. 穿戴裝置 / 3C"
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:font-normal"
                              />
                           </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-end">
                           <div className="w-24 shrink-0">
                              <label className="text-xs font-bold text-slate-500 block mb-1">幣別</label>
                              <select 
                                 value={productInput.priceUnit} 
                                 onChange={(e) => setProductInput({...productInput, priceUnit: e.target.value})}
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                              >
                                 <option value="NT$">NT$</option>
                                 <option value="US$">US$</option>
                                 <option value="¥">¥</option>
                              </select>
                           </div>
                           <div className="flex-1">
                              <label className="text-xs font-bold text-slate-500 block mb-1">價格 (Amount)</label>
                              <input 
                                 type="number" 
                                 value={productInput.priceAmount}
                                 onChange={(e) => setProductInput({...productInput, priceAmount: e.target.value})}
                                 placeholder="e.g. 12000"
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:font-normal"
                              />
                           </div>
                           <div className="w-32 shrink-0">
                              <label className="text-xs font-bold text-slate-500 block mb-1">計費週期</label>
                              <select 
                                 value={productInput.priceCycle} 
                                 onChange={(e) => setProductInput({...productInput, priceCycle: e.target.value})}
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                              >
                                 <option value="一次性 (One-time)">一次性買斷</option>
                                 <option value="月費 (Monthly)">每月訂閱</option>
                                 <option value="年費 (Yearly)">每年訂閱</option>
                              </select>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                     <div className="flex items-center gap-2 text-slate-700 font-black text-sm uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">
                        <Hammer className="w-4 h-4" /> 硬體規格 / 功能特徵 (Hard Specs)
                     </div>
                     
                     <div className="space-y-3">
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={productInput.currentSpecInput}
                              onChange={(e) => setProductInput({...productInput, currentSpecInput: e.target.value})}
                              onKeyDown={handleAddSpec}
                              placeholder="輸入規格後按 Enter (e.g. 鈦金屬外殼, 30天續航, 無糖)"
                              className="flex-1 p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                           />
                           <button 
                              onClick={() => {
                                if (productInput.currentSpecInput.trim()) {
                                  setProductInput(prev => ({
                                      ...prev,
                                      specs: [...prev.specs, prev.currentSpecInput.trim()],
                                      currentSpecInput: ''
                                  }));
                                }
                              }}
                              className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                           >
                              <Plus className="w-5 h-5" />
                           </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                           {productInput.specs.length > 0 ? (
                              productInput.specs.map((spec, i) => (
                                 <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm group">
                                    {spec}
                                    <button onClick={() => handleRemoveSpec(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                       <X className="w-3 h-3" />
                                    </button>
                                 </span>
                              ))
                           ) : (
                              <span className="text-slate-400 text-xs italic p-1">暫無規格標籤...</span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-end">
                     <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center gap-2 text-slate-600 font-black text-sm uppercase tracking-wide">
                           <Anchor className="w-4 h-4" /> 對標競品 (Competitor Anchor)
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1">競品名稱 (必填)</label>
                              <input 
                                 type="text" 
                                 value={productInput.competitorName}
                                 onChange={(e) => setProductInput({...productInput, competitorName: e.target.value})}
                                 placeholder="e.g. Apple Watch SE"
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1">競品價格 (選填)</label>
                              <input 
                                 type="text" 
                                 value={productInput.competitorPrice}
                                 onChange={(e) => setProductInput({...productInput, competitorPrice: e.target.value})}
                                 placeholder="AI 自動搜尋 (或手動輸入)"
                                 className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="flex w-full md:w-auto gap-3">
                        {(productInput.name || candidates.length > 0) && (
                            <button
                                onClick={handleClearProductData}
                                className="px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm h-14 flex items-center justify-center"
                                title="清除重置"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={() => handleProductAnalysis()}
                            disabled={!productInput.name || !productInput.priceAmount || isAnalyzingProduct}
                            className="flex-1 md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap h-14"
                        >
                            {isAnalyzingProduct ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            {isAnalyzingProduct ? "運算三維矩陣..." : "開始分析 (Gap Analysis)"}
                        </button>
                     </div>
                  </div>

                  {productDiagnosis && (
                      <div className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                          {/* Left: Chart Area (60%) */}
                          <div className="flex-1 md:w-[60%] relative border-b md:border-b-0 md:border-r border-slate-100 p-4">
                              <div className="absolute top-0 left-0 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded border border-indigo-100 z-10 flex items-center gap-1.5 m-4">
                                  <Zap className="w-3 h-3 text-indigo-600" />
                                  <span>Trinity Core: 戰略矩陣 (v9.0)</span>
                              </div>
                              <StrategicMatrixChart 
                                  candidates={candidates} 
                                  selectedId={selectedCandidateId}
                                  onSelect={setSelectedCandidateId}
                              />
                          </div>
                          {/* Right: Detail Panel (40%) */}
                          <div className="md:w-[40%] bg-slate-50/50 flex flex-col border-l border-slate-100 shadow-inner">
                              <CandidateDetailPanel 
                                  candidate={selectedCandidate} 
                                  onGenerate={handleDirectGeneration}
                                  isProcessing={isProcessing}
                                  processingId={processingCandidateId}
                              />
                          </div>
                      </div>
                  )}
               </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
