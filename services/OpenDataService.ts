
import { TAX_BRACKETS_2023, mapAgeToBracket, IncomeBracket } from '../data/open_data/income_distribution';
import { OCCUPATION_TIME_PRINTS, TimeProfile } from '../data/open_data/time_patterns';
import { CONSUMPTION_ARCHETYPES } from '../data/open_data/cpi_weights';
import { OCCUPATION_SALARY_DB, SalaryProfile } from '../data/open_data/occupational_salaries';
import { HOUSEHOLD_STRUCTURES, HouseholdProfile } from '../data/open_data/household_structure';
import { GEO_ECONOMICS, GeoProfile } from '../data/open_data/geo_economics';
import { MACRO_INDICATORS, CATEGORY_BASE_RATES } from '../data/open_data/macro_indicators';
import { lexiconService } from './LexiconService';
import { DecisionUnit } from '../types';
import { PRISM_POLICY } from '../data/prism_policy'; 
import { EconomicPhysics } from '../data/physics/coefficients';

export interface SocioEconomicCoordinates {
  income_percentile: number; // 0-100
  wealth_label: 'Survival' | 'Tight' | 'Stable' | 'Affluent' | 'Elite';
  estimated_annual_income: number;
  likely_occupations: string[];
  consumption_archetype: string;
}

// Seniority Multipliers based on Curve Type
const SENIORITY_CURVE = {
  steep: { '18-24': 0.6, '25-29': 0.85, '30-34': 1.0, '35-39': 1.3, '40-49': 1.6, '50+': 1.5 },
  flat:  { '18-24': 0.8, '25-29': 0.9,  '30-34': 1.0, '35-39': 1.1, '40-49': 1.15, '50+': 1.1 },
  bell:  { '18-24': 0.7, '25-29': 0.9,  '30-34': 1.0, '35-39': 1.2, '40-49': 1.1,  '50+': 0.9 } // Physical labor drops with age
};

class OpenDataService {
  
  /**
   * Get estimated salary based on Job Title and Age
   */
  public getEstimatedSalary(jobKey: string, ageKey: string): number | null {
    const jobData = OCCUPATION_SALARY_DB.data[jobKey];
    if (!jobData) return null;

    const curve = SENIORITY_CURVE[jobData.curve_type] || SENIORITY_CURVE.flat;
    const multiplier = curve[ageKey as keyof typeof curve] || 1.0;

    return Math.round(jobData.annual_mean * multiplier);
  }

  /**
   * 根據年齡與推估收入，計算在台灣社會的 PR 值
   */
  public calculateSocialStanding(age: string, monthlyIncome: number, jobKey?: string): SocioEconomicCoordinates {
    const ageKey = mapAgeToBracket(age);
    const bracket = TAX_BRACKETS_2023.data[ageKey] || TAX_BRACKETS_2023.data['30-34'];
    
    // Default: Estimate from monthly * 13.5
    let annualIncome = monthlyIncome * 13.5; 

    // OVERRIDE: If we have a specific job key, use the Real Data
    if (jobKey) {
        const realDataIncome = this.getEstimatedSalary(jobKey, ageKey);
        if (realDataIncome) {
            annualIncome = (realDataIncome * 0.7) + (annualIncome * 0.3);
        }
    }

    let percentile = 50;
    let label: SocioEconomicCoordinates['wealth_label'] = 'Stable';

    if (annualIncome < bracket.p10) { percentile = 10; label = 'Survival'; }
    else if (annualIncome < bracket.p25) { percentile = 25; label = 'Tight'; }
    else if (annualIncome < bracket.median) { percentile = 40; label = 'Stable'; }
    else if (annualIncome < bracket.p75) { percentile = 75; label = 'Stable'; }
    else if (annualIncome < bracket.p90) { percentile = 90; label = 'Affluent'; }
    else { percentile = 99; label = 'Elite'; } 

    return {
      income_percentile: percentile,
      wealth_label: label,
      estimated_annual_income: annualIncome,
      likely_occupations: [], 
      consumption_archetype: label.toLowerCase()
    };
  }

  /**
   * Cosine Similarity for Distribution Matching
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
      if (vecA.length !== vecB.length) return 0;
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < vecA.length; i++) {
          dotProduct += vecA[i] * vecB[i];
          normA += vecA[i] * vecA[i];
          normB += vecB[i] * vecB[i];
      }
      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 根據活躍時間分佈 (0-23 Array)，推測最可能的職業作息
   */
  public predictProfessionFromTime(hourlyCounts: number[]): { match: TimeProfile, confidence: number }[] {
    if (!hourlyCounts || hourlyCounts.length !== 24) return [];

    const maxVal = Math.max(...hourlyCounts) || 1;
    const inputVector = hourlyCounts.map(v => (v / maxVal) * 100);

    const results = Object.values(OCCUPATION_TIME_PRINTS.data).map(profile => {
      const similarity = this.cosineSimilarity(inputVector, profile.hourly_weights);
      const score = similarity * 100;
      return { match: profile, confidence: Math.round(score) };
    });

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Helper: Map Role String to Time Archetype
   */
  public getTimeProfileByRole(roleInput: string): TimeProfile {
      const lexResult = lexiconService.analyzeInput(roleInput);
      const labor = lexResult.coordinates.labor;
      const roleLower = roleInput.toLowerCase();

      let profileId = "standard_9to5"; 

      if (roleLower.includes('媽') || roleLower.includes('爸') || roleLower.includes('parent') || roleLower.includes('家長')) {
          profileId = "domestic_fragmented";
      }
      else if (roleLower.includes('操盤') || roleLower.includes('交易') || roleLower.includes('trader') || roleLower.includes('股票')) {
          profileId = "market_opening_burst";
      }
      else if (roleLower.includes('夜班') || roleLower.includes('輪班') || roleLower.includes('大夜')) {
          if (roleLower.includes('保全') || roleLower.includes('超商')) {
             profileId = "drifting_unstructured"; 
          } else {
             profileId = "night_shift_vacuum"; 
          }
      }
      else if (roleLower.includes('外送') || roleLower.includes('司機') || roleLower.includes('uber')) {
          profileId = "inverse_service_peak";
      }
      else if (roleLower.includes('網拍') || roleLower.includes('代購') || roleLower.includes('小編')) {
          profileId = "fragmented_always_on";
      }
      else if (labor === 'Student') {
          profileId = "student_schedule";
      }
      else if (labor === 'Autonomous' || labor === 'Gig') {
          profileId = "freelance_flex";
      }
      else if (roleLower.includes('工程師') || roleLower.includes('dev')) {
          profileId = "tech_crunch_dev";
      }

      return OCCUPATION_TIME_PRINTS.data[profileId] || OCCUPATION_TIME_PRINTS.data["standard_9to5"];
  }

  // === NEW: Prism 5.0 Policy-Driven Logic ===

  /**
   * Calculate Effective Monthly Burden Rate based on Policy
   */
  public calculateProductBurden(price: number, cycle: string, category: string = ""): number {
      const { amortization } = PRISM_POLICY;
      
      const c = cycle.toLowerCase();
      
      // Explicit Cycle
      if (c.includes('month') || c.includes('月')) {
          return price;
      }
      if (c.includes('year') || c.includes('年')) {
          return Math.round(price / 12);
      }

      // One-time Purchase Logic (Category Inference)
      let selectedPolicy = amortization.consumable; // Default

      const isDurable = category.match(/3c|家電|車|家具|appliance|car|tech|laptop|phone/i);
      const isSemiDurable = category.match(/fashion|clothes|shoes|bag|衣|鞋|包/i);
      const isLuxury = category.match(/watch|jewelry|luxury|名錶|珠寶|精品/i);

      if (isLuxury) selectedPolicy = amortization.luxury;
      else if (isDurable) selectedPolicy = amortization.durable;
      else if (isSemiDurable) selectedPolicy = amortization.semi_durable;

      return Math.round(price / selectedPolicy.base_months);
  }

  /**
   * Infer Decision Unit based on Policy
   */
  public inferDecisionUnit(monthlyBurden: number, category: string = ""): DecisionUnit {
      const { decision_unit } = PRISM_POLICY;
      const cat = category.toLowerCase();
      
      // 1. Org Check (B2B)
      if (decision_unit.org_keywords.some(k => cat.includes(k))) {
          return 'Org';
      }

      // 2. Household Check (High Burden or Family items)
      // Use configured absolute threshold
      const isHighBurden = monthlyBurden > decision_unit.household_threshold_absolute;
      const isFamilyCategory = decision_unit.household_keywords.some(k => cat.includes(k));

      if (isHighBurden || isFamilyCategory) {
          return 'Household';
      }

      // 3. Default Self
      return 'Self';
  }

  /**
   * Helper to retrieve Household Profile
   */
  public inferHouseholdStructure(role: string, age: string): HouseholdProfile {
      // Simple inference for now
      if (role.includes('獨居') || role.includes('單身')) return HOUSEHOLD_STRUCTURES.data['solo_nomad'];
      if (role.includes('頂客') || (role.includes('婚') && !role.includes('子'))) return HOUSEHOLD_STRUCTURES.data['dinks'];
      if (role.includes('媽') || role.includes('爸') || role.includes('家長')) return HOUSEHOLD_STRUCTURES.data['nuclear_family'];
      if (role.includes('三代') || role.includes('顧老')) return HOUSEHOLD_STRUCTURES.data['sandwich_class'];
      if (parseInt(age) > 50 && (role.includes('退休'))) return HOUSEHOLD_STRUCTURES.data['empty_nest'];
      return HOUSEHOLD_STRUCTURES.data['solo_nomad']; // Default fallback
  }

  public inferGeoProfile(role: string, incomeLabel: string): GeoProfile {
      if (incomeLabel === 'Elite' || role.includes('天龍')) return GEO_ECONOMICS.data['taipei_core'];
      if (role.includes('通勤') || role.includes('林口')) return GEO_ECONOMICS.data['commuter_belt'];
      if (role.includes('竹科') || role.includes('工程師')) return GEO_ECONOMICS.data['tech_hub'];
      if (role.includes('南部') || role.includes('台中') || role.includes('高雄')) return GEO_ECONOMICS.data['comfort_zone'];
      return GEO_ECONOMICS.data['commuter_belt']; // Default fallback
  }

  // === PRISM 8.0: Reality-Anchored Logic ===

  /**
   * Get Macro Economic Multiplier based on CPI/CCI
   * Returns a float (e.g., 0.8 to 1.1)
   */
  public getMacroMultiplier(): number {
      const { CCI_SCORE, CPI_YOY } = MACRO_INDICATORS.data;
      
      // Base is 1.0
      let multiplier = 1.0;

      // 1. CCI Impact (Confidence)
      // CCI < 80 is pessimistic -> Reduces willingness to spend
      if (CCI_SCORE < 70) multiplier -= 0.15;
      else if (CCI_SCORE < 90) multiplier -= 0.05;
      else multiplier += 0.05;

      // 2. CPI Impact (Inflation)
      // CPI > 2.5% -> Reduces purchasing power
      if (CPI_YOY > 3.0) multiplier -= 0.1;
      else if (CPI_YOY > 2.0) multiplier -= 0.05;

      return Math.max(0.6, multiplier); // Floor at 0.6
  }

  /**
   * Calculate Affordability Ratio (M_micro) using Physics Engine
   * @param monthlyBurden The amortized monthly cost of the product
   * @param incomeTierKey Key from TAX_BRACKETS ('Survival', 'Tight', etc.)
   * @returns A float between 0.0 (Impossible) and 1.0 (Easy)
   */
  public calculateAffordability(monthlyBurden: number, incomeTierKey: string, ageRange: string = "30-34"): number {
      // 1. Get Median Disposable Income for the Tier (Approx)
      const bracket = TAX_BRACKETS_2023.data[mapAgeToBracket(ageRange)];
      let annualIncome = bracket.median; // Default

      switch (incomeTierKey) {
          case 'Survival': annualIncome = bracket.p10; break;
          case 'Tight': annualIncome = bracket.p25; break;
          case 'Stable': annualIncome = bracket.median; break;
          case 'Affluent': annualIncome = bracket.p90; break;
          case 'Elite': annualIncome = bracket.p99; break;
      }

      // Convert to Monthly Disposable (Using simplified physics constants for speed)
      // Base Tax Retention = 0.88
      // Rent Burden Avg = 0.35 (General)
      // Retention = 0.88 * (1 - 0.35) = 0.57
      const monthlyDisposable = (annualIncome / 13.5) * 0.57;

      // 2. Use Physics Engine to calculate Resistance
      const resistance = EconomicPhysics.calculatePurchaseResistance(monthlyBurden, monthlyDisposable);

      // 3. Invert Resistance to get Affordability (0-1)
      // Resistance 100 -> Affordability 0
      // Resistance 5 -> Affordability 0.95
      return Math.max(0.01, (100 - resistance) / 100);
  }

  public getCategoryBaseRate(category: string): number {
      const catLower = category.toLowerCase();
      if (catLower.match(/luxury|watch|bag|car|house/)) return CATEGORY_BASE_RATES.Luxury;
      if (catLower.match(/3c|phone|laptop|tv/)) return CATEGORY_BASE_RATES.Durable;
      if (catLower.match(/clothes|shoes|fashion/)) return CATEGORY_BASE_RATES.Semi_Durable;
      if (catLower.match(/food|drink|tissue/)) return CATEGORY_BASE_RATES.Consumable;
      if (catLower.match(/app|software|game|sub/)) return CATEGORY_BASE_RATES.Digital;
      return CATEGORY_BASE_RATES.General;
  }

  // Expose options for UI
  public getGeoOptions() {
      return Object.values(GEO_ECONOMICS.data);
  }

  public getHouseholdOptions() {
      return Object.values(HOUSEHOLD_STRUCTURES.data);
  }
}

export const openDataService = new OpenDataService();
