
/**
 * MOCK DATA FACTORY
 * 用於模擬 Gemini API 的原始輸出，包含完美結構與常見錯誤結構。
 */

export const BROKEN_AI_RESPONSE = {
  // 模擬：缺少 behavioral_pattern，指標散落在根目錄 metrics
  metrics: {
    total_interactions: 50,
    active_days_count: 5,
    avg_intensity_score: 8
  },
  // 模擬：數值格式錯誤 (0.8 instead of 80)
  personality_profile: {
    dimensions: {
      novelty_seeking: { base_score: 0.8, level: "High" },
      // 模擬：缺少 risk_attitude
    }
  },
  // 模擬：缺少 marketing_archetype，需要透過邏輯推導
  context_profile: {
    life_stage: "Student"
  },
  // 模擬：空的 interaction_style
  interaction_style: {}
};

export const PERFECT_AI_RESPONSE = {
  behavioral_pattern: {
    frequency: { visits_per_month: 20, active_days_ratio: 50 },
    depth: { avg_pages_per_session: 6.5 },
    content_preference: {
      top_categories: [{ name: "Tech", weight: 90 }]
    }
  },
  personality_profile: {
    dimensions: {
      novelty_seeking: { base_score: 80, level: "高" },
      planning_vs_spontaneous: { base_score: 30, level: "低" },
      risk_attitude: { base_score: 75, level: "高" },
      social_orientation: { base_score: 60, level: "中" },
      financial_sensitivity: { base_score: 40, level: "低" }
    }
  },
  context_profile: {
    marketing_archetype: {
      decision_archetype: "衝動型 (Impulse)",
      life_role: "科技愛好者",
      financial_role: "享樂主義"
    }
  },
  interaction_style: {
    tone_preference: ["熱情"],
    speaking_style: {
      emoji_usage: "high",
      common_phrases: ["真的假的"]
    }
  },
  constraints: {
    money: { spending_power_level: "高", evidence: "買很多" }
  }
};

export const RAW_CLEAN_CSV = `timestamp,action,category,subject,value,content_body
2023-10-01 09:00:00,view,News,Tech Report,10,reading
2023-10-01 10:00:00,search,Shopping,Phone,0,query: iphone
2023-10-02 12:00:00,purchase,Shopping,iPhone 15,30000,bought it`;

export const RAW_DIRTY_CSV = `timestamp,action,category,subject
2023/10/01 9:00,view,News,Bad Format
,,Empty,Row
2023-10-01 10:00:00,click,Shopping,Emoji 🍎,100
Invalid Date String,view,News,Broken Date`;
