
import { DigitalTwinPersona, SimulationResult, SimulationModifiers, ScenarioMode } from '../../types';
import { MARKETING_SIMULATION_INSTRUCTION, buildMarketingSimulationContext, buildMarketingSimulationInput } from '../../prompts';
import { trySafeJsonParse, cleanJsonString } from '../../utils/normalization';
import { LLMGateway, retryWithBackoff } from '../infrastructure/LLMGateway';

export class SimulationAgent {
  public static async runSimulation(
    persona: DigitalTwinPersona, 
    campaignName: string, 
    copyA: string, 
    copyB: string, 
    modifiers: SimulationModifiers | null, 
    scenario: ScenarioMode
  ): Promise<SimulationResult> {
    return retryWithBackoff(async () => {
      const ai = LLMGateway.getClient();
      const model = "gemini-3-flash-preview";
      
      const systemPrompt = buildMarketingSimulationContext(persona, modifiers, scenario);
      const userPrompt = buildMarketingSimulationInput(campaignName, copyA, copyB);
      
      const response = await ai.models.generateContent({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: MARKETING_SIMULATION_INSTRUCTION }, { text: systemPrompt }, { text: userPrompt }] }
          ],
          config: { responseMimeType: 'application/json', temperature: 0.5 }
      });
      
      const result = trySafeJsonParse<SimulationResult>(cleanJsonString(response.text || "{}"));
      if (!result.winner || !result.scores) throw new Error("Invalid simulation result structure");
      
      return result;
    }, 2, 2000, "Marketing Simulation");
  }
}
