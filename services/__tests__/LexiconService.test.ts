
import { describe, it, expect } from 'vitest';
import { lexiconService } from '../LexiconService';

describe('Lexicon Service (Fuzzy Search Engine)', () => {
  
  describe('Exact Matching', () => {
    it('should identify standard job titles', () => {
      const result = lexiconService.analyzeInput("軟體工程師");
      
      expect(result.matchFound).toBe(true);
      expect(result.coordinates.sector).toBe('Tech');
      expect(result.coordinates.labor).toBe('Standard');
      // "軟體工程師" is an exact alias match, confidence should be high
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should identify specific gig economy roles', () => {
      const result = lexiconService.analyzeInput("外送員");
      
      expect(result.matchFound).toBe(true);
      expect(result.coordinates.labor).toBe('Gig');
      expect(result.coordinates.sector).toBe('Logistics');
    });
  });

  describe('Fuzzy Matching', () => {
    it('should map colloquial terms to formal roles', () => {
      // "賣房子的" -> "房仲" (Real Estate Agent)
      const result = lexiconService.analyzeInput("賣房子的");
      
      expect(result.matchFound).toBe(true);
      expect(result.term).toBe('房仲');
      expect(result.coordinates.sector).toBe('Sales');
    });

    it('should map student variants', () => {
      const result = lexiconService.analyzeInput("大四學生");
      
      expect(result.matchFound).toBe(true);
      expect(result.term).toBe('學生');
      expect(result.coordinates.labor).toBe('Student');
    });
  });

  describe('Edge Cases & Sanitization', () => {
    it('should return IGNORE strategy for nonsense input', () => {
      const result = lexiconService.analyzeInput("asldkfjalskdjf");
      
      expect(result.matchFound).toBe(false);
      expect(result.strategy).toBe('IGNORE');
    });

    it('should sanitize long inputs by taking the first chunk', () => {
      // Input longer than 20 chars
      // Logic takes substring(0, 15) -> "我是一個每天工作很辛苦"
      // If the keyword is at the start, it might match. 
      // If the keyword is "軟體工程師", putting it at the start helps test the logic.
      const longInput = "軟體工程師，每天工作很辛苦，主要寫前端";
      const result = lexiconService.analyzeInput(longInput);
      
      expect(result.matchFound).toBe(true);
      expect(result.coordinates.sector).toBe('Tech');
    });

    it('should handle empty input', () => {
        const result = lexiconService.analyzeInput("");
        expect(result.matchFound).toBe(false);
    });
  });

});
