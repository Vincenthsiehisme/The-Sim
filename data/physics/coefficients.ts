
import { POVERTY_LINE_2024, getRegionKey } from '../official_stats/poverty_line';
import { getPropensity } from '../official_stats/consumption_propensity';
import { getHousingBurden } from '../official_stats/housing_burden';

/**
 * Economic Physics Engine (v2.0 - Open Data Grounded)
 * Replaces magic numbers with government statistics.
 */
export class EconomicPhysics {
  
  static readonly CONSTANTS = {
    MONTHS_PER_YEAR: 13.5, 
    BASE_TAX_RETENTION: 0.88, 
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
   * 
   * @param price Product price (or monthly burden)
   * @param disposableIncome Monthly disposable income
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
   * Calculates the "Effective Retention Rate" after housing costs.
   * Uses Open Data housing burden rates instead of arbitrary multipliers.
   * 
   * @param baseRetention Base retention (after tax)
   * @param geoId Geo Profile ID (e.g. 'taipei_core')
   */
  static calculateGeoRetention(baseRetention: number, geoId: string): number {
    // Logic: In Taipei, housing eats 67% of income on average.
    // If the persona is "Average", we apply this burden directly.
    // However, higher income people have lower ratios. 
    // This is a simplified physics model: It applies the regional pressure as a drag.
    
    const burdenRate = this.getHousingPainThreshold(geoId);
    
    // Impact = BurdenRate. 
    // Example: Taipei (0.67). Retention = 1.0 - 0.67 = 0.33. 
    // This is brutal but realistic for "Average" income buying "Average" house.
    
    // We dampen it slightly because not everyone buys a house (Rent is usually lower than Mortgage burden).
    // Rent factor approximation: 0.6 of Mortgage Burden.
    const rentFactor = 0.6;
    const effectiveBurden = burdenRate * rentFactor;

    return Math.max(0.2, baseRetention - effectiveBurden);
  }
}
