
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { analyzeKeywordIntent } from '../services/searchService';
import { getAvatarTitle } from '../utils/personaAnalytics';
import { AvatarDisplay } from '../components/dashboard';
import { 
  Search, Sparkles, Loader2, Target, AlertTriangle, 
  Brain, ShieldAlert, CheckCircle2, XCircle, MousePointer2 
} from 'lucide-react';
import { IntentPrismResult, SearchIntentState } from '../types';

const IntentCard: React.FC<{ state: SearchIntentState }> = ({ state }) => {
  const isPain = state.state_type === 'Urgent_Pain';
  const isRational = state.state_type === 'Rational_Comparison';
  
  // Style Config
  const style = isPain ? {
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-800',
      accent: 'bg-rose-500',
      Icon: ShieldAlert
  } : isRational ? {
      border: 'border-indigo-200',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      textColor: 'text-indigo-800',
      accent: 'bg-indigo-500',
      Icon: Brain
  } : {
      border: 'border-slate-300',
      bg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      textColor: 'text-slate-800',
      accent: 'bg-slate-500',
      Icon: AlertTriangle
  };

  const Icon = style.Icon;

  return (
    <div className={`rounded-2xl border ${style.border} bg-white shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow`}>
       {/* Header */}
       <div className={`px-4 py-3 ${style.bg} border-b ${style.border} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
             <Icon className={`w-4 h-4 ${style.iconColor}`} />
             <span className={`font-bold text-sm ${style.textColor}`}>{state.label}</span>
          </div>
          <div className="text-[10px] font-black opacity-60 uppercase tracking-wider">{state.state_type.split('_')[0]}</div>
       </div>

       {/* Body */}
       <div className="p-5 flex-1 flex flex-col gap-4">
          
          {/* OS Bubble */}
          <div className="relative">
             <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-600 italic leading-relaxed">
                "{state.inner_monologue}"
             </div>
             <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase pl-1">Inner Monologue</div>
          </div>

          {/* Trigger Context */}
          <div>
             <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">觸發情境 (Context)</div>
             <p className="text-xs font-medium text-slate-700 leading-snug">
                {state.context_trigger}
             </p>
          </div>

          {/* Search Queries */}
          <div>
             <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                <Search className="w-3 h-3" /> 搜尋關鍵字
             </div>
             <div className="flex flex-wrap gap-1.5">
                {state.search_queries.map((q, i) => (
                   <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200">
                      {q}
                   </span>
                ))}
             </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 my-1"></div>

          {/* Content Validity (The Solution) */}
          <div className="space-y-3">
             {/* High Validity */}
             <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase mb-1">
                   <CheckCircle2 className="w-3.5 h-3.5" /> High Validity (高點擊)
                </div>
                <div className="font-bold text-sm text-slate-800 mb-1 leading-tight">
                   {state.content_strategy.high_validity.title}
                </div>
                <p className="text-[10px] text-emerald-700/80 leading-snug">
                   {state.content_strategy.high_validity.reason}
                </p>
             </div>

             {/* Low Validity */}
             <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 opacity-80">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase mb-1">
                   <XCircle className="w-3.5 h-3.5" /> Low Validity (低效度)
                </div>
                <div className="font-bold text-sm text-slate-700 mb-1 leading-tight line-through decoration-rose-300">
                   {state.content_strategy.low_validity.title}
                </div>
                <p className="text-[10px] text-rose-700/80 leading-snug">
                   {state.content_strategy.low_validity.reason}
                </p>
             </div>
          </div>

       </div>
    </div>
  );
};

const SearchPage: React.FC = () => {
  const { persona } = usePersona();
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IntentPrismResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If no persona, show empty state
  if (!persona) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
         <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Search className="w-10 h-10 text-slate-300" />
         </div>
         <h2 className="text-2xl font-black text-slate-800 mb-3">搜尋智能實驗室</h2>
         <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
            請先建立數位分身，才能使用「意圖稜鏡 (Intent Prism)」分析其搜尋心理與內容偏好。
         </p>
         <Link to="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
            前往建立分身
         </Link>
      </div>
    );
  }

  const handleAnalyze = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!keyword.trim() || isAnalyzing) return;

      setIsAnalyzing(true);
      setError(null);
      
      try {
          const data = await analyzeKeywordIntent(persona, keyword);
          setResult(data);
      } catch (err) {
          console.error(err);
          setError("分析失敗，請稍後再試。");
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-[calc(100vh-80px)]">
       
       {/* Header Section */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" />
                搜尋智能實驗室
             </h1>
             <p className="text-sm text-slate-500 mt-1 font-medium">
                Intent Prism: 解析同一關鍵字背後的三種心理狀態與內容效度。
             </p>
          </div>

          {/* Persona Badge */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
             <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                <AvatarDisplay avatarUrl={persona.avatar_url} isLoading={false} error={null} simple />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analysis Target</span>
                <span className="text-xs font-bold text-slate-700">{getAvatarTitle(persona)}</span>
             </div>
          </div>
       </div>

       {/* Search Bar */}
       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 pointer-events-none opacity-50"></div>
          
          <form onSubmit={handleAnalyze} className="relative z-10 max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
             <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                   type="text" 
                   value={keyword}
                   onChange={(e) => setKeyword(e.target.value)}
                   placeholder="輸入目標關鍵字 (e.g. 益生菌, 露營椅, AI工具)"
                   className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-800 placeholder:font-normal"
                />
             </div>
             <button 
                type="submit"
                disabled={!keyword.trim() || isAnalyzing}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
             >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isAnalyzing ? "正在稜鏡折射..." : "啟動意圖分析"}
             </button>
          </form>
          {error && <p className="text-center text-rose-500 text-xs font-bold mt-3">{error}</p>}
       </div>

       {/* Result Grid */}
       {result && (
          <div className="space-y-6 animate-fade-in-up">
             <div className="flex items-center gap-2 px-2">
                <span className="text-xs font-bold text-slate-400">分析對象關鍵字:</span>
                <span className="text-xl font-black text-slate-800">{result.keyword}</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.states.map((state, idx) => (
                   <IntentCard key={idx} state={state} />
                ))}
             </div>
          </div>
       )}

       {/* Empty State / Intro */}
       {!result && !isAnalyzing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 opacity-40 select-none pointer-events-none filter grayscale">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center">
                   <Target className="w-8 h-8 text-slate-300" />
                </div>
             ))}
          </div>
       )}

    </div>
  );
};

export default SearchPage;
