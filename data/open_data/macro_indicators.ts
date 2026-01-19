
import { VerifiableDataset } from '../types_provenance';

// SOURCE: DGBAS (Directorate-General of Budget, Accounting and Statistics) & CCI Research
// TIMESTAMP: Q4 2023 Snapshot

interface MacroData {
  CPI_YOY: number;
  CCI_SCORE: number;
  ECONOMIC_LIGHT_SCORE: number;
}

export const MACRO_INDICATORS: VerifiableDataset<MacroData> = {
  meta: {
    source: "DGBAS & NCU (中央大學台灣經濟發展研究中心)",
    dataset_id: "Consumer Price Indices & CCI",
    published_at: "2023-12",
    confidence: 1.0
  },
  data: {
    // 消費者物價指數年增率 (Inflation Pressure)
    // High (>3%) implies reduced spending power for non-essentials.
    CPI_YOY: 2.9, 

    // 消費者信心指數 (Consumer Confidence Index)
    // Baseline 100. <100 means pessimistic.
    // Current status: Conservative.
    CCI_SCORE: 73.5, 

    // 景氣對策信號 (Economic Light)
    // Blue(1), Yellow-Blue(2), Green(3), Yellow-Red(4), Red(5)
    ECONOMIC_LIGHT_SCORE: 2, // Yellow-Blue (Sluggish)
  }
};

// 基礎轉換率參考值 (Baseline Conversion Rates)
// Used as the P_base in the probability formula.
export const CATEGORY_BASE_RATES: Record<string, number> = {
  'Luxury': 0.5,      // 精品/高價車
  'Durable': 1.5,     // 3C/家電
  'Semi_Durable': 3.0, // 服飾/鞋包
  'Consumable': 5.0,   // 食品/日用
  'Digital': 2.5,      // 軟體/訂閱
  'Service': 2.0,      // 服務/課程
  'General': 2.0       // Fallback
};
