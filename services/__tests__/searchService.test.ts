
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeKeywordIntent } from '../searchService';
import { DigitalTwinPersona } from '../../types';

// Mock dependencies
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    }))
  };
});

const originalEnv = process.env;

describe('Search Service (Intent Prism Engine)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Minimal mock needed for the prompt builder
  const mockPersona = {
      origin_profile: { skeleton: { role: 'Tester' } },
      context_profile: { life_stage: 'User', marketing_archetype: { decision_archetype: 'General' } },
      constraints: { money: { spending_power_level: 'Mid' } }
  } as DigitalTwinPersona;

  it('should parse a valid Intent Prism response correctly', async () => {
    const mockResponse = {
      states: [
        { 
            state_type: 'Urgent_Pain', 
            label: '急迫痛點', 
            validity_score: 90,
            search_queries: ['help', 'urgent'],
            inner_monologue: 'I need this now',
            context_trigger: 'Trigger',
            content_strategy: { high_validity: { title: 'A', reason: 'B' }, low_validity: { title: 'C', reason: 'D' } }
        },
        { state_type: 'Rational_Comparison', label: '理性比較', validity_score: 70 },
        { state_type: 'Skeptical_Resistance', label: '懷疑抗性', validity_score: 40 }
      ]
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockResponse)
    });

    const result = await analyzeKeywordIntent(mockPersona, "test keyword");

    expect(result.keyword).toBe("test keyword");
    expect(result.analyzed_at).toBeDefined();
    expect(result.states).toHaveLength(3);
    
    // Validate State Ordering/Existence
    const painState = result.states.find(s => s.state_type === 'Urgent_Pain');
    expect(painState).toBeDefined();
    expect(painState?.validity_score).toBe(90);
  });

  it('should throw error on invalid structure (missing states array)', async () => {
    // Simulate AI returning a different structure or empty object
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ wrong_key: [] })
    });

    await expect(analyzeKeywordIntent(mockPersona, "fail")).rejects.toThrow("Invalid Intent Prism output");
  });

  it('should throw error if fewer than 3 states are returned', async () => {
    // Simulate incomplete analysis
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ states: [{ state_type: 'Urgent_Pain' }] })
    });

    await expect(analyzeKeywordIntent(mockPersona, "fail")).rejects.toThrow("Invalid Intent Prism output");
  });
});
