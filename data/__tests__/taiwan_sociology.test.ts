import { describe, it, expect } from 'vitest';
import { getSocioEconomicContext } from '../taiwan_sociology';

// NOTE: These tests verify the "Implicit Inference Logic" inside getSocioEconomicContext
// Specifically targeting the `analyzeSocialTension` inner function.

describe('Taiwan Sociology Engine: Social Tension & Coping Strategies', () => {

  describe('Scenario: The "Poor Boss" (SME Owner with Cashflow Issues)', () => {
    it('should detect "Installment_King" strategy for struggling owners', () => {
      const result = getSocioEconomicContext(
        "30-34",
        "創業老闆", // Role implies "Owner"
        "Survival", // Income Modifier implies "Poor"
      );

      const tension = result.realityCheck.social_tension;
      
      expect(tension).toBeDefined();
      expect(tension?.moneyType).toBe("Cash_Flow"); // Owner = Cash Flow
      expect(tension?.copingStrategy).toBe("Installment_King"); // Poor Owner = Leverage/Installment
      expect(tension?.narrativeOverride).toContain("POOR_BOSS");
    });
  });

  describe('Scenario: The "Stealth Wealth" (Rich Engineer)', () => {
    it('should detect "Stealth_Wealth" for high income but low vanity roles', () => {
      const result = getSocioEconomicContext(
        "30-34",
        "資深後端工程師", // Tech sector = Low Vanity (usually)
        "Elite", // High Income
      );

      const tension = result.realityCheck.social_tension;

      expect(tension?.moneyType).toBe("Stable_Salary"); // Or Affluent
      // Tech vanity score is low (30), plus Elite income -> Stealth Wealth
      expect(tension?.copingStrategy).toBe("Stealth_Wealth");
      expect(tension?.faceScore).toBeLessThan(50); // Engineers don't care about face as much
    });
  });

  describe('Scenario: The "Mom Bank" (Poor Student with High Taste)', () => {
    it('should detect "Mom_Bank" strategy for young, poor, high-vanity roles', () => {
      const result = getSocioEconomicContext(
        "18-24", // Young
        "藝術設計系學生", // Student + Creative (High Vanity potential)
        "Survival", // No income
      );

      const tension = result.realityCheck.social_tension;

      expect(tension?.moneyType).toBe("Blood_Sweat"); // Student default
      expect(tension?.copingStrategy).toBe("Mom_Bank"); // Young + Poor + Student = Mom Bank
      expect(result.constraints.money_rules).toContain("Strategy: Mom_Bank");
    });
  });

  describe('Scenario: The "Compensatory Consumption" (Exhausted Worker)', () => {
    it('should detect compensatory spending for high-stress shift work', () => {
      // Police/Firefighter/Nurse often have this if income is decent
      const result = getSocioEconomicContext(
        "25-29",
        "消防員", // Shift_Civil sector -> High Stress
        "Stable", // Decent income
      );

      const tension = result.realityCheck.social_tension;

      expect(tension?.copingStrategy).toBe("Compensatory_Consumption");
      expect(tension?.narrativeOverride).toContain("COMPENSATORY");
    });
  });

  describe('Scenario: Contextual Overrides (Manual Intervention)', () => {
    it('should respect manual household overrides', () => {
        // Force a "Sandwich Class" structure on a single role
        const result = getSocioEconomicContext(
            "35-39",
            "自由接案",
            "Stable",
            undefined,
            { household_id: "sandwich_class" } // Override
        );

        // Expect disposable income calculation to be penalized by family factor
        expect(result.narrative).toContain("Sandwich Class");
        // Sandwich class discretionary factor is 0.25, so True FCF should be lower than standard
        // We can check if the label reflects the pressure
        expect(result.constraints.money_rules).toContain("Sandwich Class");
    });
  });

});