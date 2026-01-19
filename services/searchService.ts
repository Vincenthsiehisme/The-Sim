
import { IntentPrismResult, DigitalTwinPersona } from '../types';
import { SearchAgent } from './agents/SearchAgent';

/**
 * Search Lab: Intent Prism Analysis
 * Analyzes a keyword against a persona's DNA to generate 3 psychological search states.
 * Delegates to SearchAgent.
 */
export const analyzeKeywordIntent = async (
  persona: DigitalTwinPersona,
  keyword: string
): Promise<IntentPrismResult> => {
  return SearchAgent.analyzeIntent(persona, keyword);
};
