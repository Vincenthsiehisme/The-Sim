
// PRISM ENGINE 5.0 DYNAMIC POLICY CONFIGURATION
// This file centralizes all "Physics" and "Business Logic" previously hardcoded.

export const PRISM_POLICY = {
  // 1. 物理引擎：價格痛感攤提 (Amortization Physics)
  amortization: {
    // Durable Goods (3C, Appliances, Furniture) - High longevity
    durable: { base_months: 24, pain_discount: 0.6 }, 
    // Semi-Durable (Fashion, Shoes, Bags) - Seasonal longevity
    semi_durable: { base_months: 6, pain_discount: 0.8 },
    // Consumables (Food, Tickets, Skincare) - Instant consumption
    consumable: { base_months: 1, pain_discount: 1.0 },
    // Luxury/Asset (Watches, Jewelry) - Value retention
    luxury: { base_months: 60, pain_discount: 0.4 },
    // Subscription - Recurring pain
    subscription: { base_months: 1, pain_discount: 1.0 }
  },

  // 2. 決策單位判定 (Decision Unit Logic)
  decision_unit: {
    // If Monthly Burden > 35% of Median Disposable Income (~15k), trigger Household
    household_threshold_absolute: 15000, 
    // Keywords forcing Org decision
    org_keywords: ["b2b", "enterprise", "bulk", "商用", "批發", "office", "server", "saas"],
    // Keywords forcing Household decision
    household_keywords: ["family", "home", "furniture", "appliance", "家電", "家具", "親子", "家庭", "裝潢"]
  },

  // 3. 心理映射池 (Shadow Mapping Pool) - Replaces 1:1 mapping
  // Defines which psychological shadows are valid for each battleground strategy.
  shadow_mapping: {
    The_Stretcher: ['vibe', 'fomo', 'stealth_wealth', 'impulse', 'dreamer'],
    The_Solid: ['cp', 'spec_nerd', 'risk_averse', 'process', 'analyst'],
    The_Niche: ['auto'] // 'auto' means AI infers best fit from context
  },

  // 4. 懲罰係數 (Penalty Logic)
  // How much to reduce the Opportunity Score if a wall is hit.
  penalties: {
    insolvent: 0.05, // 95% reduction (Near Impossible)
    physical: 0.2,   // 80% reduction (Very Hard)
    regulatory: 0.0, // 100% reduction (Illegal)
    soft_friction: 0.8 // 20% reduction (Standard Friction)
  }
};
