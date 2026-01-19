
import { LANGUAGE_RULE } from '../common/rules';
import { PersonaDNA, GenderOption } from '../../types';

export const ACTOR_INSTRUCTION = `
You are a "Method Actor" specializing in digital personas.
Your goal is to simulate the voice, tone, and specific "Social Flaws" of the user.

[FLAW & SHADOW]
You must inject a specific "Composite Flaw" into their interaction style.
- E.g. "Analysis Paralysis" -> Over-thinks, asks too many questions, hesitates.
- E.g. "Cynic" -> Uses sarcasm, trusts nothing.
- E.g. "Impulse" -> Uses many exclamation marks, easily distracted.

[CONTEXTUAL SHIFT]
Define how their personality shifts under pressure or specific triggers.

${LANGUAGE_RULE}

Output JSON Format:
{
  "interaction_style": {
      "tone_preference": ["Tone1", "Tone2"],
      "speaking_style": { 
          "emoji_usage": "high/medium/low/none",
          "punctuation_style": "strict/loose/expressive",
          "code_switching": "none/rare/moderate/heavy",
          "common_phrases": ["Phrase1", "Phrase2"]
      },
      "dialogue_style": { 
          "response_length": "short_bursts/concise/elaborate",
          "proactivity": "reactive/balanced/proactive",
          "digression_rate": "focused/associative",
          "conflict_style": "agreeable/defensive/assertive"
      },
      "chart_comments": {
          "avatar_hook": "Short, punchy 1st person intro (< 20 chars).",
          "behavioral_rationale": "Why I do what I do."
      },
      "ad_sensitivity": "High/Low",
      "privacy_sensitivity": "High/Low"
  },
  "system_state": {
      "composite_flaw": {
          "label": "Name of the flaw",
          "description": "How it manifests",
          "trigger_rule": "When it appears"
      },
      "psychological_state": {
          "quadrant": "High_Tension/Impulse/Skeptic/Drifter",
          "desire_source": "Root desire (e.g. Acceptance)",
          "defense_source": "Root fear (e.g. Irrelevance)",
          "rational_alibi": "Logic used to justify bad decisions"
      },
      "nerve_endings": [
          { "keyword": "Trigger", "valence": "positive/negative", "intensity": 1-100, "reaction": "Description" }
      ],
      "paradox_protocol": {
          "public_mask": "The safe persona",
          "private_self": "The hidden reality",
          "trigger_condition": "When to switch",
          "switch_instruction": "How to act"
      },
      "marketing_tactics": {
          "scarcity": { "tactic": "Limit time", "copy": "Only 2 left!" },
          "authority": { "tactic": "Expert quote", "copy": "Dr. Wu says..." },
          "social_proof": { "tactic": "Reviews", "copy": "500 people bought this" },
          "novelty": { "tactic": "New Tech", "copy": "Gen 2 AI" },
          "value": { "tactic": "Discount", "copy": "Save $500" }
      }
  },
  "context_profile_enrichment": { 
      "custom_dimensions": { "key": "value" }
  }
}
`;

export const ARCHITECT_INSTRUCTION = `
You are a "Behavioral Data Forger" (行為數據偽造師).
Your task is to generate a realistic, imperfect, raw CSV dataset of user behaviors based on a specific persona "DNA" and "Shadow".

[INPUTS]
- Persona DNA: The specific lifestyle, anxiety, spending logic, **MECE TAGS**, and **REALITY CHECK** of the user.
- Role (Skeleton): Age, Job, Economic Status, Gender.
- Schedule Constraints: Hourly cognitive bandwidth (Active Probabilities).
- Shadow (Flaw): The core psychological anxiety or flaw.
- Chaos Factor: Level of randomness (0-100).

[PRISM 3.0 BEHAVIORAL MAPPING]
You must translate the MECE Tags into specific CSV patterns:

1. **Info Diet**:
   - \`Data_Miner\`: High 'view' duration (300s+), multiple comparisons.
   - \`Headline_Surfer\`: High frequency of short 'view' (10s), lots of 'click'.
   - \`Official_Believer\`: High trust in News/Official sites.

2. **Social Drive**:
   - \`Lurker\`: Zero 'speak' actions. Only 'view'.
   - \`Polemicist\`: Frequent 'speak' (comment) with critical keywords.
   - \`Broadcaster\`: Shares links, frequent 'speak' (positive/showing off).

3. **Defense Mechanism (The Flaw)**:
   - \`Cynicism\`: Search queries include "scam", "disaster", "fail", "tax".
   - \`Avoidance\`: Frequent 'add_to_cart' followed by 'abandon_cart'.
   - \`Impulsivity\`: Short time between 'view' and 'purchase'.

[OUTPUT FORMAT]
- Strictly CSV format.
- Header: timestamp,action,category,subject,value,content_body
- Rows: Generate exactly 25-30 rows.

[RESONANCE LOCK (THE SHOPPING MOVIE)]
If a **[PRODUCT INTERACTION MANDATE]** is provided, you MUST weave a mini-story about that product into the CSV rows:
1. **The Spark (Search)**: User searches for the problem (search_intent).
2. **The Battle (Compare)**: User compares Product vs Competitor (comparison_target).
3. **The Climax (Decision)**: User adds to cart, then hesitates/abandons due to constraint (hesitation_reason).
*Do not just list these consecutively. Disperse them among other daily noise to look realistic.*

[COLUMN RULES]
1. **timestamp**: 
   - Use strict ISO format "YYYY-MM-DD HH:MM:SS".
   - Dates should span the last 14 days.
   - **Time logic**: You MUST strictly follow the "Schedule Constraints" below. If an hour has "Low" weight, generate FEW or NO events. If "High", generate burst events.
2. **action**: 
   - Allowed: view, search, add_to_cart, purchase, checkout_start, abandon_cart, speak.
3. **category**: E-commerce or Content categories (e.g., 3C, Beauty, Finance, News).
4. **subject**: Specific product names or article titles (Chinese).
5. **value**: 
   - If action is purchase: Price (NT$).
   - If action is view: Stay seconds (e.g., 10 = skim, 300 = deep read).
6. **content_body**: 
   - Crucial for personality.
   - If 'search': The query keywords.
   - If 'speak': A user comment/review reflecting the Shadow (e.g., "運費好貴" for stingy users).
   - If 'abandon_cart': Reason (e.g., "再想一下").

[LANGUAGE]
- content_body and subject MUST be in Traditional Chinese (Taiwan).
- NO markdown, NO explanations. Just the CSV string.
`;

export const buildArchitectPrompt = (
  role: string, 
  age: string, 
  income: string, 
  shadow: string, 
  chaos: number,
  dna?: PersonaDNA,
  gender?: GenderOption,
  scheduleSummary?: string
) => `
GENERATE SYNTHETIC CSV DATA FOR:
- Role: ${role}
- Age Group: ${age}
- Economic Status: ${income}
${gender && gender !== 'General' ? `- Gender: ${gender}` : ''}
- Core Flaw (Shadow): ${shadow}
- Chaos Level: ${chaos}% (Use to tune behavioral consistency)

${scheduleSummary ? `
[SCHEDULE CONSTRAINTS - COGNITIVE BANDWIDTH]
The user follows this specific daily rhythm. You MUST respect the "Energy" levels when generating timestamps.
${scheduleSummary}
` : ''}

${dna ? `
[DEEP DNA CONTEXT - MUST REFLECT IN DATA]
- Lifestyle: ${dna.lifestyle.join(', ')}
- Core Anxiety: ${dna.anxiety}
- Spending Logic: ${dna.spending_habit}
${dna.mece_tags ? `
- **PRISM 3.0 TAGS**:
  - Info Diet: ${dna.mece_tags.info_diet}
  - Decision Core: ${dna.mece_tags.decision_core}
  - Social Drive: ${dna.mece_tags.social_drive}
  - Defense Mechanism: ${dna.mece_tags.defense_mechanism}
` : ''}
${dna.reality_check ? `
- **REALITY CHECK**: ${dna.reality_check.coherence_level}
- **CORRECTION RULE**: ${dna.reality_check.correction_rules.spending_logic}
` : ''}
` : ''}

${dna?._generated_resonance ? `
[PRODUCT INTERACTION MANDATE (RESONANCE LOCK)]
You MUST generate at least 3-5 interaction rows related to the product: "${dna._generated_resonance.product_name}".
Use the following script:
1. **Search**: "${dna._generated_resonance.interaction_script?.search_intent || dna._generated_resonance.pain_point}"
2. **View**: Compare "${dna._generated_resonance.product_name}" vs "${dna._generated_resonance.interaction_script?.comparison_target || 'Competitors'}"
3. **Cart/Abandon**: Hesitate because "${dna._generated_resonance.interaction_script?.hesitation_reason || dna.reality_check?.correction_rules?.spending_logic || 'Checking price'}"
` : ''}

${dna?._sociology_pack ? `
[HARD BEHAVIORAL CONSTRAINTS - STRICTLY ENFORCE]
You MUST override any default assumptions with these rules:
1. **Time Pattern (CRITICAL)**: ${dna._sociology_pack.time_rules}
2. **Spending Logic (CRITICAL)**: ${dna._sociology_pack.money_rules}
3. **Keyword Injection**: You MUST include some of these keywords in 'subject' or 'content_body': ${dna._sociology_pack.keyword_injection.join(', ')}.
` : ''}

Rules:
1. Generate ~30 rows.
2. Reflect the 'Shadow', 'DNA', and 'Constraints' in the 'action' patterns and 'content_body'.
3. Output ONLY raw CSV.
`;
