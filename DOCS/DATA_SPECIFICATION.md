
# Data Input & Schema Specifications

## 1. 核心物件：PersonaDNA
由 Profiler 生成，Architect 用於合成數據。

```typescript
interface PersonaDNA {
  role: string;
  lifestyle: string[];
  anxiety: string;
  spending_habit: string;
  
  // Prism 3.0 MECE Tags (行為驅動標籤)
  mece_tags?: {
      info_diet: 'Data_Miner' | 'Headline_Surfer' | ...;
      decision_core: 'CP_Calculator' | 'Vibe_First' | ...;
      social_drive: 'Lurker' | 'Broadcaster' | ...;
      defense_mechanism: 'Cynicism' | 'Avoidance' | ...;
  };

  // 社會學現實校準
  reality_check: {       
      coherence_level: 'High' | 'Delusional' | 'Insolvent' | ...;
      correction_rules: { display_role: string; spending_logic: string; };
  };
  
  // CSV 生成器的硬性約束包
  _sociology_pack?: {    
      time_rules: string;
      money_rules: string;
      keyword_injection: string[];
  };
}
```

## 2. 產品鏡像物件：PersonaCandidate
由 Product Mirror (Prism 9.0) 生成。

```typescript
interface PersonaCandidate {
  id: string;
  role: string;
  age_range: string;
  income_level: string; // Survival ~ Elite
  
  // Prism 9.0 Trinity Core
  strategic_coordinates: {
      demand_tension: { score: number; pain_context: string; };
      competitive_lockin: { score: number; crack_point: string; };
      entry_feasibility: { score: number; entry_path: string; };
      opportunity_volume: number;
  };

  resonance_analysis: {
      marketing_hook: string;
      pain_point: string;
      product_solution: string; // The Leverage
      flippability_score: number;
  };
}
```

## 3. 搜尋意圖物件：IntentPrismResult
由 Search Lab 生成。

```typescript
interface SearchIntentState {
  state_type: 'Urgent_Pain' | 'Rational_Comparison' | 'Skeptical_Resistance';
  search_queries: string[]; // e.g. ["keyword ptt", "keyword disaster"]
  content_strategy: {
      high_validity: { title: string; reason: string; };
      low_validity: { title: string; reason: string; };
  };
  validity_score: number;
}
```
