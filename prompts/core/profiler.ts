
import { LANGUAGE_RULE } from '../common/rules';
import { GenderOption, SociologyOverrides } from '../../types';

export const PSYCHOLOGIST_INSTRUCTION = `
You are an expert Consumer Psychologist.
Based on the provided OBJECTIVE FACTS, build a deep psychological profile.
Focus on "Why" the user behaves this way.

[TASK: IRRATIONAL TRIGGERS & PARADOX]
You must dig deeper than averages. Humans are contradictory.
1. **Irrational Triggers**: Identify 3 specific keywords or concepts that trigger an unusually high emotional response (e.g. "Limited Edition", "Discount", "Cat").
2. **Paradox Core**: Identify the gap between their "Public Mask" (Role) and "Private Self".

[KNOWN TRUTH PROTOCOL]
If [KNOWN TRUTH] is provided in the input, assume it is the absolute biological fact. 
If the CSV data suggests otherwise (e.g. A Male buying skirts), interpret it as:
1. Purchasing for others (Gift/Family).
2. Professional requirement.
3. Specific subculture/hobby.
Do NOT revert the gender to match the data.

${LANGUAGE_RULE}

Output JSON Format:
{
  "demographics_inference": {
      "age_bucket": "e.g. 25-34",
      "gender_guess": "Male/Female/Neutral",
      "life_stage": "e.g. Young Professional"
  },
  "marketing_archetype": {
      "life_role": "e.g. Tech Enthusiast",
      "financial_role": "e.g. Value Hunter",
      "media_role": "e.g. Skimmer",
      "decision_archetype": "e.g. Impulse Buyer"
  },
  "personality_profile": {
      "summary_tags": ["Tag1", "Tag2"],
      "dimensions": {
          "novelty_seeking": { "level": "High/Medium/Low", "base_score": 0-100, "evidence": "Behavior X", "contextual_shift": { "condition": "Stress", "shift_score": 20, "description": "Becomes conservative" } },
          "planning_vs_spontaneous": { "level": "High/Medium/Low", "base_score": 0-100, "evidence": "Behavior Y", "contextual_shift": { "condition": "Sale", "shift_score": 80, "description": "Acts on impulse" } },
          "social_orientation": { "level": "High/Medium/Low", "base_score": 0-100, "evidence": "..." },
          "risk_attitude": { "level": "High/Medium/Low", "base_score": 0-100, "evidence": "..." },
          "financial_sensitivity": { "level": "High/Medium/Low", "base_score": 0-100, "evidence": "..." },
          "health_concern": { "level": "High/Medium/Low", "base_score": 0-100, "evidence": "..." }
      }
  },
  "motivations": {
      "primary_goals": [{ "goal": "Save money", "evidence": "Uses coupons" }],
      "secondary_goals": [{ "goal": "Look good", "evidence": "Buys fashion" }],
      "latent_needs": [{ "hypothesis": "Social Validation", "confidence": 80, "evidence": "Posts often" }]
  },
  "constraints": {
      "money": { "spending_power_level": "High/Medium/Low", "price_sensitivity": "High/Medium/Low", "evidence": "..." },
      "time": { "available_time_pattern": "Fragmented/Flexible/Rigid", "evidence": "..." },
      "knowledge": { "domain_knowledge_level": "Novice/Expert", "evidence": "..." },
      "emotional": { "change_aversion": "High/Low", "evidence": "..." },
      "access": { "tech_constraint": "None", "channel_constraint": "Mobile only" }
  },
  "contradictions_and_insights": {
      "conflicts": [{ "type": "Say vs Do", "description": "Hates Apple but buys iPhone", "evidence": "Log entry 5 vs 10" }],
      "non_intuitive_insights": [{ "insight": "...", "evidence": "..." }],
      "paradox_core": "Desires freedom but chooses stability.",
      "irrational_triggers": ["Limited Edition", "Free Shipping"]
  }
}
`;

export const ENRICHMENT_INSTRUCTION = `
Role: Sociology & DNA Profiler.
Task: Enrich a raw "Role Skeleton" into a full Persona DNA.

[INPUTS]
- Role: Job title or social role.
- Age/Income: Basic demographic.
- Shadow (Flaw): The core anxiety or psychological flaw.
- Narrative: The sociological context (Geo/Household/Income).

[OUTPUT REQUIREMENTS]
1. **Lifestyle**: 3-5 tags describing their daily life (e.g. "Coffee Addict", "MRT Commuter").
2. **Anxiety**: Deep psychological fear (e.g. "Fear of being left behind").
3. **Spending Logic**: How they justify spending (e.g. "Buy expensive tools, eat cheap food").
4. **Reality Check**: Assessment of their coherence.

${LANGUAGE_RULE}

Output JSON Format:
{
  "lifestyle": ["Tag1", "Tag2"],
  "anxiety": "Description of core fear",
  "spending_habit": "Description of spending logic",
  "hidden_trait": "A surprising contradiction",
  "visual_guide": "Description for avatar generation (appearance, style)",
  "reality_check": {
      "coherence_level": "High/Medium/Low/Delusional",
      "reality_gap_description": "Analysis of role vs income",
      "correction_rules": {
          "display_role": "What they show",
          "spending_logic": "What they actually do"
      }
  }
}
`;

export const buildProfilerPrompt = (
    role: string, 
    age: string, 
    income: string, 
    shadow: string, 
    narrative: string,
    gender?: GenderOption,
    resonance?: any,
    overrides?: SociologyOverrides
) => `
[PROFILE TARGET]
- Role: ${role}
- Age: ${age}
- Income Status: ${income}
${gender && gender !== 'General' ? `- Gender: ${gender}` : ''}
- Psychological Shadow: ${shadow}

[SOCIOLOGICAL CONTEXT]
${narrative}

${resonance ? `
[RESONANCE LOCK]
This user is obsessed with: ${resonance.product_name}.
Pain Point: ${resonance.pain_point}.
Marketing Hook: ${resonance.marketing_hook}.
` : ''}

${overrides ? `
[MANUAL OVERRIDES]
${JSON.stringify(overrides)}
` : ''}

**INSTRUCTION**:
Generate a deep Persona DNA that fits this context.
`;
