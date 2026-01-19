import { describe, it, expect } from 'vitest';
import { calculateConversionScore } from '../personaAnalytics';
import { DigitalTwinPersona } from '../../types';

// Helper to create minimal persona for testing conversion logic
const createPersona = (overrides: any = {}): DigitalTwinPersona => {
  const defaultPersona = {
    behavioral_pattern: {
      frequency: { visits_per_month: 5 },
      depth: { avg_pages_per_session: 3 }
    },
    context_profile: {
      marketing_archetype: { decision_archetype: "一般觀望型" }
    },
    constraints: {
      money: { price_sensitivity: "中", spending_power_level: "中" },
      emotional: { change_aversion: "中" }
    },
    origin_profile: {
      dna: {
        reality_check: { coherence_level: "High" }
      }
    }
  };
  
  // Deep merge logic simplified for test
  const merged = JSON.parse(JSON.stringify(defaultPersona));
  if (overrides.context_profile?.marketing_archetype) merged.context_profile.marketing_archetype = overrides.context_profile.marketing_archetype;
  if (overrides.behavioral_pattern?.frequency) merged.behavioral_pattern.frequency = overrides.behavioral_pattern.frequency;
  if (overrides.constraints?.money) merged.constraints.money = overrides.constraints.money;
  if (overrides.origin_profile?.dna?.reality_check) merged.origin_profile.dna.reality_check = overrides.origin_profile.dna.reality_check;
  
  return merged as DigitalTwinPersona;
};

describe('Persona Analytics: Conversion Logic', () => {

  describe('calculateConversionScore', () => {
    
    it('should award high scores to "Impulse Buyers" with high frequency', () => {
      const richImpulseBuyer = createPersona({
        context_profile: { marketing_archetype: { decision_archetype: "衝動型 (Impulse)" } },
        behavioral_pattern: { frequency: { visits_per_month: 15 } }, // High Freq
        constraints: { money: { price_sensitivity: "低" } }
      });

      const result = calculateConversionScore(richImpulseBuyer);
      
      // Impulse (+15) + High Freq (+20) - Low Resistance -> High Score
      expect(result.drive.score).toBeGreaterThan(70);
      expect(result.totalScore).toBeGreaterThan(70);
      expect(result.sentiment).toContain('Hot');
    });

    it('should penalize "Price Sensitive" users significantly', () => {
      const poorSaver = createPersona({
        constraints: { money: { price_sensitivity: "High (高)" } }
      });

      const result = calculateConversionScore(poorSaver);
      
      // Price Sensitivity adds +20 friction
      expect(result.resistance.score).toBeGreaterThanOrEqual(50); // Base 30 + 20
      expect(result.blockers.some(b => b.label === "價格敏感")).toBe(true);
    });

    it('should apply CRITICAL penalty for "Insolvent" status (Reality Lock)', () => {
      const brokeDreamer = createPersona({
        context_profile: { marketing_archetype: { decision_archetype: "衝動型" } }, // High Drive
        origin_profile: {
          dna: {
            reality_check: { coherence_level: "Insolvent" } // But Broke
          }
        }
      });

      const result = calculateConversionScore(brokeDreamer);

      // Reality Lock logic: Friction * 2.5, Max Score capped at 45
      expect(result.resistance.isRealityLocked).toBe(true);
      expect(result.totalScore).toBeLessThanOrEqual(45);
      expect(result.blockers.some(b => b.label.includes("負債風險"))).toBe(true);
    });

    it('should apply heavy penalty for "Delusional" status', () => {
      const delusionalUser = createPersona({
        origin_profile: {
          dna: {
            reality_check: { coherence_level: "Delusional" }
          }
        }
      });

      const result = calculateConversionScore(delusionalUser);

      // Delusional logic: Friction * 1.8
      expect(result.resistance.isRealityLocked).toBe(true);
      expect(result.blockers.some(b => b.label.includes("認知偏離"))).toBe(true);
    });

    it('should balance score for "Rational" users with moderate constraints', () => {
      const rationalUser = createPersona({
        context_profile: { marketing_archetype: { decision_archetype: "考據型 (Rational)" } },
        behavioral_pattern: { depth: { avg_pages_per_session: 10 } } // Deep research
      });

      const result = calculateConversionScore(rationalUser);

      // Deep research adds drive (+15), Rational implies caution but not blocker
      expect(result.marketingFlavor).toContain("理性");
      expect(result.drive.score).toBeGreaterThan(60);
      expect(result.sentiment).not.toBe("極低 (Cold)");
    });

  });
});