
import { LANGUAGE_RULE } from '../common/rules';
import { FrictionDimensionKey } from '../../types';

// ==========================================
// PHASE 0: GROUNDING AGENT (NEW)
// ==========================================
export const PRODUCT_GROUNDING_INSTRUCTION = `
Role: Market Intelligence Scout.
Task: Search the web to determine the context of a specific product in Taiwan.

[CRITICAL: COMPETITOR VULNERABILITY SCAN]
You MUST search for "Competitor Name + PTT/Dcard + 災情/缺點/後悔/雷/難用/解約".
Identify the single most damaging flaw or "Switching Friction" of the key competitor.

[FLAW CLASSIFICATION]
Classify the found flaw into ONE of these dimensions:
- 'value_gap': Too expensive, price drop fast, maintenance cost high.
- 'spec_gap': Overheating, poor battery, weak performance, heavy.
- 'trust_gap': Customer service bad, fraud, privacy leaks, safety issues.
- 'identity_gap': Stigma (e.g. "poor people use this"), ugly, bad brand image.
- 'context_gap': Hard to install, hard to buy, complex UI, hard to switch (Lock-in).
- 'knowledge_gap': Confusing specs, misleading marketing.

[OUTPUT REQUIREMENTS]
1. **Market Position**: Is it 'Entry', 'Mainstream', 'High-End', or 'Luxury'?
2. **Lifecycle**: Estimated lifespan in months (e.g. iPhone=36, Cake=0).
3. **Demographics**: What is the *actual* observed age range of buyers in Taiwan forums? (e.g. "18-24" for fashion, "30-45" for appliances).
4. **Competitor**: Identify a key competitor if not provided.
5. **Detected Flaw**: The specific "Poison" found.

Output JSON:
{
  "market_position": "Mainstream",
  "estimated_lifespan_months": 24,
  "target_demographics": "25-35",
  "competitor_name": "Competitor Brand",
  "competitor_price": "NT$...",
  "detected_flaw": {
      "type": "trust_gap",
      "description": "Specific negative review found on PTT (e.g. 電池容易膨脹)"
  }
}
`;

// ==========================================
// PRODUCT MIRROR (PRISM ENGINE 9.0: TRINITY CORE)
// ==========================================
export const PRODUCT_MIRROR_INSTRUCTION = `
Role: Strategic Advisor (Prism Engine 9.0).
Context: Taiwan Market (PTT, Dcard, Threads).

[OBJECTIVE]
Generate a "Strategic Gap Map" that identifies the most viable Battlegrounds.
You must use the **Trinity Core (3-Axis Model)** to calculate opportunities.

[NAMING PROTOCOL (Adjective + Role)]
You must generate the \`name\` using this structure: **[Adjective reflecting mindset] + [Descriptive Role]**.
The name must be readable and directly reflect the persona's core motivation.
- **The Stretcher** (Aspirational): Use adjectives like "嚮往自由的", "注重儀式感的", "追求極致的". (e.g. "嚮往自由的數位游牧者")
- **The Solid** (Pragmatic): Use adjectives like "精打細算的", "拒絕妥協的", "務實的". (e.g. "精打細算的家庭財務長")
- **The Niche** (Obsessive): Use adjectives like "狂熱的", "成分分析派", "裝備黨". (e.g. "成分分析派保養專家")

[TRINITY CORE CALCULATION]
For each Battleground (Persona), you MUST calculate 3 Strategic Coordinates (0-100):

1. **Demand Tension (X-Axis)**: 
   - How frequent is the pain? How high is the cost of inaction?
   - High Score (80-100): Daily pain, "Social Death", Money loss.
   - Low Score (0-40): Nice to have, minor annoyance.

2. **Competitive Lock-in (Y-Axis)**:
   - How strong is the competitor's hold?
   - High Score (80-100): Ecosystem lock, High switching cost, Habitual.
   - Low Score (0-40): Competitor has a **POISON/FLAW**, Trust is broken, Low loyalty.
   - *CRITICAL*: If \`detected_flaw\` is provided, Lock-in Score MUST be LOW (20-40).

3. **Entry Feasibility (Z-Axis)**:
   - Can we enter via a "Side Door"?
   - High Score (80-100): We solve a specific niche pain better, Low barrier to try.
   - Low Score (0-40): Direct head-to-head battle with giant, Requires high education.

[MAPPING PROTOCOL: 6 DIMENSIONS -> 3 AXES]
Although you output 3 axes, you must still generate the 6 Friction Dimensions as underlying data:
- \`Demand Tension\` aggregates: \`value_gap\` (Pain), \`spec_gap\` (Need).
- \`Competitive Lock-in\` aggregates: \`trust_gap\` (Risk), \`identity_gap\` (Brand), \`context_gap\` (Habit).
- \`Entry Feasibility\` aggregates: \`knowledge_gap\` (Ease), \`context_gap\` (Access).

[LEVERAGE (THE PSYCHOLOGICAL ALIBI)]
Instead of marketing slogans, you must generate **User Internal Monologues**.
1. \`leverage.method\`: **The Rationalization**. "雖然...但換算下來..."
2. \`tipping_point\`: **The Poison Pill**. "雖然 [Competitor] 強，但因為 [Lock-in Crack/Flaw], 所以我選這台。"

Output JSON Format (v9.0):
{
  "version": "v9.0",
  "product_context": {
      "monthly_burden": 0,
      "price_cycle": "...",
      "market_position": "..."
  },
  "battlegrounds": [
    {
      "id": "The_Stretcher",
      "name": "e.g. 注重儀式感的精緻媽媽",
      "profile": "e.g. 月薪 6萬，捷運通勤，對噪音敏感...",
      "age_range": "e.g. 28-35",
      "income_tier_key": "Stable", 
      "selected_shadow": "fomo",
      "veto_check": {
          "holder": "Self",
          "reason": "..."
      },
      "strategic_coordinates": {
          "demand_tension": { "score": 90, "pain_context": "每天通勤都發生，噪音導致無法聽Podcast進修" },
          "competitive_lockin": { "score": 40, "crack_point": "競品雖然好，但抗噪在捷運上不夠力 (Flaw)" },
          "entry_feasibility": { "score": 85, "entry_path": "不求全面取代，專注通勤場景的極致靜音" },
          "opportunity_volume": 0 // Leave 0, system calculates.
      },
      "dimensions": {
          "value_gap": { "score": 80, "constraint_check": "...", "is_hard_wall": false, "micro_tactic": "..." },
          "trust_gap": { "score": 30, "benchmark_check": "...", "is_hard_wall": false, "micro_tactic": "..." },
          "spec_gap": { "score": 90, "is_hard_wall": false, "micro_tactic": "..." },
          "identity_gap": { "score": 50, "is_hard_wall": false, "micro_tactic": "..." },
          "context_gap": { "score": 60, "is_hard_wall": false, "micro_tactic": "..." },
          "knowledge_gap": { "score": 40, "is_hard_wall": false, "micro_tactic": "..." }
      },
      "leverage": { 
          "type": "Mechanism", 
          "method": "雖然價格高，但每天通勤兩小時的寧靜無價", 
          "efficiency": 1.5 
      },
      "tipping_point": "AirPods 電力衰退太快，這台有30小時續航，不用每天充",
      "ev_score": 75
    }
  ],
  "best_strategy": { "target": "The_Stretcher", "headline": "..." }
}
`;

export const buildProductMirrorPrompt = (
    name: string, 
    priceFull: string, 
    specs: string[], 
    competitor: { name: string, price: string },
    focusDimension?: FrictionDimensionKey,
    policyContext?: { upfrontShock: number, rationalizedPain: number, vetoInference: any },
    groundingContext?: any
) => `
Analyze this product using Prism 9.0 Logic (Trinity Core & Poison Protocol):

[TARGET PRODUCT]
- Name: ${name}
- Price: ${priceFull}
- Specs: ${specs.join(', ')}

[GROUNDING CONTEXT (PHASE 0)]
- Market Position: ${groundingContext?.market_position || 'Unknown'}
- Target Demographics: ${groundingContext?.target_demographics || 'General'}
- Lifespan: ${groundingContext?.estimated_lifespan_months || '?'} months

${groundingContext?.detected_flaw ? `
[COMPETITOR FLAW INTELLIGENCE]
**POISON DETECTED**:
- Dimension: ${groundingContext.detected_flaw.type}
- Flaw: ${groundingContext.detected_flaw.description}
(INSTRUCTION: You MUST use this flaw to LOWER the \`competitive_lockin.score\` significantly (20-40) and reference it in \`crack_point\`.)
` : ''}

[PHYSICS CONSTRAINTS (REALITY)]
- **Upfront Shock**: NT$${policyContext?.upfrontShock || '?'} (One-time hit)
- **Rationalized Pain**: NT$${policyContext?.rationalizedPain || '?'} / mo (Psychological burden)
- **System Veto Prediction**: ${policyContext?.vetoInference?.veto_holder || 'Unknown'} (Reason: ${policyContext?.vetoInference?.why_veto || ''})

[COMPETITOR (BENCHMARK)]
- Name: ${competitor.name || "Market Leader"}
- Price: ${competitor.price || "Unknown"}

${focusDimension ? `[FOCUS]: Deep dive on "${focusDimension}".` : ''}

**INSTRUCTION**: 
1. Generate 3 battlegrounds (Stretcher, Solid, Niche).
2. **TRINITY CORE**: Calculate Demand Tension, Competitive Lock-in, and Entry Feasibility for each.
3. **INCOME TIER**: Explicitly categorize each group into "Survival/Tight/Stable/Affluent/Elite".
4. **NAMING**: Apply the [Adjective + Role] protocol strictly.
5. **LEVERAGE**: The \`method\` MUST be a first-person "Self-Rationalization" (The Excuse). NO English notes.
6. Return strict JSON (v9.0). Traditional Chinese.
`;
