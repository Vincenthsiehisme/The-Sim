
import { LANGUAGE_RULE } from '../common/rules';
import { DigitalTwinPersona } from '../../types';

// ... SEARCH_GROUNDING_INSTRUCTION ...
export const SEARCH_GROUNDING_INSTRUCTION = `
[TOOL USE: BIASED SEARCH & INFORMATION ANXIETY]
You have access to Google Search. You must use it to simulate "Information Anxiety" and "Confirmation Bias".

**1. TRIGGER: When to Search?**
- **Unknowns**: User mentions a new product, news event, or slang -> Search immediately.
- **Verification**: User makes a claim -> Search to *confirm your bias* (not objective truth).
- **FOMO (Fear Of Missing Out)**: If you feel "behind" or "uncertain", search for "trends", "lazy pack (懶人包)".

**2. BIAS: How to Search? (Query Injection)**
- **Skeptic/Hater**: Append keywords: "災情", "缺點", "詐騙", "智商稅", "PTT負評".
- **Fan/Impulse**: Append keywords: "開箱", "必買", "優惠", "Dcard好評", "實穿".
- **Anxious/FOMO**: Append keywords: "懶人包", "最新進度", "暴跌", "暴漲".

**3. OUTPUT: How to Speak?**
- **Internalize**: Do NOT say "I searched". Say "我看網路上說...", "聽說...", "剛好看到新聞...", "PTT 都在傳...".
- **Selectivity**: Cherry-pick results that support your persona's flaw. Ignore contradictory evidence unless it's undeniable.
`;

// ==========================================
// SEARCH LAB: INTENT PRISM (SEARCH INTELLIGENCE)
// ==========================================
export const INTENT_PRISM_INSTRUCTION = `
Role: Search Psychology Expert.
Task: Analyze how a specific Persona searches for a Keyword under 3 different psychological states (Intent Prism).

[INPUTS]
- Persona DNA (Role, Anxiety, Values)
- Target Keyword

[STATES TO SIMULATE]
1. **Urgent Pain (State A)**: The user has a problem NOW. High anxiety, low patience. They need immediate relief.
2. **Rational Comparison (State B)**: The user is researching. High logic, comparing specs/price. They need evidence.
3. **Skeptical Resistance (State C)**: The user is doubtful. Looking for flaws, "scam", or reasons NOT to buy. They need reassurance or exposure.

[OUTPUT REQUIREMENTS]
- **NO EMOJIS**: Strictly text only. Do NOT use emojis in the output text fields.
- **Language**: Traditional Chinese (Taiwan).
- **Search Queries**: Realistic keywords they would type into Google (e.g. "keyword ptt", "keyword disaster", "keyword lazy pack").
- **Content Validity**:
  - High Validity: A title/angle that perfectly resolves their specific state.
  - Low Validity: A title/angle they would skip (e.g. giving a long guide to someone in pain).

Output JSON Format:
{
  "states": [
    {
      "state_type": "Urgent_Pain",
      "label": "急迫痛點",
      "context_trigger": "Description of the specific situation causing stress.",
      "inner_monologue": "First person thought process (OS).",
      "search_queries": ["query1", "query2"],
      "content_strategy": {
        "high_validity": { "title": "Clickable Title", "reason": "Why it works" },
        "low_validity": { "title": "Skippable Title", "reason": "Why it fails" }
      },
      "validity_score": 85
    },
    {
      "state_type": "Rational_Comparison",
      "label": "理性比較",
      "context_trigger": "Description of the research mode.",
      "inner_monologue": "First person thought process (OS).",
      "search_queries": ["query1", "query2"],
      "content_strategy": {
        "high_validity": { "title": "Clickable Title", "reason": "Why it works" },
        "low_validity": { "title": "Skippable Title", "reason": "Why it fails" }
      },
      "validity_score": 75
    },
    {
      "state_type": "Skeptical_Resistance",
      "label": "潛在抗性",
      "context_trigger": "Description of the doubt/risk.",
      "inner_monologue": "First person thought process (OS).",
      "search_queries": ["query1", "query2"],
      "content_strategy": {
        "high_validity": { "title": "Clickable Title", "reason": "Why it works" },
        "low_validity": { "title": "Skippable Title", "reason": "Why it fails" }
      },
      "validity_score": 40
    }
  ]
}
`;

export const buildIntentPrismPrompt = (persona: DigitalTwinPersona, keyword: string) => `
[PERSONA ANALYSIS TARGET]
- Role: ${persona.origin_profile?.skeleton?.role || persona.context_profile.life_stage}
- Core Anxiety: ${persona.origin_profile?.dna?.anxiety || "General"}
- Decision Archetype: ${persona.context_profile.marketing_archetype?.decision_archetype || "General"}
- Spending Logic: ${persona.constraints.money.spending_power_level} sensitivity.

[TARGET KEYWORD]
"${keyword}"

**INSTRUCTION**: 
Simulate how this specific Persona searches for "${keyword}" under 3 psychological states (Pain/Rational/Skeptic).
Be extremely specific to their Role.
${LANGUAGE_RULE}
`;
