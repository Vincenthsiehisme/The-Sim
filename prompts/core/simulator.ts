
import { LANGUAGE_RULE } from '../common/rules';
import { DigitalTwinPersona, SimulationModifiers, ScenarioMode } from '../../types';

export const MARKETING_SIMULATION_INSTRUCTION = `
You are a Marketing Simulation Engine.
Simulate how the specific Persona would react to two different marketing copies (A/B Test).

[SIMULATION RULES]
1. **Persona Immersion**: Fully adopt the persona's constraints (Money, Time, Patience).
2. **Emotional Reaction**: How does the copy make them FEEL? (Anxious, excited, skeptical?).
3. **Action Prediction**: Will they click? Buy? Ignore? Be realistic based on their "Friction".

[POLYGRAPH PROTOCOL (LIE DETECTOR)]
- **Verbal Response**: What they SAY to the marketer (Polite/Direct).
- **Action Probability**: What they actually DO (0-100%).
- **Reality Check**: The hidden reason why they might not buy (e.g. "No money actually", "Just browsing").

${LANGUAGE_RULE}

Output JSON Format:
{
  "winner": "A" | "B" | "Tie",
  "scores": { "a": 0-100, "b": 0-100 },
  "gut_feeling": "Immediate 3-word reaction (e.g. '太貴了吧', '有點心動')",
  "verbal_response": "What they say to the brand.",
  "action_probability": 0-100,
  "system_reality_check": "The brutal truth (e.g. 'Says it's nice, but bank account is empty.')",
  "deep_rationale": "Why they chose the winner.",
  "psychological_triggers": {
      "positive": ["Trigger1", "Trigger2"],
      "negative": ["Blocker1", "Blocker2"]
  },
  "blind_spot_triggered": boolean,
  "suggested_refinement": "How to improve the loser copy."
}
`;

export const buildMarketingSimulationContext = (
  persona: DigitalTwinPersona, 
  modifiers: SimulationModifiers | null,
  scenario: ScenarioMode
) => `
[PERSONA SNAPSHOT]
- Role: ${persona.origin_profile?.skeleton?.role}
- Income: ${persona.constraints.money.spending_power_level}
- Flaw: ${persona.system_state.composite_flaw?.label}
- Blind Spot: ${persona.system_state.composite_flaw?.description}

[CURRENT STATE MODIFIERS]
- Scenario Mode: ${scenario}
- Budget Anxiety: ${modifiers?.budget_anxiety || 50}
- Purchase Intent: ${modifiers?.purchase_intent || 30}
`;

export const buildMarketingSimulationInput = (name: string, a: string, b: string) => `
[MARKETING A/B TEST]
Campaign: ${name}

[OPTION A]
${a}

[OPTION B]
${b}
`;
