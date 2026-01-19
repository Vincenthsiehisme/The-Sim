import { describe, it, expect } from 'vitest';
import { sanitizeAndNormalizePersona } from '../normalization';
import { BROKEN_AI_RESPONSE, PERFECT_AI_RESPONSE } from '../../__mocks__/personaFixtures';

describe('Normalization Layer (System Immune System)', () => {
  
  describe('Phase 1: Structural Repair', () => {
    it('should flatten legacy metrics into behavioral_pattern', () => {
      const result = sanitizeAndNormalizePersona(BROKEN_AI_RESPONSE);
      
      // 驗證：根目錄 metrics 是否被正確映射到 behavioral_pattern.frequency
      expect(result.behavioral_pattern.frequency.visits_per_month).toBe(50); // 0.8 * 100 or raw? normalizeScore handles <1
      // Note: BROKEN fixture uses 50, normalizeScore(50) -> 50.
    });

    it('should initialize missing arrays', () => {
      const result = sanitizeAndNormalizePersona(BROKEN_AI_RESPONSE);
      
      // 驗證：原本缺失的陣列是否被補上空陣列，防止 UI 崩潰
      expect(Array.isArray(result.behavioral_pattern.content_preference.top_categories)).toBe(true);
      expect(Array.isArray(result.motivations.primary_goals)).toBe(true);
    });
  });

  describe('Phase 2: Numeric Normalization', () => {
    it('should convert decimal scores (0.8) to percentages (80)', () => {
      const result = sanitizeAndNormalizePersona(BROKEN_AI_RESPONSE);
      
      // 0.8 should become 80
      const score = result.personality_profile.dimensions.novelty_seeking.base_score;
      expect(score).toBe(80);
    });

    it('should handle NaN gracefully', () => {
      const input = {
        behavioral_pattern: {
          frequency: { visits_per_month: "Not a Number" }
        }
      };
      const result = sanitizeAndNormalizePersona(input);
      expect(result.behavioral_pattern.frequency.visits_per_month).toBe(0);
    });
  });

  describe('Phase 3: Logic Inference (Self-Healing)', () => {
    it('should infer archetype based on frequency/depth if missing', () => {
      // Input has 50 interactions -> Should imply "Loyal" or active user
      const result = sanitizeAndNormalizePersona(BROKEN_AI_RESPONSE);
      
      const archetype = result.context_profile.marketing_archetype.decision_archetype;
      expect(archetype).toBeDefined();
      // Logic: freq > 10 -> Loyal
      expect(archetype).toContain('Loyal');
    });

    it('should infer speaking style from tone if missing', () => {
      const input = {
        interaction_style: { tone_preference: ["酸民", "Cynical"] }
      };
      const result = sanitizeAndNormalizePersona(input);
      
      const phrases = result.interaction_style.speaking_style.common_phrases;
      expect(phrases).toContain('笑死'); // "酸" 觸發 "笑死" 口頭禪
    });

    it('should infer flaw from extreme personality scores', () => {
      const input = {
        personality_profile: {
          dimensions: {
            planning_vs_spontaneous: { base_score: 80 } // High Impulse
          }
        },
        system_state: {}
      };
      const result = sanitizeAndNormalizePersona(input);
      
      const flaw = result.system_state.composite_flaw.label;
      expect(flaw).toBe('衝動控制困難');
    });
  });

  describe('Phase 4: Integrity Check', () => {
    it('should pass perfect data through without corruption', () => {
      const result = sanitizeAndNormalizePersona(PERFECT_AI_RESPONSE);
      
      expect(result.behavioral_pattern.frequency.visits_per_month).toBe(20);
      expect(result.context_profile.marketing_archetype.decision_archetype).toBe("衝動型 (Impulse)");
      expect(result.constraints.money.spending_power_level).toBe("高"); // Normalized to traditional chinese
    });
  });

});