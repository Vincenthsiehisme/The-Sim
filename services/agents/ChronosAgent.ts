
import { ChronosReport, ChronosMode, DigitalTwinPersona } from '../../types';
import { CHRONOS_INSTRUCTION, buildChronosPrompt } from '../../prompts';
import { trySafeJsonParse, cleanJsonString } from '../../utils/normalization';
import { LLMGateway, retryWithBackoff } from '../infrastructure/LLMGateway';

/**
 * Helper: Format Date YYYY/MM/DD
 */
const formatDate = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '/');

/**
 * Helper: Add Days
 */
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export class ChronosAgent {
  public static async generateReport(persona: DigitalTwinPersona): Promise<ChronosReport> {
    return retryWithBackoff(async () => {
      const ai = LLMGateway.getClient();
      const model = "gemini-3-flash-preview";

      // 1. Determine Mode (Strict Tri-State Routing)
      let mode: ChronosMode = 'live';
      const sourceType = persona.origin_profile?.source_type;
      const window = persona.data_window;

      if (sourceType === 'upload' && window?.start_date && window?.end_date) {
          mode = 'forensic';
      } else {
          mode = 'live'; // Default for Synthetic
      }

      // 2. Calculate Precise Analysis Date String
      const today = new Date();
      let analysisDateStr = formatDate(today);

      if (mode === 'forensic' && window?.start_date && window?.end_date) {
          const start = window.start_date.split(' ')[0].replace(/-/g, '/');
          const end = window.end_date.split(' ')[0].replace(/-/g, '/');
          analysisDateStr = `${start} - ${end}`;
      } else {
          const nextMonth = addDays(today, 30);
          analysisDateStr = `${formatDate(today)} - ${formatDate(nextMonth)} (Live)`;
      }

      // 3. Prepare Context Variables
      const role = persona.origin_profile?.skeleton?.role || persona.context_profile.life_stage || "User";
      const dateInfo = {
          start: window?.start_date,
          end: window?.end_date,
          role: role
      };

      // 4. Build Prompt
      const prompt = buildChronosPrompt(mode, dateInfo);

      // 5. Call AI with Search Tool
      const response = await ai.models.generateContent({
          model: model,
          contents: [
            { role: 'user', parts: [{ text: CHRONOS_INSTRUCTION }, { text: prompt }] }
          ],
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.7, 
          }
      });

      const report = trySafeJsonParse<ChronosReport>(cleanJsonString(response.text || "{}"));
      
      // Fallback if parsing fails
      if (!report.summary) {
          return {
              mode: mode,
              analysis_date: analysisDateStr,
              timeline: [],
              summary: "無法取得時空背景資訊，請稍後再試。(System Error)",
          };
      }

      // Override AI's date with our strictly calculated system date
      report.mode = mode;
      report.analysis_date = analysisDateStr;

      return report;

    }, 2, 3000, "Chronos Oracle");
  }
}
