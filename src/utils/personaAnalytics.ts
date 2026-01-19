import { DigitalTwinPersona, TensionAnalysis, MarketingTactic, SimulationModifiers, ContentCategory, PersonalityDimension } from '../types';
import { getTimeLabel } from './timeContextMap';

// --- Types ---

export interface DataDimensionReport {
  id: string;
  dimension: string;
  score: number;
  missingReason?: string;
}

export interface DataCompletenessAnalysis {
  overallScore: number;
  dimensions: DataDimensionReport[];
  suggestions: string[];
}

export interface QualityReport {
  qualityScore: number;
  stabilityScore: number;
  missingFields: string[];
}

export interface ConversionAnalysis {
  totalScore: number; // 0-100
  sentiment: string;
  drive: { score: number; label: string };
  resistance: { score: number; label: string; isRealityLocked: boolean };
  marketingFlavor: string;
  boosters: { label: string; impact: number }[];
  blockers: { label: string; impact: number | string }[];
}

// --- Helpers ---

export const getAvatarTitle = (persona: DigitalTwinPersona | null): string => {
  if (!persona) return "未命名";
  // Priority: Display Role (Reality Check) > Role (Skeleton) > Life Stage
  const rcRole = persona.origin_profile?.dna?.reality_check?.correction_rules?.display_role;
  const skRole = persona.origin_profile?.skeleton?.role;
  const lsRole = persona.context_profile?.life_stage;
  
  let title = rcRole || skRole || lsRole || "使用者";
  // Remove parenthesis if present in display_role e.g. "Title (?)"
  return title.replace(/[?()]/g, '').trim();
};

export const parseEvidence = (text: string): { reasoning: string; reference: string | null } => {
  if (!text) return { reasoning: "無詳細說明", reference: null };
  // Check for reference pattern like "(Ref: ...)" or "[Source: ...]"
  const refMatch = text.match(/[\(\[]\s*(?:Ref|Source|來源)[:：]\s*(.*?)[\)\]]$/i);
  if (refMatch) {
    return {
      reasoning: text.replace(refMatch[0], '').trim(),
      reference: refMatch[1].trim()
    };
  }
  return { reasoning: text, reference: null };
};

export const translateConstraint = (key: string, value: string): string => {
    // Simple translation helper if needed, or just return value
    return value;
};

export const getMarketingFlavor = (persona: DigitalTwinPersona): string => {
  const archetype = persona.context_profile?.marketing_archetype?.decision_archetype || "";
  const tone = persona.interaction_style?.tone_preference?.[0] || "";
  
  if (archetype.includes("衝動") || tone.includes("熱情")) return "感性 / 體驗導向";
  if (archetype.includes("考據") || tone.includes("理性")) return "理性 / 數據導向";
  if (archetype.includes("跟風") || tone.includes("活潑")) return "社群 / 流行導向";
  return "平衡 / 實用導向";
};

// --- Analysis Functions ---

export const analyzeAvatarVisuals = (persona: DigitalTwinPersona) => {
    // Infer visual style from personality
    const dimensions = persona.personality_profile?.dimensions;
    const noveltyScore = dimensions?.novelty_seeking?.base_score || 50;
    const riskScore = dimensions?.risk_attitude?.base_score || 50;
    
    const isNovelty = noveltyScore > 60;
    const isConservative = riskScore < 40;
    
    return {
        fashion: isNovelty ? "Modern, trendy streetwear" : (isConservative ? "Formal professional attire" : "Casual, comfortable daily wear"),
        accessories: isNovelty ? "Stylish glasses or hat" : "Minimalist watch",
        expression: "Neutral friendly expression",
        lighting: "Soft studio lighting",
        bg_color: "Neutral grey studio background",
        color_palette: "Soft pleasing colors"
    };
};

export const calculateBaselines = (persona: DigitalTwinPersona): SimulationModifiers => {
    // Infer based on personality dimensions
    const dimensions = persona.personality_profile?.dimensions;
    
    // Default values if dimensions are missing
    const spontaneous = dimensions?.planning_vs_spontaneous?.base_score ?? 50;
    const sensitivity = dimensions?.financial_sensitivity?.base_score ?? 50;
    const social = dimensions?.social_orientation?.base_score ?? 50;

    return {
        budget_anxiety: sensitivity,
        patience: Math.max(10, 100 - spontaneous), // More spontaneous = Less patient
        social_mask: social,
        purchase_intent: Math.max(10, spontaneous * 0.6), // More spontaneous = Higher intent (impulse base)
        social_context: undefined
    };
};

export const formatEmotionalBarrier = (val: string) => val;
export const formatTimeConstraint = (val: string) => val;

export const getDimensionConfig = (key: string) => {
    const map: Record<string, { left: string; right: string }> = {
        'novelty_seeking': { left: '保守 (Conservative)', right: '嘗鮮 (Novelty)' },
        'planning_vs_spontaneous': { left: '計畫 (Planned)', right: '隨性 (Spontaneous)' },
        'social_orientation': { left: '獨處 (Solitary)', right: '社交 (Social)' },
        'risk_attitude': { left: '避險 (Risk Averse)', right: '冒險 (Risk Taker)' },
        'financial_sensitivity': { left: '價格敏感 (Price)', right: '價值導向 (Value)' },
        'health_concern': { left: '隨意 (Carefree)', right: '養生 (Health)' }
    };
    return map[key] || { left: 'Low', right: 'High' };
};

export const analyzeEmotionalBarrier = (val: string | undefined) => {
    const safeVal = val || "";
    // Analyze severity based on text content
    const isSevere = safeVal.includes("高") || safeVal.includes("強") || safeVal.includes("High");
    return { label: safeVal, isSevere, marketingAdvice: isSevere ? "建議提供試用或保證以降低風險。" : "可強調創新點。" };
};

export const analyzeAttentionMode = (avgPages: number) => {
    if (avgPages > 10) return { label: "🔍 深度研究 (Deep)", description: "高度專注，正在進行詳細比較。" };
    if (avgPages > 5) return { label: "👀 一般瀏覽 (Casual)", description: "有興趣，但尚未深入。" };
    return { label: "⚡️ 碎片掃描 (Scan)", description: "快速滑過，注意力短暫。" };
};

export const analyzeDataCompleteness = (persona: DigitalTwinPersona): DataCompletenessAnalysis => {
    const dimensions: DataDimensionReport[] = [
        { id: 'time', dimension: '時間維度', score: 0 },
        { id: 'money', dimension: '金錢維度', score: 0 },
        { id: 'content', dimension: '內容維度', score: 0 },
        { id: 'psych', dimension: '性格維度', score: 0 },
        { id: 'context', dimension: '情境維度', score: 0 }
    ];

    const suggestions: string[] = [];

    // 1. Time
    // Safe access with optional chaining
    const timeEvidence = persona.constraints?.time?.evidence;
    if (timeEvidence && timeEvidence !== "系統預設" && timeEvidence !== "無相關數據") {
        dimensions[0].score = 100;
    } else {
        dimensions[0].score = 20;
        dimensions[0].missingReason = "缺乏具體時間戳記";
        suggestions.push("建議補充帶有時間戳記的行為數據");
    }

    // 2. Money
    // Safe access with optional chaining
    const moneyEvidence = persona.constraints?.money?.evidence;
    // [FIX] Added parentheses to ensure moneyEvidence existence check covers both conditions
    if (moneyEvidence && (moneyEvidence.includes("$") || moneyEvidence.match(/\d+/)) && moneyEvidence !== "無相關數據") {
         dimensions[1].score = 100;
    } else {
         dimensions[1].score = 40;
         dimensions[1].missingReason = "缺乏具體金額數據";
         suggestions.push("建議補充消費金額或預算範圍");
    }

    // 3. Content
    const contentCount = persona.behavioral_pattern?.content_preference?.top_categories?.length || 0;
    if (contentCount > 2) dimensions[2].score = 90;
    else if (contentCount > 0) dimensions[2].score = 60;
    else {
        dimensions[2].score = 10;
        dimensions[2].missingReason = "缺乏內容偏好";
    }
    
    // 4. Psych (Personality)
    const validDims = persona.personality_profile?.dimensions 
        ? Object.values(persona.personality_profile.dimensions).filter((d: any) => d.evidence && d.evidence !== "無相關數據")
        : [];
        
    if (validDims.length >= 3) dimensions[3].score = 90;
    else if (validDims.length > 0) dimensions[3].score = 60;
    else {
        dimensions[3].score = 30;
        dimensions[3].missingReason = "性格特徵不明顯";
    }

    // 5. Context
    if (persona.context_profile?.marketing_archetype?.decision_archetype) dimensions[4].score = 80;
    else dimensions[4].score = 30;

    const overallScore = Math.round(dimensions.reduce((acc, d) => acc + d.score, 0) / 5);

    return { overallScore, dimensions, suggestions };
};

export const generateAttentionMatrix = (persona: DigitalTwinPersona) => {
    const categories = persona.behavioral_pattern?.content_preference?.top_categories || [];
    const endDate = new Date(persona.data_window?.end_date || Date.now()); 

    if (categories.length === 0) {
        return [
            { x: 1, y: 1, z: 100, label: "無數據", type: "glance", opacity: 0.3, recencyLabel: "等待輸入", keywords: [], lastSeen: "N/A" }
        ];
    }

    return categories.map((cat: ContentCategory) => {
        const duration = Math.max(1, cat.estimated_span_days || 1);
        const count = cat.interaction_count || 1;
        
        let intensity = count / duration;
        if (count === 1) {
            intensity = 0.1; 
        }

        const weight = Math.max(100, (cat.weight || 50) * 5); 

        let opacity = 1.0;
        let lastSeenDate = endDate;
        if (cat.last_seen_at) {
             const safeDateStr = cat.last_seen_at.replace(' ', 'T');
             const d = new Date(safeDateStr);
             if (!isNaN(d.getTime())) lastSeenDate = d;
        }
        
        const daysSince = (endDate.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSince > 30) opacity = 0.3; 
        else if (daysSince > 7) opacity = 0.6; 
        else opacity = 1.0; 

        let type = "glance";
        let recencyLabel = "隨意瀏覽";

        const isLongDuration = duration > 7;
        const isHighIntensity = intensity >= 1.5;

        if (isHighIntensity && !isLongDuration) {
            type = "burst"; 
            recencyLabel = "短期爆發";
        } else if (isHighIntensity && isLongDuration) {
            type = "obsession"; 
            recencyLabel = "長期狂熱";
        } else if (!isHighIntensity && isLongDuration) {
            type = "habit"; 
            recencyLabel = "穩定關注";
        }

        const keywords = (cat.keywords || []).slice(0, 3);
        const lastSeen = cat.last_seen_at ? cat.last_seen_at.split(' ')[0] : "未知"; 

        return {
            x: parseFloat(duration.toFixed(1)),
            y: parseFloat(intensity.toFixed(1)),
            z: weight,
            label: cat.name || "未知主題",
            type: type,
            opacity: opacity,
            recencyLabel: recencyLabel,
            keywords: keywords, 
            lastSeen: lastSeen 
        };
    });
};

export const calculateConversionScore = (persona: DigitalTwinPersona): ConversionAnalysis => {
  const boosters = [];
  const blockers = [];

  // 1. CALCULATE DRIVE (Desire + Urgency)
  let driveScore = 50;
  
  const visits = persona.behavioral_pattern?.frequency?.visits_per_month || 0;
  if (visits > 10) { driveScore += 20; boosters.push({ label: "高頻回訪", impact: 20 }); }
  else if (visits > 5) { driveScore += 10; boosters.push({ label: "定期關注", impact: 10 }); }
  
  const archetype = persona.context_profile?.marketing_archetype?.decision_archetype || "";
  if (archetype.includes("衝動") || archetype.includes("直覺")) { 
      driveScore += 15; 
      boosters.push({ label: "衝動性格", impact: 15 }); 
  }
  else if (archetype.includes("觀望")) { 
      driveScore -= 10; 
  }

  const depth = persona.behavioral_pattern?.depth?.avg_pages_per_session || 0;
  if (depth > 8) { driveScore += 15; boosters.push({ label: "深度研究", impact: 15 }); }

  driveScore = Math.min(100, Math.max(10, driveScore));

  // 2. CALCULATE RESISTANCE (Friction * Reality Coefficient)
  let frictionScore = 30;

  const money = persona.constraints?.money;
  const isPriceSensitive = (money?.price_sensitivity || "").includes('High') || (money?.price_sensitivity || "").includes('高');
  if (isPriceSensitive) { 
      frictionScore += 20; 
      blockers.push({ label: "價格敏感", impact: "-20" }); 
  }

  const aversion = persona.constraints?.emotional?.change_aversion || "";
  if (aversion.includes("High") || aversion.includes("高")) {
      frictionScore += 15;
      blockers.push({ label: "改變慣性", impact: "-15" });
  }

  const reality = persona.origin_profile?.dna?.reality_check;
  let realityCoeff = 1.0;
  let isRealityLocked = false;

  if (reality?.coherence_level === 'Insolvent') {
      realityCoeff = 2.5; 
      isRealityLocked = true;
      blockers.push({ label: "負債風險 (Hard Lock)", impact: "CRITICAL" });
  } else if (reality?.coherence_level === 'Delusional') {
      realityCoeff = 1.8; 
      isRealityLocked = true;
      blockers.push({ label: "認知偏離 (Delusional)", impact: "HIGH" });
  } else if ((money?.spending_power_level || "").includes('Low') || (money?.spending_power_level || "").includes('低')) {
      realityCoeff = 1.2; 
      blockers.push({ label: "預算限制", impact: "-10" });
  }

  const finalResistance = Math.min(100, frictionScore * realityCoeff);

  // 4. NET SCORE FORMULA
  let netScore = 50 + (driveScore - finalResistance) * 0.8;
  
  if (isRealityLocked) {
      netScore = Math.min(netScore, 45);
  }

  netScore = Math.min(100, Math.max(0, Math.round(netScore)));

  let sentiment = "觀望中";
  if (netScore >= 75) sentiment = "極高 (Hot)";
  else if (netScore >= 60) sentiment = "高 (Warm)";
  else if (netScore <= 30) sentiment = "極低 (Cold)";
  else sentiment = "中立 (Neutral)";

  return {
      totalScore: netScore,
      sentiment,
      marketingFlavor: getMarketingFlavor(persona), 
      drive: { score: driveScore, label: "購買慾望 (Drive)" },
      resistance: { score: Math.round(finalResistance), label: "現實阻力 (Friction)", isRealityLocked },
      boosters,
      blockers
  };
};

export const analyzeFullPersona = (persona: DigitalTwinPersona) => {
    // 1. One Liner
    const oneLiner = persona.origin_profile?.dna?._generated_resonance?.marketing_hook
        || persona.interaction_style?.chart_comments?.behavioral_rationale 
        || "一位典型的數位使用者。";

    // 2. Quality Report
    const qualityReport: QualityReport = {
        qualityScore: Math.round(persona.confidence_score || 85),
        stabilityScore: 90,
        missingFields: []
    };

    // 3. Decision Drivers (Derived from Personality or Constraints)
    // Map constraints to drivers if not explicitly available
    const drivers = [];
    const sens = persona.constraints?.money?.price_sensitivity || "";
    if (sens.includes('高')) {
        drivers.push({ label: '折扣促銷', score: 90, type: 'positive' as const });
    }
    const aversion = persona.constraints?.emotional?.change_aversion || "";
    if (aversion.includes('高')) {
        drivers.push({ label: '網友口碑', score: 85, type: 'positive' as const }); // Social proof reduces risk
    }
    // Fallback drivers
    if (drivers.length === 0) {
        drivers.push({ label: '功能實用性', score: 80, type: 'positive' as const });
    }

    // 4. Tension Analysis
    let tensionAnalysis: TensionAnalysis = {
        state: 'Drifter',
        label: '隨波逐流',
        description: '無明顯壓力或動力',
        strategy: '建立接觸點',
        advice: '多曝光',
        scores: { desire: 30, defense: 30 }
    };
    if (persona.system_state?.psychological_state) {
        tensionAnalysis = {
            state: persona.system_state.psychological_state.quadrant,
            label: persona.system_state.psychological_state.quadrant,
            description: "基於心理狀態分析",
            strategy: "建議策略",
            advice: "建議操作",
            scores: { desire: 60, defense: 60 },
            breakdown: {
                desire_source: persona.system_state.psychological_state.desire_source,
                defense_source: persona.system_state.psychological_state.defense_source,
                rational_alibi: persona.system_state.psychological_state.rational_alibi
            }
        };
    }

    // 5. Attention Matrix Data
    const attentionMatrix = generateAttentionMatrix(persona);

    // 6. Conversion Analysis
    const conversion = calculateConversionScore(persona);

    // 7. Golden Moments
    const goldenMoments = (persona.behavioral_pattern?.time_pattern?.preferred_time_slots || []).map(ts => {
        const ctx = getTimeLabel(ts, persona);
        return {
            time: ts,
            context: ctx.label,
            channel: ctx.channel,
            icon: ctx.icon,
            mindsetLabel: ctx.mindsetLabel
        };
    });

    return {
        oneLiner,
        qualityReport,
        decisionDrivers: drivers,
        tensionAnalysis,
        attentionMatrix,
        conversion,
        goldenMoments,
        blindSpotStrategy: persona.system_state?.composite_flaw?.description || "無明顯盲點",
        dataCompleteness: analyzeDataCompleteness(persona)
    };
};
