
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateChronosReport, mirrorPersonaFromProduct } from '../geminiService';
import { GoogleGenAI } from '@google/genai';
import { DigitalTwinPersona } from '../../types';

// Mock the GoogleGenAI SDK
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      },
      chats: {
        create: vi.fn().mockReturnValue({
            sendMessageStream: vi.fn()
        })
      }
    }))
  };
});

// Mock environment variable
const originalEnv = process.env;

describe('Gemini Service Resilience (AI Integration Layer)', () => {
  
  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const mockPersona: DigitalTwinPersona = {
    twin_id: 'test_twin',
    source_user_ids: [],
    data_window: { start_date: '2023-01-01', end_date: '2023-01-02' },
    confidence_score: 80,
    last_updated_at: '',
    origin_profile: { source_type: 'synthetic' },
    context_profile: { life_stage: 'User', age_bucket: '25-34', gender_guess: 'Male', location_level: 'Taipei', device_pref: [], channel_mix: {}, visit_recency: '', engagement_level: '' },
    behavioral_pattern: { frequency: { visits_per_month: 0, active_days_ratio: 0 }, depth: { avg_pages_per_session: 0 }, content_preference: { top_categories: [], top_lda_topics: [] }, time_pattern: { preferred_time_slots: [] }, ad_interaction: { click_rate: 0, campaign_variety: 0, format_preference: [] } },
    personality_profile: { summary_tags: [], dimensions: { novelty_seeking: { level: 'Mid', base_score: 50, evidence: '' }, planning_vs_spontaneous: { level: 'Mid', base_score: 50, evidence: '' }, risk_attitude: { level: 'Mid', base_score: 50, evidence: '' }, social_orientation: { level: 'Mid', base_score: 50, evidence: '' }, financial_sensitivity: { level: 'Mid', base_score: 50, evidence: '' } } },
    motivations: { primary_goals: [], secondary_goals: [], latent_needs: [] },
    constraints: { time: { available_time_pattern: '', evidence: '' }, money: { spending_power_level: 'Mid', price_sensitivity: 'Mid', evidence: '' }, knowledge: { domain_knowledge_level: '', evidence: '' }, emotional: { change_aversion: '', evidence: '' }, access: {} },
    contradictions_and_insights: { conflicts: [], non_intuitive_insights: [], paradoxical_behaviors: [] },
    interaction_style: { tone_preference: [], content_format_preference: [], length_tolerance: '', ad_sensitivity: '', privacy_sensitivity: '', recommended_channels: [], speaking_style: { emoji_usage: '', punctuation_style: '', code_switching: '', common_phrases: [] }, dialogue_style: { response_length: '', proactivity: '', digression_rate: '', conflict_style: '' } },
    system_state: { economic_logic: { label: '', behavior_rule: '' }, composite_flaw: { label: '', description: '', trigger_rule: '' }, sample_dialogues: [] }
  };

  describe('generateChronosReport', () => {
    it('should parse valid JSON response correctly', async () => {
      const mockResponse = {
        summary: "Market is volatile.",
        timeline: [],
        current_state: { liquidity: "Low", bandwidth: "Occupied" }
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockResponse)
      });

      const report = await generateChronosReport(mockPersona);

      expect(report.summary).toBe("Market is volatile.");
      expect(report.current_state?.liquidity).toBe("Low");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle Markdown code blocks in JSON response (Clean Logic)', async () => {
      const dirtyJson = "```json\n" + JSON.stringify({ summary: "Cleaned" }) + "\n```";
      
      mockGenerateContent.mockResolvedValue({
        text: dirtyJson
      });

      const report = await generateChronosReport(mockPersona);
      expect(report.summary).toBe("Cleaned");
    });

    it('should retry on API failure (Resilience)', async () => {
        // Mock implementation: First call throws, second returns success
        mockGenerateContent
            .mockRejectedValueOnce(new Error('500 Internal Server Error'))
            .mockResolvedValueOnce({ text: JSON.stringify({ summary: "Success after retry" }) });

        const report = await generateChronosReport(mockPersona);

        expect(report.summary).toBe("Success after retry");
        expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed JSON by returning fallback structure', async () => {
        // Mock return incomplete JSON
        mockGenerateContent.mockResolvedValue({
            text: "{ summary: 'Bad JSON'" // Missing closing brace
        });

        const report = await generateChronosReport(mockPersona);

        // Should use fallback provided in geminiService.ts
        expect(report.summary).toContain("無法取得時空背景資訊");
        expect(report.timeline).toEqual([]);
    });
  });

  describe('mirrorPersonaFromProduct (Prism Engine)', () => {
      it('should handle Prism V3/V6/V9 legacy structure adaptation', async () => {
          // Mock logic for Product Grounding (Phase 0) then Mirror (Phase 1)
          // mirrorPersonaFromProduct calls generateContent multiple times (Grounding + Mirror)
          // We mock them sequentially.
          
          // Call 1: Grounding
          mockGenerateContent.mockResolvedValueOnce({
              text: JSON.stringify({ market_position: "Entry" })
          });

          // Call 2: Mirror
          const prismResponse = {
              version: "v9.0",
              product_context: { market_position: "Entry", monthly_burden: 500, price_cycle: "One-time" },
              battlegrounds: [
                  {
                      id: "The_Stretcher",
                      name: "Target A",
                      profile: "Profile A",
                      decision_unit: "Self",
                      leverage: { type: "Mechanism", method: "Justification", efficiency: 1.2 },
                      dimensions: {
                          value_gap: { score: 80, micro_tactic: "Discount" },
                          trust_gap: { score: 20, micro_tactic: "Proof" },
                          spec_gap: { score: 50, micro_tactic: "Specs" },
                          identity_gap: { score: 30, micro_tactic: "Brand" },
                          context_gap: { score: 40, micro_tactic: "Easy" },
                          knowledge_gap: { score: 10, micro_tactic: "Simple" }
                      }
                  }
              ],
              best_strategy: { target: "The_Stretcher", headline: "Win" }
          };

          mockGenerateContent.mockResolvedValueOnce({
              text: JSON.stringify(prismResponse)
          });

          const result = await mirrorPersonaFromProduct({
              name: "Product X",
              priceAmount: "1000",
              priceUnit: "NT$",
              priceCycle: "One-time",
              specs: [],
              competitorName: "Comp Y"
          });

          expect(result.candidates.length).toBeGreaterThan(0);
          expect(result.candidates[0].id).toContain('bg_');
          // Check if Reality-Anchored Score transformation worked
          // value_gap score 80 (High Pain) -> Base Potential 0.2
          // efficiency 1.2 -> Boost
          // Should be calculated correctly
          expect(result.diagnosis.dimensions.value_gap.score).toBe(80);
      });
  });

});
