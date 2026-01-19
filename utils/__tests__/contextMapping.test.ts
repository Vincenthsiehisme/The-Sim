
import { describe, it, expect } from 'vitest';
import { getTierConfig, PLATFORM_PRESETS } from '../contextMapping';

describe('Context Mapping (Social Physics Engine)', () => {
  
  describe('getTierConfig (Scenario Mode Adaptation)', () => {
    it('should return Sales-oriented labels for Sales mode', () => {
      const config = getTierConfig('sales');
      
      // Test Budget Anxiety tiers in Sales Mode
      // 0 (Low Anxiety) -> Rich/Generous
      // 4 (High Anxiety) -> Poor/Survival
      expect(config.budget_anxiety[0].label).toBe("闊綽"); 
      expect(config.budget_anxiety[4].label).toBe("生存");
      
      // Test Purchase Intent
      expect(config.purchase_intent[4].label).toBe("急迫需求");
    });

    it('should return Friend-oriented labels for Friend mode', () => {
      const config = getTierConfig('friend');
      
      // Test Budget Anxiety (Generosity context)
      expect(config.budget_anxiety[0].label).toBe("慷慨");
      expect(config.budget_anxiety[4].label).toBe("哭窮");
      
      // Test Patience (Listening context)
      expect(config.patience[0].label).toBe("插嘴王");
      expect(config.patience[4].label).toBe("心靈導師");
    });

    it('should return Content-oriented labels for Content mode', () => {
      const config = getTierConfig('content');
      
      // Test Patience (Reading context)
      expect(config.patience[0].label).toBe("標題掃描");
      expect(config.patience[4].label).toBe("重度鑽研");
    });
  });

  describe('PLATFORM_PRESETS (Social Environment)', () => {
    it('should configure PTT with low social mask (Toxic/Honest)', () => {
      const ptt = PLATFORM_PRESETS['PTT'];
      // PTT users have low social mask (anonymous, direct) and low patience
      expect(ptt.modifiers.social_mask).toBe(10); 
      expect(ptt.modifiers.patience).toBeLessThan(50);
    });

    it('should configure LINE with high social mask (Polite)', () => {
      const line = PLATFORM_PRESETS['LINE'];
      // LINE (Real identity/Family) has high social mask and high patience
      expect(line.modifiers.social_mask).toBeGreaterThan(80);
      expect(line.modifiers.patience).toBeGreaterThan(60);
    });

    it('should configure IG with medium-high mask (Image Conscious)', () => {
      const ig = PLATFORM_PRESETS['IG'];
      // IG focuses on image (Mask)
      expect(ig.modifiers.social_mask).toBe(70);
    });
  });
});
