
# Prompt Engineering Contracts

## 1. 模型與語言規範
- **核心模型**: `gemini-3-flash-preview` (Logic), `gemini-2.5-flash-image` (Avatar)。
- **語言**: 繁體中文（台灣習慣用語，如「CP值」、「結帳」）。

## 2. 工具使用協議 (Tool Use)
- **Google Search**: 
  - **Prism Engine**: 必須搜尋 "Competitor + 災情/缺點" 以獲取 Poison Protocol 參數。
  - **Chronos**: 必須搜尋 "Today's News/Weather" 以計算 Bandwidth。
- **禁令**: 嚴禁直接輸出搜尋摘要，必須內化為角色的知識或決策依據。

## 3. 場景模式協議 (Scenario Mode)
- **Sales**: 防禦/精算機制。
- **Content**: 好奇/注意力機制。
- **Friend**: 真實/卸下面具機制 (Low Face)。

## 4. <OS> 標籤規範 (Subtext)
- 當 `social_mask` < 30 或處於特殊心理狀態時，**強制**輸出 `<OS>` 標籤。
- UI 將其渲染為靛色背景與斜體字。

## 5. 意圖稜鏡協議 (Intent Prism Protocol)
- **定義**: 將單一 Persona 分裂為三種極端狀態。
- **狀態約束**:
  - **Urgent Pain**: 禁止理性分析，只求速效。
  - **Rational**: 禁止情緒化，只看規格與價格。
  - **Skeptic**: 預設敵意，搜尋關鍵字必須包含「詐騙、災情、PTT」。

## 6. Prism Engine v9.0 協議 (Trinity Core)
- **目標**: 生成 `PersonaCandidate`。
- **Trinity Core 計算**:
  - **Demand Tension**: 基於 Value Gap + Spec Gap。
  - **Competitive Lock-in**: 基於 Trust Gap + Identity Gap (若有 Grounding Flaw，強制降低分數)。
  - **Entry Feasibility**: 基於 Knowledge Gap + Context Gap。
- **Leverage 寫作**: 必須使用第一人稱「自我合理化 (Self-Rationalization)」口吻 (e.g. "雖然貴，但...")。

## 7. 測謊協議 (Polygraph Protocol)
- **Simulator**: 必須區分 `Verbal Response` (表面) 與 `Action Probability` (真實)。
- **Bluff Rule**: 若 Action < 30 但 Verbal 正面，標記為 Bluff。

## 8. 行為偽造協議 (Architect Protocol)
- **MECE Tags**: 生成的 CSV 必須反映 DNA 中的 `mece_tags` (如 Info Diet, Social Drive)。
- **Resonance Lock**: 若存在 `_generated_resonance`，必須在 CSV 中編織一段「搜尋 -> 比較 -> 猶豫」的微型劇本。
