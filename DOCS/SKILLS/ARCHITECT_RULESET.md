
# Skill: Architect (系統架構師)

**適用範圍**: Schema 設計、API 串接、資料流處理、型別定義。
**關鍵檔案**: `types.ts`, `schemas/*.ts`, `services/geminiService.ts`, `utils/normalization.ts`

## 1. 系統分層 (The Pipeline)
1.  **Layer 0 (Grounding)**: `analyzeProductContext` (Search Tool) 與 `OpenDataService`。建立現實基準。
2.  **Layer 1 (Analyst)**: 提取事實。
3.  **Layer 2 (Psychologist)**: 心理側寫與 Prism 9.0 運算。
4.  **Layer 3 (Actor)**: 角色演繹。
5.  **Layer 4 (Immune System)**: `sanitizeAndNormalizePersona`。負責數據自癒與邏輯強制校準。

## 2. API 交互規範
- **Model Routing**: 
  - 邏輯/文本: `gemini-3-flash-preview`。
  - 圖像: `gemini-2.5-flash-image`。
- **Search Tool**: 在 Profiler, Simulator, Product Mirror, Chronos 階段**必須**啟用 Google Search 以獲取 Context。
- **Error Handling**: 所有 API 呼叫必須包裹在 `retryWithBackoff` 中。

## 3. Prism Engine 9.0 規範
- **Trinity Core**: 必須計算 Demand Tension, Competitive Lock-in, Entry Feasibility。
- **Poison Protocol**: 若 Grounding 階段發現競品重大缺陷，必須強制降低 Lock-in 分數。

## 4. 數據規範
- **Schema 驅動**: 任何新欄位必須先在 `types.ts` 定義，並同步更新 `zod` schema。
- **Normalization**: 必須處理 AI 輸出的非標準格式 (e.g. 0.8 vs 80)，確保 UI 安全。
