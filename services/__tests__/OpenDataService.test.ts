import { describe, it, expect } from 'vitest';
import { openDataService } from '../OpenDataService';
import { OCCUPATION_TIME_PRINTS } from '../../data/open_data/time_patterns';

// Helper to create a specific time pattern array (0-23 hours)
const createTimePattern = (activeHours: number[], weight: number = 100): number[] => {
  const pattern = new Array(24).fill(0);
  activeHours.forEach(h => {
    if (h >= 0 && h < 24) pattern[h] = weight;
  });
  return pattern;
};

describe('OpenDataService: The Math Layer', () => {

  describe('predictProfessionFromTime (Cosine Similarity)', () => {
    
    it('should correctly identify a "Standard 9-to-5" pattern', () => {
      // Commute times (7-8, 18-19) + Lunch (12) + Evening relax (20-22)
      // This strongly correlates with standard office work structure
      const officeWorkerPattern = createTimePattern([7, 8, 12, 18, 19, 20, 21, 22]);
      
      const result = openDataService.predictProfessionFromTime(officeWorkerPattern);
      const topMatch = result[0];

      expect(topMatch).toBeDefined();
      expect(topMatch.match.id).toBe('standard_9to5');
      expect(topMatch.confidence).toBeGreaterThan(60); // Should be a strong match
    });

    it('should correctly identify a "Night Owl / Tech" pattern', () => {
      // Late start (10am) + Deep focus late night (22:00 - 02:00)
      const techPattern = createTimePattern([10, 11, 14, 15, 16, 22, 23, 0, 1, 2]);
      
      const result = openDataService.predictProfessionFromTime(techPattern);
      const topMatch = result[0];

      // "tech_crunch_dev" or "student_schedule" often overlap, but late night work flow is specific to tech
      expect(['tech_crunch_dev', 'night_life_entertainment', 'student_schedule']).toContain(topMatch.match.id);
      expect(topMatch.confidence).toBeGreaterThan(50);
    });

    it('should correctly identify "Early Bird" pattern', () => {
      // 4am - 7am active
      const earlyPattern = createTimePattern([4, 5, 6, 7]);
      
      const result = openDataService.predictProfessionFromTime(earlyPattern);
      const topMatch = result[0];

      expect(topMatch.match.id).toBe('early_bird_routine');
    });

    it('should return empty array for invalid input', () => {
      const result = openDataService.predictProfessionFromTime([]);
      expect(result).toEqual([]);
    });
  });

  describe('calculateProductBurden (Amortization Physics)', () => {
    
    it('should handle monthly subscriptions correctly', () => {
      const price = 399; // Netflix-like
      const burden = openDataService.calculateProductBurden(price, 'Monthly', 'Streaming');
      expect(burden).toBe(399); // No amortization
    });

    it('should amortize yearly subscriptions', () => {
      const price = 3600; 
      const burden = openDataService.calculateProductBurden(price, 'Yearly', 'Software');
      expect(burden).toBe(300); // 3600 / 12
    });

    it('should apply different baselines for Durable vs Consumable goods (One-time)', () => {
      // 1. Durable (e.g., iPhone) - Base 24 months
      const phonePrice = 24000;
      const phoneBurden = openDataService.calculateProductBurden(phonePrice, 'One-time', '3C/Phone');
      // 24000 / 24 = 1000
      expect(phoneBurden).toBeCloseTo(1000, -1); 

      // 2. Consumable (e.g., Fancy Dinner) - Base 1 month
      const dinnerPrice = 2000;
      const dinnerBurden = openDataService.calculateProductBurden(dinnerPrice, 'One-time', 'Food');
      // 2000 / 1 = 2000
      expect(dinnerBurden).toBe(2000);
    });
  });

  describe('calculateAffordability (Economic Ratio)', () => {
    // Note: These tests depend on the static constants in income_distribution.ts
    // For Age 30-34:
    // Median (Stable): ~750k/yr -> ~55k/mo -> Disposable ~38k
    // P10 (Survival): ~350k/yr -> ~26k/mo -> Disposable ~18k
    // P99 (Elite): ~3.5M/yr -> ~260k/mo -> Disposable ~180k

    it('should return high score (1.0) for negligible burden', () => {
      const monthlyBurden = 100; // e.g. iCloud
      const score = openDataService.calculateAffordability(monthlyBurden, 'Stable', '30-34');
      
      // 100 / 38000 < 5%, so score should be 1.0
      expect(score).toBe(1.0);
    });

    it('should return near-zero score for impossible burden (Survival Class)', () => {
      const monthlyBurden = 20000; // High rent or car loan
      const score = openDataService.calculateAffordability(monthlyBurden, 'Survival', '30-34');
      
      // Survival income ~18k. Burden 20k. Ratio > 1.0.
      // Should be heavily penalized.
      expect(score).toBeLessThan(0.1);
    });

    it('should reflect income tier differences for the same product', () => {
      const luxuryBagBurden = 5000; // Amortized cost of a 120k bag over 24mo
      
      const scoreForPoor = openDataService.calculateAffordability(luxuryBagBurden, 'Survival', '30-34');
      const scoreForElite = openDataService.calculateAffordability(luxuryBagBurden, 'Elite', '30-34');

      // 5k is ~27% of Survival income -> High penalty
      // 5k is ~2.7% of Elite income -> No penalty
      expect(scoreForPoor).toBeLessThan(0.8);
      expect(scoreForElite).toBeGreaterThan(0.9);
    });

    it('should apply linear penalty for moderate burdens', () => {
      // Stable income ~38k.
      // Burden 10k -> Ratio ~0.26 (26%)
      // 5% < Ratio < 60%, should be somewhere in between
      const score = openDataService.calculateAffordability(10000, 'Stable', '30-34');
      
      expect(score).toBeLessThan(1.0);
      expect(score).toBeGreaterThan(0.1);
    });

  });

});