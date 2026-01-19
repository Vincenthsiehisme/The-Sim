
import { DigitalTwinPersona, OriginProfile, PersonaDNA, GenderOption, SociologyOverrides, SimulationModifiers, ScenarioMode, ObservedEvidence } from '../../types';
import { DigitalTwinPersonaSchema } from '../../schemas/personaSchema';
import { 
  OMNISCIENT_ANALYST_INSTRUCTION,
  PSYCHOLOGIST_INSTRUCTION,
  ACTOR_INSTRUCTION,
  ARCHITECT_INSTRUCTION,
  buildArchitectPrompt,
  buildChatSystemInstruction, 
  SCHEMA_INFERENCE_INSTRUCTION, 
  AVATAR_GENERATION_PROMPT_TEMPLATE,
  buildCsvSchemaPrompt,
  buildAnalystBasePrompt,
  buildChatContextHeaders,
  ENRICHMENT_INSTRUCTION,
  buildProfilerPrompt
} from '../../prompts';
import { sanitizeAndNormalizePersona, trySafeJsonParse, cleanJsonString } from '../../utils/normalization';
import { analyzeAvatarVisuals } from '../../utils/personaAnalytics';
import { smartDistillCsv } from '../../utils/smartDistiller';
import { getSocioEconomicContext } from '../../data/taiwan_sociology';
import { openDataService } from '../OpenDataService';
import { GEO_ECONOMICS } from '../../data/open_data/geo_economics';
import { HOUSEHOLD_STRUCTURES } from '../../data/open_data/household_structure';
import { LLMGateway, retryWithBackoff, delay } from '../infrastructure/LLMGateway';
import { Chat } from "@google/genai";

/**
 * Helper: Map Scenario ID to English Shadow Description
 */
const mapScenarioToShadow = (id: string): string => {
    switch (id) {
        case 'fomo': return "FOMO Follower. Easily influenced by trends and crowd count.";
        case 'cp': return "Extreme Pragmatist. Calculates CP value, ignores emotional marketing.";
        case 'vibe': return "Aesthetic Curator. Prioritizes visuals and brand vibe over function.";
        case 'hater': return "Hostile Skeptic. Assumes marketing is a scam. Needs extreme proof.";
        case 'auto': return ""; // Return empty string to let AI infer
        default: return id;
    }
};

export class PersonaAgent {
  
  public static async inferCsvSchema(csvText: string): Promise<Record<string, string> | null> {
    return retryWithBackoff(async () => {
      try {
        const ai = LLMGateway.getClient();
        const model = "gemini-3-flash-preview";
        const lines = csvText.split('\n');
        const header = lines[0] || '';
        const sampleRows = lines.slice(1, 6).join('\n'); 
        if (!header.trim() || !sampleRows.trim()) return null;
        const prompt = buildCsvSchemaPrompt(header, sampleRows);
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: SCHEMA_INFERENCE_INSTRUCTION }, { text: prompt }] }
          ],
          config: { responseMimeType: 'application/json' }
        });
        return trySafeJsonParse<Record<string, string> | null>(cleanJsonString(response.text || "{}"), null);
      } catch (error) {
        if ((error as any).status || (error as any).code) throw error;
        console.error("Error during CSV schema inference logic:", error);
        return null;
      }
    }, 2, 5000, "Schema Inference", false);
  }

  public static async enrichRole(
    role: string, 
    age: string, 
    income: string,
    shadowId?: string, 
    gender?: GenderOption, 
    resonance?: any,
    overrides?: SociologyOverrides
  ): Promise<PersonaDNA> {
    return retryWithBackoff(async () => {
      const ai = LLMGateway.getClient();
      const model = "gemini-3-flash-preview";
      const shadowDesc = shadowId ? mapScenarioToShadow(shadowId) : "";
      const { narrative, constraints, realityCheck } = getSocioEconomicContext(age, role, income, undefined, overrides);
      console.log(">> MECE Sociological Context:", narrative);
      const prompt = buildProfilerPrompt(role, age, income, shadowDesc, narrative, gender, resonance);
      const response = await ai.models.generateContent({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: ENRICHMENT_INSTRUCTION }, { text: prompt }] }
          ],
          config: { tools: [{ googleSearch: {} }], temperature: 0.9 }
      });
      const dna = trySafeJsonParse<PersonaDNA>(cleanJsonString(response.text || "{}"));
      if (!dna.lifestyle || !dna.anxiety || !dna.spending_habit) throw new Error("Profiler returned incomplete DNA");
      dna.role = role;
      if (constraints) dna._sociology_pack = constraints;
      if (overrides) dna._context_settings = overrides;
      if (resonance) {
          const aiGeneratedScript = dna._generated_resonance?.interaction_script;
          dna._generated_resonance = { ...resonance, interaction_script: aiGeneratedScript };
      }
      if (realityCheck) {
          dna.reality_check = { ...dna.reality_check, coherence_level: realityCheck.coherence_level, correction_rules: realityCheck.correction_rules, social_tension: realityCheck.social_tension } as any;
      }
      return dna;
    }, 2, 3000, "Persona Enrichment");
  }

  public static async synthesizeData(
    skeleton: { role: string, age: string, income: string, gender?: GenderOption },
    shadowId: string,
    chaos: number,
    dna?: PersonaDNA
  ): Promise<string> {
    return retryWithBackoff(async () => {
      const ai = LLMGateway.getClient();
      const model = "gemini-3-flash-preview";
      const shadowDesc = mapScenarioToShadow(shadowId);
      const timeProfile = openDataService.getTimeProfileByRole(skeleton.role);
      let scheduleSummary = "";
      if (timeProfile) {
          scheduleSummary = `Role Type: ${timeProfile.label}\nHourly Activity Weights (0-100):\n`;
          const weights = timeProfile.hourly_weights;
          let currentBlockStart = 0;
          let currentWeight = weights[0];
          for (let i = 1; i <= 24; i++) {
              const w = (i < 24) ? weights[i] : -1;
              if (Math.abs(w - currentWeight) > 15 || i === 24) {
                 const range = currentBlockStart === i - 1 ? `${currentBlockStart}:00` : `${currentBlockStart}:00-${i-1}:59`;
                 let intensity = "Zero";
                 if (currentWeight > 80) intensity = "High Intensity (Focus/Peak)";
                 else if (currentWeight > 40) intensity = "Medium (Routine)";
                 else if (currentWeight > 10) intensity = "Low (Fragmented/Background)";
                 else if (currentWeight > 0) intensity = "Minimal";
                 scheduleSummary += `- ${range}: Weight ${Math.round(currentWeight)} (${intensity})\n`;
                 currentBlockStart = i;
                 currentWeight = w;
              }
          }
          const weekendNote = timeProfile.weekend_active ? "[WEEKEND STRATEGY]: Active Mode" : "[WEEKEND STRATEGY]: Resting Mode";
          scheduleSummary += `\n${weekendNote}\n`;
      }
      const prompt = buildArchitectPrompt(skeleton.role, skeleton.age, skeleton.income, shadowDesc, chaos, dna, skeleton.gender, scheduleSummary);
      const response = await ai.models.generateContent({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: ARCHITECT_INSTRUCTION }, { text: prompt }] }
          ],
          config: { temperature: 0.9 }
      });
      const csvText = cleanJsonString(response.text || "");
      if (!csvText || csvText.length < 50) throw new Error("Synthetic data generation failed: Output too short.");
      if (!csvText.includes('timestamp')) return `timestamp,action,category,subject,value,content_body\n${csvText}`;
      return csvText;
    }, 2, 3000, "Persona Synthesis");
  }

  public static async analyzeAndCreate(
    rawData: string, 
    contextOptions?: { 
        dataSource?: string; 
        scenario?: string; 
        totalRows?: number;
        creationConfig?: OriginProfile;
    },
    onProgress?: (stage: string) => void
  ): Promise<DigitalTwinPersona> {
    const ai = LLMGateway.getClient();
    const model = "gemini-3-flash-preview";
    if (onProgress) onProgress("解析數據結構中 (Schema Inference)...");
    let inferredSchema = null;
    if (contextOptions?.dataSource !== 'synthetic_lab') {
        try { inferredSchema = await this.inferCsvSchema(rawData); await delay(1000); } catch (e) { console.warn("Schema inference skipped."); }
    }
    if (onProgress) onProgress("智慧資料蒸餾中 (Adaptive Distillation)...");
    const { fullContext: distilledData, stats: datasetStats, standardRows } = smartDistillCsv(rawData, inferredSchema);
    console.log(">> Distillation Stats:", datasetStats);
    const basePrompt = buildAnalystBasePrompt(distilledData, contextOptions);
    try {
      if (onProgress) onProgress("全知觀察者解析中 (Layer 1: Fact Extraction)...");
      let analystReport: any = await retryWithBackoff(async () => {
          const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: OMNISCIENT_ANALYST_INSTRUCTION }, { text: basePrompt }] }],
            config: { responseMimeType: 'application/json', temperature: 0.2 }
          });
          return trySafeJsonParse<any>(cleanJsonString(response.text || "{}"));
      }, 3, 3000, "Omniscient Analyst");
      analystReport.metrics = { total_interactions: datasetStats.totalRows, active_days_count: datasetStats.activeDays, avg_intensity_score: datasetStats.avgIntensity };
      console.log(">> Layer 1 Report:", analystReport);
      await delay(1500);
      const hourlyCounts = datasetStats.hourlyDistribution; 
      const timePredictions = openDataService.predictProfessionFromTime(hourlyCounts);
      const topTimeMatch = timePredictions[0];
      let timeEvidence = "";
      if (topTimeMatch) {
          const activeHours = hourlyCounts.map((count, hour) => ({ hour, count })).filter(h => h.count > 0).sort((a, b) => b.count - a.count).slice(0, 10).map(h => h.hour).sort((a,b)=>a-b);
          timeEvidence = `[OPEN DATA TIME FINGERPRINT] - Observed Peak Hours: ${activeHours.join(', ')} - Statistical Match: ${topTimeMatch.match.label} - INSTRUCTION: Consider this routine.`;
      }
      const isSynthetic = contextOptions?.creationConfig?.source_type === 'synthetic';
      const explicitGender = contextOptions?.creationConfig?.skeleton?.gender;
      const inputDna = contextOptions?.creationConfig?.dna; 
      let knownContext = "";
      if (isSynthetic && explicitGender && explicitGender !== 'General') knownContext += `[BIOLOGICAL FACT] The user IS biologically ${explicitGender}. Treat this as a hard constraint.\n`;
      if (inputDna && inputDna._generated_resonance) {
          const r = inputDna._generated_resonance;
          knownContext += `[KNOWN PSYCHOLOGICAL FIXATION (PRI)] Obsession with "${r.product_name}". Pain Point: ${r.pain_point}. Hook: ${r.marketing_hook}.`;
      }
      let maxTx = 0, totalTx = 0, txCount = 0;
      if (standardRows) {
          for (const r of standardRows) {
              if (r.action_type === 'purchase' || r.action_type === 'checkout') {
                  const val = r.value || 0;
                  totalTx += val;
                  txCount++;
                  if (val > maxTx) maxTx = val;
              }
          }
      }
      const observedEvidence: ObservedEvidence = { maxTransaction: maxTx, totalSpending: totalTx, avgSpending: txCount > 0 ? totalTx / txCount : 0, spendingFrequency: txCount, isCryptoOrGambling: false };
      const evidenceBlock = `[HARD EVIDENCE FROM DATA] - Max Single Transaction: $${maxTx} - Total Observed Spending: $${totalTx} - Purchase Count: ${txCount} **INSTRUCTION**: Validate "Income Status". ${timeEvidence}`;
      if (onProgress) onProgress("心理學家建模中 (Layer 2: Profiling)...");
      let psychProfile = await retryWithBackoff(async () => {
          const response = await ai.models.generateContent({
              model: model,
              contents: [
                { role: 'user', parts: [{ text: PSYCHOLOGIST_INSTRUCTION }, { text: `${knownContext}\n\nOBJECTIVE FACTS: ${JSON.stringify(analystReport)}\n\n${evidenceBlock}` }] }
              ],
              config: { responseMimeType: 'application/json', temperature: 0.8 }
          });
          return trySafeJsonParse<any>(cleanJsonString(response.text || "{}"));
      }, 3, 3000, "Psychologist Agent");
      if (!psychProfile.personality_profile) psychProfile = { demographics_inference: { age_bucket: "25-34" }, personality_profile: { dimensions: {} }, motivations: { primary_goals: [] }, constraints: { money: {} } };
      const inferredAge = psychProfile.demographics_inference?.age_bucket || "30-34";
      const inferredRole = psychProfile.demographics_inference?.life_stage || "User";
      const inferredIncome = psychProfile.constraints?.money?.spending_power_level || "Medium";
      const overrides = inputDna?._context_settings;
      const { narrative: socioNarrative, realityCheck } = getSocioEconomicContext(inferredAge, inferredRole, inferredIncome, observedEvidence, overrides);
      console.log(">> Sociology Reality Check:", realityCheck);
      console.log(">> Layer 2 Profile:", psychProfile);
      await delay(1500);
      const slimFacts = { categories: (analystReport.category_distribution || []).slice(0, 5), time: analystReport.time_pattern, topics: (analystReport.topics_breakdown || []).slice(0, 5), metrics: analystReport.metrics };
      if (onProgress) onProgress("數位分身演繹中 (Layer 3: Actor Simulation)...");
      let actorProfile = await retryWithBackoff(async () => {
          const response = await ai.models.generateContent({
              model: model,
              contents: [
                { role: 'user', parts: [{ text: ACTOR_INSTRUCTION }, { text: `PSYCH PROFILE: ${JSON.stringify(psychProfile)}\nCONTEXT FACTS: ${JSON.stringify(slimFacts)}\nSOCIOLOGY CONTEXT: ${socioNarrative}` }] }
              ],
              config: { responseMimeType: 'application/json', temperature: 1.1 }
          });
          return trySafeJsonParse<any>(cleanJsonString(response.text || "{}"));
      }, 3, 3000, "Actor Agent");
      if (!actorProfile.interaction_style) actorProfile = { interaction_style: { tone_preference: ["Natural"] }, system_state: { composite_flaw: { label: "None" } }, context_profile_enrichment: {} };
      if (onProgress) onProgress("系統組裝中 (Final Assembly)...");
      const finalDNA: PersonaDNA = {
          role: inferredRole,
          lifestyle: psychProfile.personality_profile.summary_tags || [],
          anxiety: psychProfile.contradictions_and_insights?.paradox_core || "General Anxiety",
          spending_habit: psychProfile.constraints?.money?.evidence || "Normal",
          hidden_trait: "Generated from Analysis",
          visual_guide: inputDna?.visual_guide,
          mece_tags: inputDna?.mece_tags || psychProfile.personality_profile?.mece_tags,
          _context_settings: overrides,
          reality_check: { ...realityCheck, social_tension: realityCheck.social_tension } as any
      };
      if (inputDna?._generated_resonance) finalDNA._generated_resonance = inputDna._generated_resonance;
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `twin_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      let finalContextProfile = {
          ...(actorProfile.context_profile_enrichment || {}),
          life_stage: psychProfile.demographics_inference?.life_stage || "未知階段",
          age_bucket: psychProfile.demographics_inference?.age_bucket || "未知年齡",
          gender_guess: psychProfile.demographics_inference?.gender_guess || "Neutral",
          marketing_archetype: psychProfile.marketing_archetype || {},
          custom_dimensions: analystReport.dynamic_attributes || {},
          location_level: actorProfile.context_profile_enrichment?.location_level || psychProfile.context_profile?.location_level || "未知地點"
      };
      let finalConstraints = psychProfile.constraints || {};
      if (overrides) {
          if (overrides.geo_id && GEO_ECONOMICS[overrides.geo_id]) finalContextProfile.location_level = GEO_ECONOMICS[overrides.geo_id].label;
          if (overrides.household_id && HOUSEHOLD_STRUCTURES[overrides.household_id]) {
              const hLabel = HOUSEHOLD_STRUCTURES[overrides.household_id].label;
              if (!finalContextProfile.life_stage.includes(hLabel)) finalContextProfile.life_stage = `${finalContextProfile.life_stage} | ${hLabel}`;
          }
          if (inputDna?._sociology_pack?.money_rules) {
              const rules = inputDna._sociology_pack.money_rules;
              const match = rules.match(/True FCF: (\w+)/);
              if (match) {
                  const fcf = match[1];
                  let level = "Medium";
                  if (fcf === 'Survival' || fcf === 'Tight') level = "Low (Survival)";
                  else if (fcf === 'Affluent' || fcf === 'Elite') level = "High (Affluent)";
                  if (!finalConstraints.money) finalConstraints.money = {};
                  finalConstraints.money.spending_power_level = level;
                  finalConstraints.money.evidence = `[System Locked] True FCF: ${fcf}`;
              }
          }
      }
      const compositeData = {
        twin_id: uniqueId,
        source_user_ids: [],
        data_window: { start_date: datasetStats.dataWindow.start, end_date: datasetStats.dataWindow.end },
        perception_sheet: datasetStats.perceptionSheet,
        origin_profile: { ...contextOptions?.creationConfig, source_type: contextOptions?.creationConfig?.source_type || 'upload', dna: contextOptions?.creationConfig?.dna || finalDNA },
        behavioral_pattern: {
          frequency: { visits_per_month: datasetStats.totalRows, active_days_ratio: datasetStats.activeDays },
          depth: { avg_pages_per_session: parseFloat((datasetStats.avgIntensity / 10).toFixed(1)) },
          content_preference: { top_categories: analystReport.category_distribution || [], top_lda_topics: analystReport.topics_breakdown || [] },
          time_pattern: analystReport.time_pattern || {}
        },
        personality_profile: { ...(psychProfile.personality_profile || {}), mece_tags: inputDna?.mece_tags || psychProfile.personality_profile?.mece_tags },
        motivations: psychProfile.motivations || {},
        constraints: finalConstraints,
        contradictions_and_insights: psychProfile.contradictions_and_insights || {},
        interaction_style: actorProfile.interaction_style || {},
        system_state: actorProfile.system_state || {},
        context_profile: finalContextProfile
      };
      console.log(">> COMPOSITE DATA:", compositeData);
      const normalizedData = sanitizeAndNormalizePersona(compositeData);
      const result = DigitalTwinPersonaSchema.safeParse(normalizedData);
      if (!result.success) { console.warn("Schema Validation Failed:", result.error); return normalizedData as DigitalTwinPersona; }
      return result.data as DigitalTwinPersona;
    } catch (error: any) {
      console.error("Pipeline Error:", error);
      throw error;
    }
  }

  public static createChatSession(persona: DigitalTwinPersona): Chat {
    const ai = LLMGateway.getClient();
    const model = "gemini-3-flash-preview";
    const systemInstruction = buildChatSystemInstruction(persona);
    return ai.chats.create({ model: model, config: { systemInstruction: systemInstruction, temperature: 1 } });
  }

  public static async *sendMessageStream(message: string, chat: Chat, modifiers: SimulationModifiers | null, scenario: ScenarioMode): AsyncGenerator<string, void, unknown> {
    const effectiveMessage = buildChatContextHeaders(message, modifiers, scenario);
    const result = await chat.sendMessageStream({ message: effectiveMessage });
    for await (const chunk of result) { const text = chunk.text; if (text) yield text; }
  }

  public static async generateAvatar(persona: DigitalTwinPersona): Promise<string | null> {
    return retryWithBackoff(async () => {
      const ai = LLMGateway.getClient();
      const model = "gemini-2.5-flash-image"; 
      const { age_bucket, gender_guess } = persona.context_profile;
      const role = persona.origin_profile?.skeleton?.role || "User";
      const visualGuide = persona.origin_profile?.dna?.visual_guide;
      const visuals = analyzeAvatarVisuals(persona);
      const prompt = AVATAR_GENERATION_PROMPT_TEMPLATE(age_bucket, gender_guess || "Neutral", role, visuals.fashion, visuals.accessories, visuals.expression, visuals.lighting, visuals.bg_color, visuals.color_palette, visualGuide);
      const response = await ai.models.generateContent({ model: model, contents: { parts: [{ text: prompt }] } });
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                  const mimeType = part.inlineData.mimeType || 'image/png';
                  return `data:${mimeType};base64,${part.inlineData.data}`;
              }
          }
      }
      return null;
    }, 1, 5000, "Avatar Generation");
  }
}
