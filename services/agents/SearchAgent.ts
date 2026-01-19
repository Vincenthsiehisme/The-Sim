
import { IntentPrismResult, DigitalTwinPersona } from '../../types';
import { INTENT_PRISM_INSTRUCTION, buildIntentPrismPrompt } from '../../prompts';
import { trySafeJsonParse, cleanJsonString } from '../../utils/normalization';
import { LLMGateway } from '../infrastructure/LLMGateway';

export class SearchAgent {
  public static async analyzeIntent(
    persona: DigitalTwinPersona,
    keyword: string
  ): Promise<IntentPrismResult> {
    try {
      const ai = LLMGateway.getClient();
      const model = "gemini-3-flash-preview";

      const prompt = buildIntentPrismPrompt(persona, keyword);

      const response = await ai.models.generateContent({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: INTENT_PRISM_INSTRUCTION }, { text: prompt }] }
          ],
          config: {
            temperature: 0.8, // Creative interpretation
          }
      });

      const result = trySafeJsonParse<{ states: any[] }>(cleanJsonString(response.text || "{}"));
      
      if (!result.states || !Array.isArray(result.states) || result.states.length < 3) {
          throw new Error("Invalid Intent Prism output structure.");
      }

      return {
          keyword: keyword,
          analyzed_at: new Date().toISOString(),
          states: result.states
      };

    } catch (error) {
      console.error("Intent Prism Analysis Failed:", error);
      throw error;
    }
  }
}
