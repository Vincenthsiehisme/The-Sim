
import { VerifiableDataset } from '../types_provenance';

// SOURCE: Ministry of Labor - Occupational Wage Survey (113年) & 104 Salary Intelligence
// Refined for "Career Physics Engine" to include curves and sector types.

export type SalaryCurve = 'steep' | 'linear' | 'flat' | 'bell';
export type SalarySector = 'tech' | 'finance' | 'manufacturing' | 'service' | 'general';

export interface SalaryProfile {
  raw_title: string;
  base_monthly: number; // Entry level (approx P25 of 25-29 age)
  curve_type: SalaryCurve; 
  sector_type: SalarySector;
  bonus_months: number; // For volatility calculation (1.5 = stable, 6 = high variance)
}

export const OCCUPATION_SALARY_DB: VerifiableDataset<Record<string, SalaryProfile>> = {
  meta: {
    source: "Ministry of Labor (勞動部職類別薪資) & Market Intelligence",
    dataset_id: "Career Physics DB v2.0",
    published_at: "2024-05",
    confidence: 0.92
  },
  data: {
    // === TECH (High Growth, Geo-Sensitive) ===
    "software_engineer": {
      raw_title: "軟體工程師",
      base_monthly: 48000, 
      curve_type: "steep",
      sector_type: "tech",
      bonus_months: 3.5 // Stock/Bonus impact
    },
    "hardware_engineer": {
      raw_title: "硬體研發工程師",
      base_monthly: 52000,
      curve_type: "steep",
      sector_type: "tech",
      bonus_months: 5.0 // High bonus in Hsinchu
    },
    "mechanic": {
      raw_title: "生產設備工程師",
      base_monthly: 38000,
      curve_type: "linear",
      sector_type: "manufacturing",
      bonus_months: 3.0
    },

    // === FINANCE (High Ceiling, Taipei-Centric) ===
    "trader": {
      raw_title: "金融交易員",
      base_monthly: 45000,
      curve_type: "steep",
      sector_type: "finance",
      bonus_months: 8.0 // Performance based
    },
    "finance_clerk": {
      raw_title: "銀行辦事員",
      base_monthly: 36000,
      curve_type: "linear",
      sector_type: "finance",
      bonus_months: 3.5 // Stable but good
    },
    "insurance_agent": {
      raw_title: "保險業務",
      base_monthly: 28000, // Low base
      curve_type: "steep", // High potential
      sector_type: "general", // Less geo-bound
      bonus_months: 6.0
    },

    // === PROFESSIONAL (Linear Growth) ===
    "marketing": {
      raw_title: "行銷企劃",
      base_monthly: 32000,
      curve_type: "linear",
      sector_type: "general",
      bonus_months: 1.5
    },
    "designer": {
      raw_title: "平面設計師",
      base_monthly: 30000,
      curve_type: "flat", // Hard to scale without management role
      sector_type: "general",
      bonus_months: 1.0
    },
    "admin_assistant": {
      raw_title: "行政人員",
      base_monthly: 29000,
      curve_type: "flat",
      sector_type: "general",
      bonus_months: 1.2
    },
    "doctor": {
      raw_title: "醫師",
      base_monthly: 90000, // Resident
      curve_type: "steep",
      sector_type: "general", // Universal demand
      bonus_months: 2.0
    },
    "nurse": {
      raw_title: "護理師",
      base_monthly: 38000,
      curve_type: "linear", // Shift diffs + seniority
      sector_type: "general",
      bonus_months: 1.5
    },

    // === SERVICE & LABOR (Flat/Bell) ===
    "restaurant_service": {
      raw_title: "餐飲服務生",
      base_monthly: 31000, // Min wage +
      curve_type: "flat",
      sector_type: "service",
      bonus_months: 1.0
    },
    "delivery": {
      raw_title: "外送員",
      base_monthly: 35000, // Full time equivalent
      curve_type: "bell", // Physical stamina drops with age
      sector_type: "service",
      bonus_months: 0.5
    },
    "construction_labor": {
      raw_title: "營建工人",
      base_monthly: 45000, // Daily rate annualized
      curve_type: "bell", // Health dependent
      sector_type: "general",
      bonus_months: 0.5
    },
    "security": {
      raw_title: "保全",
      base_monthly: 34000,
      curve_type: "flat",
      sector_type: "service",
      bonus_months: 1.0
    }
  }
};
