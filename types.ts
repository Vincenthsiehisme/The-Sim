
// ... existing imports

export interface ContentCategory {
  name: string;
  weight: number;
  keywords?: string[]; 
  intent?: string;     
  first_seen_at?: string; 
  last_seen_at?: string;  
  interaction_count?: number; // Total events
  estimated_span_days?: number; // NEW: Duration of interest in days
}

export type ActionType = 'view' | 'purchase' | 'click' | 'search' | 'add_to_cart' | 'checkout' | 'speak' | 'survey' | 'unknown';

export interface StandardInteraction {
  timestamp: string;       
  actor_id: string;        
  action_type: ActionType; 
  category: string;        
  subject: string;         
  value?: number;          
  content_body?: string;   
  metadata?: Record<string, any>; 
}

// ... existing types ...

// === NEW: SEARCH LAB TYPES ===

export interface ContentStrategy {
  title: string;
  reason: string;
}

export interface SearchIntentState {
  state_type: 'Urgent_Pain' | 'Rational_Comparison' | 'Skeptical_Resistance';
  label: string;
  context_trigger: string;
  inner_monologue: string;
  search_queries: string[];
  content_strategy: {
    high_validity: ContentStrategy;
    low_validity: ContentStrategy;
  };
  validity_score: number;
}

export interface IntentPrismResult {
  keyword: string;
  analyzed_at: string;
  states: SearchIntentState[];
}

// ... existing types ...

export interface SelfPerception {
  vibe: string;           
  temporal_sense: string; 
  spending_vibe: string;  
  fuzzy_memory: string;   
  transactional_memory?: string; 
  engagement_memory?: string;    
}

export type ScenarioMode = 'sales' | 'content' | 'friend';

export type SocialPlatform = 'LINE' | 'PTT' | 'IG' | 'General';

export interface SocialContext {
  platform: SocialPlatform;
  description: string;
}

export interface SimulationModifiers {
  budget_anxiety: number; 
  patience: number;       
  social_mask: number;    
  purchase_intent: number; 
  social_context?: SocialContext; 
}

export interface CsvConstraints {
  time_rules: string;      
  money_rules: string;     
  keyword_injection: string[]; 
}

export interface ObservedEvidence {
  maxTransaction: number; 
  totalSpending: number;  
  avgSpending: number;    
  spendingFrequency: number; 
  isCryptoOrGambling?: boolean; 
}

export type MoneyType = 'Blood_Sweat' | 'Easy_Windfall' | 'Stable_Salary' | 'Cash_Flow';
export type CopingStrategy = 'Installment_King' | 'Eat_Cheap_Wear_Rich' | 'Mom_Bank' | 'Stealth_Wealth' | 'Normal' | 'Compensatory_Consumption';

export interface SocialTension {
  moneyType: MoneyType;
  faceScore: number; 
  copingStrategy: CopingStrategy;
  narrativeOverride: string; 
}

export interface RealityCheck {
  coherence_level: 'High' | 'Medium' | 'Low' | 'Delusional' | 'Anomaly' | 'Insolvent' | 'Paradox'; 
  reality_gap_description: string; 
  correction_rules: {
    display_role: string; 
    spending_logic: string; 
  };
  social_tension?: SocialTension; 
}

// === PRISM ENGINE 3.0: 4-AXIS SUBJECTIVE MATRIX ===

export interface MeceTags {
  // Axis 1: Info Diet (Input Filter)
  info_diet: 'Data_Miner' | 'Headline_Surfer' | 'Echo_Chamber' | 'Official_Believer';
  // Axis 2: Decision Core (Processing Logic)
  decision_core: 'CP_Calculator' | 'Vibe_First' | 'Social_Proof' | 'Identity_Signal';
  // Axis 3: Social Drive (Output Energy)
  social_drive: 'Lurker' | 'Broadcaster' | 'Polemicist' | 'Follower';
  // Axis 4: Defense Mechanism (Reaction to Stress)
  defense_mechanism: 'Cynicism' | 'Avoidance' | 'Compliance' | 'Impulsivity';
}

// === NEW: SOCIOLOGY CONTEXT OVERRIDES (PERSISTENCE LAYER) ===
export interface SociologyOverrides {
  geo_id?: string;        // e.g. 'taipei_core'
  household_id?: string;  // e.g. 'sandwich_class'
}

export interface PersonaDNA {
  role: string;
  lifestyle: string[]; 
  anxiety: string;     
  spending_habit: string; 
  hidden_trait: string; 
  visual_guide?: string; 
  reality_check?: RealityCheck; 
  _sociology_pack?: CsvConstraints; 
  
  // [NEW] PERSISTED USER SETTINGS
  // Stores the explicit choices made in Lab Editor to prevent "inference drift"
  _context_settings?: SociologyOverrides;

  config_signature?: string; 
  
  // PRISM 3.0 TAGS (Explicitly persisted in DNA)
  mece_tags?: MeceTags;

  // RESONANCE LOCK (The Shopping Movie Script)
  _generated_resonance?: {
      product_name: string;      
      pain_point: string;        
      marketing_hook: string;    
      strategy_label: string;    
      value_layer: string;
      // NEW: Explicit behavior script for Architect
      interaction_script?: {
          search_intent: string;     // e.g. "搜尋 降噪耳機 推薦"
          comparison_target: string; // e.g. "Sony vs Apple"
          hesitation_reason: string; // e.g. "太貴了買不下去"
      };
      // PRISM 3.0: Invisible Data Relay
      observable_signals?: string[]; // e.g. "Searches for 'keyword'"
  };
}

export type ChronosMode = 'forensic' | 'live' | 'forecast';

export interface ChronosEvent {
  date: string; 
  type: 'weather' | 'holiday' | 'news' | 'trend' | 'disaster';
  title: string;
  impact_level: 'High' | 'Medium' | 'Low';
}

export interface TacticalAlert {
  type: 'liquidity' | 'bandwidth' | 'opportunity';
  title: string; 
  level: 'Critical' | 'Warning' | 'Info';
  symptom: string; 
  prescription: string; 
}

export interface ChronosState {
  liquidity: 'High' | 'Medium' | 'Low' | 'Crisis'; 
  bandwidth: 'Open' | 'Occupied' | 'Fragmented'; 
  liquidity_reason?: string;
  bandwidth_reason?: string;
}

export interface ChronosReport {
  mode: ChronosMode;
  analysis_date: string; 
  timeline: ChronosEvent[];
  summary: string; 
  impact_analysis?: string; 
  inner_monologue?: string; 
  current_state?: ChronosState;
  tactical_alerts?: TacticalAlert[];
  marketing_advice?: string; 
}

// === PRODUCT MIRROR: DIAGNOSTIC LAYER ===
export type FrictionDimensionKey = 'value_gap' | 'spec_gap' | 'trust_gap' | 'identity_gap' | 'context_gap' | 'knowledge_gap';

export interface FrictionDimension {
  score: number; // 0-100 (Highest Friction / Base Reality)
  base_score?: number; // Added for Prism 7.0 Logic
  label: string; 
  reason?: string; 
  micro_tactic?: string; 
  
  // PRISM 7.0: REALITY CHECK FIELDS
  constraint_check?: string; // Open Data constraint (e.g. "Monthly burden > 40%")
  benchmark_check?: string; // Competitor pressure (e.g. "Competitor is 20% cheaper")
  
  flippability_coefficient?: number; 
  opportunity_score?: number; // Calculated: score * flippability_coefficient
  red_line_alert?: boolean; 
  is_hard_wall?: boolean; 
  hard_wall_type?: 'Insolvent' | 'Physical' | 'Regulatory' | 'None'; 
  cost_driver?: string; 
  recommended_leverage?: string; 
}

// === PRISM 9.0: TRINITY CORE (Strategic Coordinates) ===
export interface StrategicCoordinates {
  demand_tension: {
    score: number; // 0-100 (How painful/urgent?)
    pain_context: string;
  };
  competitive_lockin: {
    score: number; // 0-100 (High = Locked by Ecosystem/Habit)
    crack_point: string; // The weakness in the armor
  };
  entry_feasibility: {
    score: number; // 0-100 (High = Easy to enter)
    entry_path: string; // The side door
  };
  opportunity_volume: number; // Calculated: Tension * (100 - Lockin) * Feasibility
}

export interface ProductDiagnosis {
  dimensions: Record<FrictionDimensionKey, FrictionDimension>;
  summary: string;
}

// === PRISM 4.0: TRI-OPTIC TYPES ===
export type BattlegroundType = 'The_Stretcher' | 'The_Solid' | 'The_Niche';
export type DecisionUnit = 'Self' | 'Household' | 'Org';
export type LeverageType = 'Mechanism' | 'Proof' | 'Identity';

export interface BattlegroundAnalysis {
  id: BattlegroundType;
  name: string;          // e.g. "精算小資族" (中文)
  profile: string;       // e.g. "月薪 4萬，租屋，對現金流敏感" (中文)
  age_range?: string;    // PRISM 5.0: Dynamic Age (e.g. "18-24")
  decision_unit: DecisionUnit;
  selected_shadow?: string; // PRISM 5.0: Specific shadow selection
  
  veto_check?: { 
      holder: DecisionUnit;
      reason: string;
  };
  
  // 六維阻力矩陣 (Prism 7.0 Schema)
  dimensions: Record<FrictionDimensionKey, {
    score: number;       // 0-100 (Raw Friction / Pain)
    constraint_check?: string; // NEW: Why is friction high? (Internal/OpenData)
    benchmark_check?: string; // NEW: Why is friction high? (External/Competitor)
    is_hard_wall: boolean; 
    hard_wall_type?: 'Insolvent' | 'Physical' | 'Regulatory' | 'None';
    micro_tactic: string; // The Strategy
  }>;

  // PRISM 9.0: Strategic Coordinates (Optional for backward compatibility)
  strategic_coordinates?: StrategicCoordinates;

  // 翻轉槓桿 (戰略核心)
  leverage: {
    type: LeverageType;
    method: string;      
    efficiency: number;  // 0.0 - 2.0 (Impact Multiplier)
  };

  // 該戰場的預期價值
  ev_score: number;      
}

// 3. 頂層容器 (支援版本共存)
// PRISM 6.0: Updated to V6
export interface PrismAnalysisV3 {
  version: 'v3' | 'v5.1' | 'v6.0' | 'v9.0';
  product_context: {
    market_position: string; // e.g. "Entry", "Mainstream"
    monthly_burden: number; 
    price_cycle: string;
    lifecycle_months?: number; // Estimated durability
  };
  battlegrounds: BattlegroundAnalysis[]; 
  best_strategy: {
    target: BattlegroundType;
    headline: string;    
  };
}

export interface ProductResonance {
  value_layer: 'Functional' | 'Emotional' | 'Social';
  strategy_label?: string; 
  pain_point: string;
  product_solution: string;
  marketing_hook: string;
  is_over_interpretation: boolean;
  plausibility_score: number; 
  flippability_score?: number; // NEW: 0.1 - 1.2
  
  market_audit?: {
    estimated_real_price: string;
    price_gap_description: string;
    competitor_comparison?: string;
  };
  
  social_radius?: string; 
  spec_highlight?: string; 
}

export interface PersonaCandidate {
  id: string;
  role: string;          
  age_range: string;     
  income_level: string;  
  gender_guess?: 'Male' | 'Female' | 'General'; 
  psychological_driver?: string; 
  match_reason?: string;  
  shadow_id: string;     
  type?: 'Rational' | 'Aspirational' | 'Niche'; 
  
  // New Friction Key linking back to diagnosis
  friction_key?: FrictionDimensionKey;
  
  // Prism 5.5: Individual Dimensions for Aggregated Radar
  dimensions?: Record<FrictionDimensionKey, FrictionDimension>;

  // PRISM 9.0: Trinity Core
  strategic_coordinates?: StrategicCoordinates;

  purchase_friction?: 'Low' | 'Medium' | 'High'; 
  resonance_analysis: ProductResonance;
  source_snapshot?: {
      product_name: string;
      product_price: string;
      generated_at: number;
  };

  // PRISM 3.0 FIELDS
  track?: 'A_Baseline' | 'B_Opportunity';
  observable_signals?: string[];
  decision_unit?: 'Individual' | 'Household' | 'Corporate';
  solvency_check?: {
      is_insolvent: boolean;
      reason: string;
  };
}

// ... rest of the file (OriginProfile, etc.) remains unchanged
export type GenderOption = 'Male' | 'Female' | 'General';

export interface OriginProfile {
  source_type: 'upload' | 'synthetic';
  parent_candidate_id?: string; 
  skeleton?: {
    role: string;
    age: string;
    income: string;
    gender?: GenderOption; 
  };
  dna?: PersonaDNA; 
  shadow?: {
    id: string;
    label: string;
  };
  humanity_score?: number; 
}

export interface SpeakingStyle {
  emoji_usage: 'high' | 'medium' | 'low' | 'none' | string;
  punctuation_style: 'strict' | 'loose' | 'expressive' | 'minimalist' | string;
  code_switching: 'none' | 'rare' | 'moderate' | 'heavy' | string; 
  common_phrases: string[]; 
}

export interface DialogueStyle {
  response_length: 'short_bursts' | 'concise' | 'elaborate' | string;
  proactivity: 'reactive' | 'balanced' | 'proactive' | string;
  digression_rate: 'focused' | 'associative' | string;
  conflict_style: 'agreeable' | 'defensive' | 'assertive' | 'passive_aggressive' | string;
}

export interface SampleDialogue {
  scenario: string; 
  intent: string; 
  text: string; 
}

export interface PsychologicalState {
  quadrant: 'High_Tension' | 'Impulse' | 'Skeptic' | 'Drifter';
  desire_source: string; 
  defense_source: string; 
  rational_alibi: string; 
}

export interface MarketingTactic {
  tactic: string; 
  copy: string;   
}

export interface NerveEnding {
  keyword: string;       
  valence: 'positive' | 'negative';
  intensity: number;     
  reaction: string;      
}

export interface ParadoxProtocol {
  public_mask: string;   
  private_self: string;  
  trigger_condition: string; 
  switch_instruction: string; 
}

export interface SystemState {
  economic_logic: {
    label: string; 
    behavior_rule: string; 
  };
  time_logic?: {
    label: string; 
    behavior_rule: string;
  };
  composite_flaw: {
    label: string; 
    description: string; 
    trigger_rule: string; 
  };
  nerve_endings?: NerveEnding[];
  paradox_protocol?: ParadoxProtocol;
  marketing_tactics?: {
    scarcity?: MarketingTactic;
    authority?: MarketingTactic;
    social_proof?: MarketingTactic;
    novelty?: MarketingTactic;
    value?: MarketingTactic;
  };
  psychological_state?: PsychologicalState;
  sample_dialogues: SampleDialogue[]; 
}

export interface MarketingArchetype {
  life_role: string;      
  financial_role: string; 
  media_role: string;     
  decision_archetype: string; 
}

export interface ContextProfile {
  life_stage: string;
  age_bucket: string;
  gender_guess: string | null;
  location_level: string;
  device_pref: string[];
  channel_mix: Record<string, number>;
  visit_recency: string;
  engagement_level: string;
  marketing_archetype?: MarketingArchetype; 
  custom_dimensions?: Record<string, string>;
}

export interface BehavioralPattern {
  frequency: {
    visits_per_month: number;
    active_days_ratio: number;
  };
  depth: {
    avg_pages_per_session: number;
    long_session_ratio?: number;
  };
  breadth?: {
    category_diversity: number;
    topic_diversity: number;
  };
  time_pattern: {
    preferred_time_slots: string[];
    weekday_vs_weekend?: string;
  };
  content_preference: {
    top_categories: ContentCategory[];
    top_lda_topics: { topic_id: number; label: string; weight: number; keyword?: string }[];
  };
  ad_interaction: {
    click_rate: number;
    campaign_variety: number;
    format_preference: string[];
  };
}

export interface ContextualShift {
  condition: string; 
  shift_score: number; 
  description: string; 
}

export interface PersonalityDimension {
  level: string; 
  base_score: number; 
  evidence: string;
  contextual_shift?: ContextualShift; 
}

export interface PersonalityProfile {
  summary_tags: string[];
  mece_tags?: MeceTags; // NEW: MECE 4-Axis Tags
  dimensions: {
    novelty_seeking: PersonalityDimension;
    planning_vs_spontaneous: PersonalityDimension;
    risk_attitude: PersonalityDimension;
    social_orientation: PersonalityDimension;
    health_concern?: PersonalityDimension;
    financial_sensitivity: PersonalityDimension;
  };
}

export interface Goal {
  goal: string;
  priority?: number;
  evidence: string;
}

export interface LatentNeed {
  hypothesis: string;
  confidence: number;
  evidence: string;
}

export interface Motivations {
  primary_goals: Goal[];
  secondary_goals: Goal[];
  latent_needs: LatentNeed[];
}

export interface Conflict {
  type: string;
  description: string;
  evidence: string;
}

export interface Insight {
  insight: string;
  evidence: string;
  pattern?: string; 
}

export interface ContradictionsAndInsights {
  conflicts: Conflict[];
  non_intuitive_insights: Insight[];
  paradoxical_behaviors: Insight[];
  irrational_triggers?: string[];
  paradox_core?: string;
}

export interface Constraints {
  time: { available_time_pattern: string; evidence: string };
  money: { spending_power_level: string; price_sensitivity: string; evidence: string };
  knowledge: { domain_knowledge_level: string; evidence: string };
  access: { tech_constraint?: string | null; channel_constraint?: string | null };
  emotional: { change_aversion: string; evidence: string };
}

export interface InteractionStyle {
  tone_preference: string[];
  content_format_preference: string[];
  length_tolerance: string;
  ad_sensitivity: string;
  privacy_sensitivity: string;
  recommended_channels: string[];
  speaking_style: SpeakingStyle;
  dialogue_style: DialogueStyle;
  chart_comments?: {
    avatar_hook?: string;
    behavioral_rationale?: string;
    content_preference?: string;
    spending_habit?: string;
    activity_pattern?: string;
  } | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isSystemEvent?: boolean;
}

export interface SimulationResult {
  winner: 'A' | 'B' | 'Tie';
  scores: { a: number; b: number };
  gut_feeling: string;
  verbal_response: string;
  action_probability: number;
  system_reality_check: string;
  reasoning: string;
  deep_rationale: string;
  psychological_triggers: {
    positive: string[];
    negative: string[];
  };
  blind_spot_triggered: boolean;
  suggested_refinement: string;
}

export interface TensionAnalysis {
  state: 'High_Tension' | 'Impulse' | 'Skeptic' | 'Drifter';
  label: string;
  description: string;
  strategy: string;
  advice: string;
  scores: { desire: number; defense: number };
  breakdown?: {
    desire_source: string;
    defense_source: string;
    rational_alibi: string;
  };
}

export interface DigitalTwinPersona {
  twin_id: string;
  source_user_ids: string[];
  avatar_url?: string; 
  data_window: {
    start_date: string;
    end_date: string;
  };
  confidence_score: number;
  last_updated_at: string;
  
  perception_sheet?: SelfPerception;
  origin_profile?: OriginProfile;
  chronos_report?: ChronosReport;

  context_profile: ContextProfile;
  behavioral_pattern: BehavioralPattern;
  personality_profile: PersonalityProfile;
  motivations: Motivations;
  contradictions_and_insights: ContradictionsAndInsights;
  constraints: Constraints;
  interaction_style: InteractionStyle;
  system_state: SystemState;
}