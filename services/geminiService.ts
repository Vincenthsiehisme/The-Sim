
import { DigitalTwinPersona, SimulationResult, SimulationModifiers, ScenarioMode, OriginProfile, PersonaDNA, GenderOption, ChronosReport, SociologyOverrides, FrictionDimensionKey } from '../types';
import type { Chat } from "@google/genai";
import { 
  ChronosAgent, 
  PrismAgent, 
  SimulationAgent, 
  PersonaAgent, 
  MirrorResult 
} from './agents';

// === FACADE LAYER ===
// This file now serves as an entry point for the frontend, delegating work to specialized agents.

export const generateChronosReport = async (persona: DigitalTwinPersona): Promise<ChronosReport> => {
  return ChronosAgent.generateReport(persona);
};

export const mirrorPersonaFromProduct = async (
  input: {
    name: string;
    priceAmount: string;
    priceUnit: string;
    priceCycle: string;
    category?: string;
    specs: string[];
    competitorName: string;
    competitorPrice?: string;
    focusDimension?: FrictionDimensionKey;
  }
): Promise<MirrorResult> => {
  return PrismAgent.mirrorPersonaFromProduct(input);
};

export const enrichPersonaRole = async (
  role: string, 
  age: string, 
  income: string,
  shadowId?: string, 
  gender?: GenderOption, 
  resonance?: any,
  overrides?: SociologyOverrides
): Promise<PersonaDNA> => {
  return PersonaAgent.enrichRole(role, age, income, shadowId, gender, resonance, overrides);
};

export const synthesizePersonaData = async (
  skeleton: { role: string, age: string, income: string, gender?: GenderOption },
  shadowId: string,
  chaos: number,
  dna?: PersonaDNA
): Promise<string> => {
  return PersonaAgent.synthesizeData(skeleton, shadowId, chaos, dna);
};

export const inferCsvSchema = async (csvText: string): Promise<Record<string, string> | null> => {
  return PersonaAgent.inferCsvSchema(csvText);
};

export const analyzeDataAndCreatePersona = async (
  rawData: string, 
  contextOptions?: { 
      dataSource?: string; 
      scenario?: string; 
      totalRows?: number;
      creationConfig?: OriginProfile;
  },
  onProgress?: (stage: string) => void
): Promise<DigitalTwinPersona> => {
  return PersonaAgent.analyzeAndCreate(rawData, contextOptions, onProgress);
};

export const createChatSession = (persona: DigitalTwinPersona): Chat => {
  return PersonaAgent.createChatSession(persona);
};

export function sendMessageToTwinStream(
  message: string, 
  chat: Chat, 
  modifiers: SimulationModifiers | null, 
  scenario: ScenarioMode
): AsyncGenerator<string, void, unknown> {
  return PersonaAgent.sendMessageStream(message, chat, modifiers, scenario);
}

export const runMarketingSimulation = async (
  persona: DigitalTwinPersona, 
  campaignName: string, 
  copyA: string, 
  copyB: string, 
  modifiers: SimulationModifiers | null, 
  scenario: ScenarioMode
): Promise<SimulationResult> => {
  return SimulationAgent.runSimulation(persona, campaignName, copyA, copyB, modifiers, scenario);
};

export const generateAvatarFromPersona = async (persona: DigitalTwinPersona): Promise<string | null> => {
  return PersonaAgent.generateAvatar(persona);
};
