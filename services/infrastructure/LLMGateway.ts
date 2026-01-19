
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

// Singleton instance container
let aiInstance: GoogleGenAI | null = null;

/**
 * 取得 Google GenAI 客戶端實例 (Singleton Pattern)
 */
const getAiClient = (): GoogleGenAI => {
  if (!aiInstance) {
    if (!API_KEY) {
      console.error("API_KEY environment variable is not set");
      throw new Error("API_KEY environment variable is not set");
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

/**
 * Helper: Strict delay
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper: Retry an async function with exponential backoff.
 * 統一管理的重試邏輯，處理 Rate Limit (429) 與 Server Error (5xx)。
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 2000,
  stageName = "API Call",
  logFatal = true 
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || error.code;
    const msg = (error.message || "").toLowerCase();

    const isRateLimit = 
      status === 429 || 
      status === 'RESOURCE_EXHAUSTED' ||
      msg.includes('429') || 
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('exhausted');

    const isServerError = 
      status === 500 || 
      status === 503 || 
      status === 504 ||
      msg.includes('internal error') ||
      msg.includes('overloaded');

    const isRetryable = 
      retries > 0 && (
        isRateLimit ||
        isServerError ||
        msg.includes('fetch failed') ||
        msg.includes('network error') ||
        msg.includes('rpc failed') ||
        msg.includes('json') ||   
        msg.includes('syntax') || 
        error instanceof SyntaxError 
      );

    if (isRetryable) {
      let waitTime = baseDelay;
      if (isRateLimit) waitTime = Math.max(baseDelay, 10000); // 429 至少等 10秒
      else if (isServerError) waitTime = Math.max(baseDelay, 6000);
      
      console.warn(`[${stageName}] failed (Status: ${status || 'Error'}). Retrying in ${waitTime/1000}s... (${retries} attempts left).`);
      
      await delay(waitTime);
      return retryWithBackoff(fn, retries - 1, waitTime * 1.5, stageName, logFatal);
    }
    
    if (logFatal) {
      console.error(`[${stageName}] Fatal Error:`, error);
    } else {
      console.warn(`[${stageName}] Failed after retries (Non-fatal):`, error.message || error);
    }
    throw error;
  }
};

/**
 * LLMGateway
 * 負責與 LLM 互動的統一入口。
 * 目前作為 Facade，未來可擴充為處理 token 計算、模型路由的中心。
 */
export class LLMGateway {
  /**
   * 取得底層 SDK 客戶端 (用於需要直接操作 SDK 的場景)
   */
  static getClient(): GoogleGenAI {
    return getAiClient();
  }

  /**
   * 建立對話 Session
   */
  static createChat(model: string, config?: any): Chat {
    const ai = getAiClient();
    return ai.chats.create({
      model,
      config
    });
  }
  
  /**
   * 生成內容 (包含自動重試機制)
   */
  static async generateContent(
    model: string, 
    contents: any, 
    config?: any, 
    retries: number = 3, 
    stageName: string = "Generate Content"
  ): Promise<GenerateContentResponse> {
    const ai = getAiClient();
    return retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model,
        contents,
        config
      });
    }, retries, 2000, stageName);
  }
}
