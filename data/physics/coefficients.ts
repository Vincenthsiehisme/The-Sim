
import { POVERTY_LINE_2024, getRegionKey } from '../official_stats/poverty_line';
import { getPropensity } from '../official_stats/consumption_propensity';
import { getHousingBurden } from '../official_stats/housing_burden';

/**
 * Economic Physics Engine (v2.1 - Additive Expense Stack)
 * Corrects the logic error where expenses were multiplied (diluted) instead of added.
 */
export class EconomicPhysics {
  
  static readonly CONSTANTS = {
    MONTHS_PER_YEAR: 13.5, 
    // Base Tax Rate estimate (Effective tax rate for median income)
    BASE_TAX_RATE: 0.12,
    // Rent is typically cheaper than Mortgage. 
    // MOI stats are "Loan Burden". We scale it down for general/renting population.
    RENTAL_DISCOUNT_FACTOR: 0.55, 
    // Macro Factors
    INFLATION_IMPACT_FACTOR: 1.5,
    CONFIDENCE_ELASTICITY: 0.5,
  };

  /**
   * Get the absolute survival floor (Monthly TWD) for a specific region.
   * Source: MOHW Poverty Line 2024.
   */
  static getSurvivalFloor(geoId: string): number {
    const regionKey = getRegionKey(geoId);
    return POVERTY_LINE_2024[regionKey] || POVERTY_LINE_2024.General;
  }

  /**
   * Get the expected "Housing Pain" ratio for a region.
   * Source: MOI Housing Affordability Index Q3 2023.
   */
  static getHousingPainThreshold(geoId: string): number {
    return getHousingBurden(geoId);
  }

  /**
   * Get the Marginal Propensity to Consume (MPC) based on age.
   * Source: DGBAS Family Income Survey.
   */
  static getConsumptionPropensity(ageRange: string): number {
    return getPropensity(ageRange);
  }

  /**
   * Calculates the "Resistance Score" (0-100) for a purchase based on burden ratio.
   * Uses a Logistic Function (Sigmoid) to model non-linear pain.
   */
  static calculatePurchaseResistance(price: number, disposableIncome: number): number {
    if (disposableIncome <= 0) return 100;
    
    const ratio = price / disposableIncome;
    
    // Logistic Function parameters
    // Midpoint (x0) = 0.3 (30% of income is the tipping point where pain accelerates)
    // Steepness (k) = 12 (Controls how fast pain rises)
    const k = 12;
    const x0 = 0.3;
    
    // P(x) = 1 / (1 + e^(-k(x - x0)))
    const sigmoid = 1 / (1 + Math.exp(-k * (ratio - x0)));
    
    // Scale to 0-100 and floor at minimal resistance
    return Math.round(Math.max(5, sigmoid * 100));
  }

  /**
   * Calculates the True Disposable Income using an Additive Expense Stack.
   * Formula: Income * (1 - (Tax + Housing + Family)) - SurvivalFloor
   * 
   * @param monthlyGross Monthly Gross Income
   * @param geoId Geo Profile ID
   * @param familyDiscretionaryFactor Factor from Household Structure (1.0 = Free, 0.25 = Burdened)
   * @param isHomeOwner If true, applies full Mortgage burden. If false, applies Rental burden.
   */
  static calculateTrueDisposableIncome(
    monthlyGross: number, 
    geoId: string, 
    familyDiscretionaryFactor: number,
    isHomeOwner: boolean = false
  ): number {
    
    // 1. Tax Burden (Fixed Estimate)
    const taxRate = this.CONSTANTS.BASE_TAX_RATE;

    // 2. Housing Burden (Geo-dependent)
    const rawHousingBurden = this.getHousingPainThreshold(geoId);
    // If renting, the burden is lower than the MOI "Loan Burden" index.
    const effectiveHousingRate = isHomeOwner 
        ? rawHousingBurden 
        : rawHousingBurden * this.CONSTANTS.RENTAL_DISCOUNT_FACTOR;

    // 3. Family Burden (Structure-dependent)
    // Convert "Discretionary Factor" (Freedom) to "Burden Ratio" (Cost)
    // Example: Factor 0.25 (Sandwich) -> Burden 0.75? No, that includes housing implicitly in old logic.
    // We scale it to represent "Non-Housing Family Costs" (Education, Food, Elders).
    // Factor 1.0 (Solo) -> 0% Burden
    // Factor 0.25 (Sandwich) -> 45% Burden (Heuristic mapping)
    const familyBurdenRate = (1.0 - familyDiscretionaryFactor) * 0.6;

    // 4. Total Ratio Stack (Additive)
    // Check for overflow (e.g. > 100% income)
    const totalExpenseRatio = Math.min(0.95, taxRate + effectiveHousingRate + familyBurdenRate);

    // 5. Residual Calculation
    const afterFixedExpenses = monthlyGross * (1.0 - totalExpenseRatio);
    
    // 6. Deduct Absolute Survival Floor (Food/Utilities min)
    const survivalFloor = this.getSurvivalFloor(geoId);
    
    return Math.round(afterFixedExpenses - survivalFloor);
  }
}
