
import { VerifiableDataset } from '../types_provenance';

// SOURCE: Ministry of Labor - Occupational Wage Survey (113年) & 104 Salary Intelligence
// Refined for "Career Physics Engine" (Calculus Based)

export type SalaryCurveType = 'logarithmic' | 'linear' | 'exponential' | 'bell';
export type SalarySector = 'tech' | 'finance' | 'manufacturing' | 'service' | 'general' | 'healthcare';

export interface SalaryProfile {
  raw_title: string;
  base_monthly: number; // Year 0 (Entry Level) P25 Salary
  curve: {
    type: SalaryCurveType;
    growth_rate: number; // Coefficient (k or r)
    max_cap: number;     // Hard ceiling multiplier (e.g. 1.5x of base)
  };
  sector_type: SalarySector;
  bonus_months: number; // For volatility calculation
}

export const OCCUPATION_SALARY_DB: VerifiableDataset<Record<string, SalaryProfile>> = {
  meta: {
    source: "Ministry of Labor (勞動部職類別薪資) & Market Intelligence",
    dataset_id: "Career Physics DB v3.0 (Calculus)",
    published_at: "2024-05",
    confidence: 0.92
  },
  data: {
    // === TECH (Exponential Growth, High Cap) ===
    "software_engineer": {
      raw_title: "軟體工程師",
      base_monthly: 42000, 
      curve: { type: "exponential", growth_rate: 0.06, max_cap: 3.5 }, // Can grow 3.5x over career
      sector_type: "tech",
      bonus_months: 3.5
    },
    "hardware_engineer": {
      raw_title: "硬體研發工程師",
      base_monthly: 48000,
      curve: { type: "exponential", growth_rate: 0.05, max_cap: 3.8 },
      sector_type: "tech",
      bonus_months: 5.0
    },
    "mechanic": {
      raw_title: "生產設備工程師",
      base_monthly: 36000,
      curve: { type: "linear", growth_rate: 0.03, max_cap: 2.0 },
      sector_type: "manufacturing",
      bonus_months: 3.0
    },

    // === FINANCE (Exponential but volatile) ===
    "trader": {
      raw_title: "金融交易員",
      base_monthly: 40000,
      curve: { type: "exponential", growth_rate: 0.08, max_cap: 5.0 }, // Huge potential
      sector_type: "finance",
      bonus_months: 8.0 
    },
    "finance_clerk": {
      raw_title: "銀行辦事員",
      base_monthly: 34000,
      curve: { type: "logarithmic", growth_rate: 0.25, max_cap: 1.8 }, // Stable, plateaus early
      sector_type: "finance",
      bonus_months: 3.5
    },
    "insurance_agent": {
      raw_title: "保險業務",
      base_monthly: 26000, 
      curve: { type: "exponential", growth_rate: 0.04, max_cap: 4.0 }, // Performance based
      sector_type: "general", 
      bonus_months: 6.0
    },
    "real_estate_agent": {
      raw_title: "房仲",
      base_monthly: 26000, 
      curve: { type: "exponential", growth_rate: 0.04, max_cap: 4.0 }, 
      sector_type: "general", 
      bonus_months: 8.0 
    },

    // === PROFESSIONAL (Linear/Stable) ===
    "marketing": {
      raw_title: "行銷企劃",
      base_monthly: 30000,
      curve: { type: "linear", growth_rate: 0.04, max_cap: 2.2 },
      sector_type: "general",
      bonus_months: 1.5
    },
    "designer": {
      raw_title: "平面設計師",
      base_monthly: 28000,
      curve: { type: "logarithmic", growth_rate: 0.2, max_cap: 1.6 }, // Hard to scale without rank
      sector_type: "general",
      bonus_months: 1.0
    },
    "admin_assistant": {
      raw_title: "行政人員",
      base_monthly: 27000,
      curve: { type: "logarithmic", growth_rate: 0.15, max_cap: 1.4 }, // Low ceiling
      sector_type: "general",
      bonus_months: 1.2
    },
    "doctor": {
      raw_title: "醫師",
      base_monthly: 85000, 
      curve: { type: "exponential", growth_rate: 0.05, max_cap: 4.0 },
      sector_type: "healthcare", 
      bonus_months: 2.0
    },
    "nurse": {
      raw_title: "護理師",
      base_monthly: 36000,
      curve: { type: "linear", growth_rate: 0.03, max_cap: 1.8 },
      sector_type: "healthcare",
      bonus_months: 1.5
    },

    // === SERVICE & LABOR (Bell Curve / Physical limit) ===
    "restaurant_service": {
      raw_title: "餐飲服務生",
      base_monthly: 29000, 
      curve: { type: "logarithmic", growth_rate: 0.1, max_cap: 1.3 }, // Minimum wage driver
      sector_type: "service",
      bonus_months: 1.0
    },
    "delivery": {
      raw_title: "外送員",
      base_monthly: 32000, 
      curve: { type: "bell", growth_rate: 15, max_cap: 1.5 }, // Peak at 15 years exp (approx age 37)
      sector_type: "service",
      bonus_months: 0.5
    },
    "construction_labor": {
      raw_title: "營建工人",
      base_monthly: 40000, 
      curve: { type: "bell", growth_rate: 12, max_cap: 1.8 }, // Physical peak earlier
      sector_type: "general",
      bonus_months: 0.5
    },
    "security": {
      raw_title: "保全",
      base_monthly: 32000,
      curve: { type: "logarithmic", growth_rate: 0.05, max_cap: 1.2 },
      sector_type: "service",
      bonus_months: 1.0
    },
    "sales_rep": {
      raw_title: "業務人員",
      base_monthly: 28000,
      curve: { type: "linear", growth_rate: 0.05, max_cap: 3.0 },
      sector_type: "general",
      bonus_months: 3.0
    }
  }
};
