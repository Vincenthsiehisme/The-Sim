
// SOURCE: DGBAS (Family Income and Expenditure Survey) & MOI (Household Registration)
// Logic: Define economic pressure based on family composition.

export interface HouseholdProfile {
  id: string;
  label: string;
  avg_members: number;
  dependency_ratio: number; // 0.0 - 1.0 (Non-working members / Working members)
  discretionary_factor: number; // Multiplier for disposable income (1.0 = Full freedom, 0.3 = Heavy burden)
  spending_focus: string[]; // Key consumption categories
  anxiety_source: string;
}

export const HOUSEHOLD_STRUCTURES: Record<string, HouseholdProfile> = {
  // 1. 單身游牧 (1人戶)
  "solo_nomad": {
    id: "solo_nomad",
    label: "單身游牧 (Solo Nomad)",
    avg_members: 1,
    dependency_ratio: 0.0,
    discretionary_factor: 0.9, // High freedom
    spending_focus: ["Self-Improvement", "Entertainment", "Travel", "Gadgets"],
    anxiety_source: "Career Stagnation / Loneliness"
  },
  
  // 2. 頂客族 (2人戶, 雙薪無子)
  "dinks": {
    id: "dinks",
    label: "頂客族 (DINKs)",
    avg_members: 2,
    dependency_ratio: 0.0,
    discretionary_factor: 0.85, // Pooled income, high freedom
    spending_focus: ["Lifestyle", "Dining", "Investment", "Pets"],
    anxiety_source: "Health / Asset Inflation"
  },

  // 3. 核心家庭 (3-4人戶, 有幼童)
  "nuclear_family": {
    id: "nuclear_family",
    label: "核心家庭 (Nuclear Family)",
    avg_members: 3.5,
    dependency_ratio: 0.5, // 1-2 kids per 2 adults
    discretionary_factor: 0.4, // Significant drop due to education/care
    spending_focus: ["Education", "Mortgage", "Insurance", "Family Travel"],
    anxiety_source: "Child Development / School District"
  },

  // 4. 三明治世代 (4+人戶, 上老下小) - The Critical "Invisible Poor"
  "sandwich_class": {
    id: "sandwich_class",
    label: "三明治世代 (Sandwich Class)",
    avg_members: 4.5,
    dependency_ratio: 0.8, // Elders + Kids
    discretionary_factor: 0.25, // Critically low free cash flow
    spending_focus: ["Medical Care", "Mortgage", "Tuition", "Groceries"],
    anxiety_source: "Cash Flow / Burnout / Elder Care"
  },

  // 5. 空巢期 (2人戶, 退休/準退休)
  "empty_nest": {
    id: "empty_nest",
    label: "空巢期 (Empty Nest)",
    avg_members: 2,
    dependency_ratio: 0.1, // Often retired
    discretionary_factor: 0.6, // Dependent on pension/savings
    spending_focus: ["Healthcare", "Wellness", "Safe Assets", "Grandkids"],
    anxiety_source: "Health / Longevity Risk"
  }
};
