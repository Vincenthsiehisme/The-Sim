
// SOURCE: Ministry of Interior (Housing Price Index) & Numbeo
// Logic: Define cost multipliers based on location.

export interface GeoProfile {
  id: string;
  label: string;
  cost_multiplier: number; // 1.0 = Base, >1.0 = Expensive
  rent_burden: number; // % of income typically spent on rent/mortgage
  commute_penalty: number; // Hours lost per day
  vibe_keywords: string[];
}

export const GEO_ECONOMICS: Record<string, GeoProfile> = {
  // 1. 天龍國 (Taipei Core)
  "taipei_core": {
    id: "taipei_core",
    label: "天龍國 (Taipei Core)",
    cost_multiplier: 1.5, // High living cost
    rent_burden: 0.45, // 45% of income to housing
    commute_penalty: 0.8, // MRT/Bus
    vibe_keywords: ["Compact", "Convenient", "Expensive", "Fast-paced"]
  },

  // 2. 都會通勤圈 (New Taipei / Taoyuan / Keelung)
  "commuter_belt": {
    id: "commuter_belt",
    label: "都會通勤圈 (Commuter Belt)",
    cost_multiplier: 1.2,
    rent_burden: 0.35,
    commute_penalty: 2.0, // High time cost (Traffic/Rail)
    vibe_keywords: ["Traffic", "Early_Wake", "Tired", "Driving"]
  },

  // 3. 科技新貴區 (Hsinchu / Zhubei)
  "tech_hub": {
    id: "tech_hub",
    label: "科技新貴區 (Tech Hub)",
    cost_multiplier: 1.4, // Inflation due to high earners
    rent_burden: 0.30, // High income offsets rent
    commute_penalty: 1.5, // Jammed industrial parks
    vibe_keywords: ["Mall", "Costco", "Traffic_Jam", "Desolate"]
  },

  // 4. 舒適生活圈 (Central / South / Kaohsiung / Taichung Core)
  "comfort_zone": {
    id: "comfort_zone",
    label: "舒適生活圈 (Comfort Zone)",
    cost_multiplier: 0.9,
    rent_burden: 0.25, // More affordable
    commute_penalty: 0.5, // Scooter/Car
    vibe_keywords: ["Spacious", "Sunny", "Scooter", "Slow-paced"]
  },

  // 5. 鄉鎮/蛋白區 (Rural / Suburb)
  "rural_area": {
    id: "rural_area",
    label: "鄉鎮地區 (Rural)",
    cost_multiplier: 0.75,
    rent_burden: 0.15,
    commute_penalty: 0.3,
    vibe_keywords: ["Nature", "Family", "Local", "Distance"]
  }
};
