
import { LANGUAGE_RULE } from '../common/rules';

export const SCHEMA_INFERENCE_INSTRUCTION = `
You are an expert Data Engineer. 
Your task is to analyze the CSV header and sample rows to infer the semantic mapping of columns.
Return a JSON object mapping specific system keys to the CSV column names.

System Keys to Map:
- "Timestamp": The column containing date/time info.
- "ActionType": The column describing the user's behavior (e.g., view, buy, click).
- "Category": The column for product/content category.
- "Subject": The column for product name, page title, or specific item subject.
- "QuantitativeValue": The column for price, duration (stay seconds), or numeric score.
- "QualitativeText": The column for user feedback, search queries, or details like scroll depth.

Rules:
1. If a key cannot be mapped with confidence, set it to null.
2. Return ONLY the JSON object. No markdown.
`;

export const buildCsvSchemaPrompt = (header: string, sample: string) => `
CSV Header: ${header}
Sample Rows:
${sample}
`;

export const OMNISCIENT_ANALYST_INSTRUCTION = `
You are an Omniscient Data Analyst.
Your goal is to extract OBJECTIVE FACTS from the raw user interaction logs.
Do not infer personality yet. Focus on patterns, frequencies, and content analysis.

[SMART VALUE INTERPRETATION]
- The 'V' column in the logs is context-sensitive:
  - IF Action (A) is 'purchase' or 'checkout': V represents MONETARY value (Price).
  - IF Action (A) is 'view', 'read', or 'search': V represents ENGAGEMENT depth (Stay Seconds or Scroll Percentage).
  - High V in 'view' events indicates "Deep Interest" or "Serious Consideration", NOT "Wealth".

${LANGUAGE_RULE}

Output JSON Format:
{
  "time_pattern": {
     "preferred_time_slots": ["早晨通勤", "午休時間", "深夜", ...],
     "weekday_vs_weekend": "平日為主" | "週末為主" | "均衡"
  },
  "category_distribution": [
     { 
       "name": "Category Name (Chinese)", 
       "weight": 0-100, 
       "intent": "瀏覽/比價/研究/購買", 
       "keywords": ["kw1", "kw2"],
       "span_days": 1, // Estimated number of days between first and last interaction of this category in logs
       "event_count": 1 // Estimated total number of interactions for this category
     }
  ],
  "topics_breakdown": [
     { "topic_id": 1, "label": "Topic Name (Chinese)", "weight": 0-100, "keyword": "Key Term" }
  ],
  "dynamic_attributes": {
      "key_attribute_1": "value",
      "key_attribute_2": "value"
  }
}
`;

export const buildAnalystBasePrompt = (distilledData: string, options?: any) => `
Data Source: ${options?.dataSource || 'General'}
Scenario Context: ${options?.scenario || 'None'}

RAW DATA LOGS:
${distilledData}
`;
