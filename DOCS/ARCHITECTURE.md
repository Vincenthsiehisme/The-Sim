
# System Architecture: Digital Twin Pipeline

## 1. 核心設計哲學
本系統不直接分析大數據，而是模仿人類「形成印象」的過程：從碎片的行為記錄中，蒸餾出主觀的體感，最後形成穩定的人格。

## 2. 開發約束 (Governance)
**重要**: 系統的演進必須受到 `DOCS/DEVELOPMENT_PROTOCOL.md` 的約束。

## 3. 核心數據流轉 (The Core Pipeline)

### Step 0: 智慧蒸餾層 (Smart Distillation)
- **實作文件**: `utils/smartDistiller.ts`
- **任務**: 
  - 將萬筆原始行為壓縮為 ~300 筆高價值樣本。
  - 生成 `PerceptionSheet`（主觀體感，如「模糊記憶」）。

### Layer 1: 全知觀察者 (Omniscient Analyst)
- **模型**: `gemini-3-flash-preview` (Temp 0.2)
- **任務**: 根據樣本提取統計事實 (Time Pattern, Categories)。

### Layer 1.5: 社會學校正 (Open Data Grounding)
- **實作文件**: 
  - `services/OpenDataService.ts`
  - `data/taiwan_sociology.ts` (社會動力學引擎)
- **任務**: 
  - **Grounding**: 將模糊 Role 映射到真實台灣就業數據 (Income, Labor Mode)。
  - **Reality Check**: 判定角色是否存在「精緻窮 (Delusional)」或「隱形富豪 (Stealth Wealth)」。
  - **Output**: 產出 `SocialTension` 與 `RealityCheck`，強制注入下一層。

### Layer 2: 心理側寫師 (Psychologist Profiler)
- **模型**: `gemini-3-flash-preview` (Temp 0.8)
- **任務**: 推理行為背後的「動機冰山」與「性格特質」。

### Layer 3: 方法演技派 (Actor Simulation)
- **模型**: `gemini-3-flash-preview` (Temp 1.1)
- **任務**: 賦予分身語氣、人格瑕疵 (Composite Flaw) 與內心獨白。

### Layer 4: 系統免疫層 (Normalization / Self-Healing)
- **實作文件**: `utils/normalization.ts`
- **任務**: 
  - **結構修復**: 補完 AI 遺漏的陣列或欄位。
  - **邏輯自癒**: 若 AI 未給出性格分數，根據 Role 自動推導。
  - **情境加權**: 強制執行 Lab Mode 的使用者設定（如：若選「極端混亂」，強制覆寫 AI 的溫和數值）。

## 4. 衍生應用模組 (Application Modules)

### 4.1 角色實驗室 (Persona Lab)
支援從零生成合成數據：
1. **Profiler**: 生成 DNA 與 MECE Tags。
2. **Architect**: 基於 DNA 與 `_sociology_pack` 約束，反向生成合成 CSV。

### 4.2 意圖稜鏡 (Search Lab / Intent Prism)
- **核心邏輯**: 心理動力學模擬。
- **流程**:
  1. 輸入 Keyword + Persona DNA。
  2. 強制 AI 進入三種狀態：**急迫痛點 (Pain)**、**理性比較 (Rational)**、**懷疑抗性 (Skeptic)**。
  3. 輸出：不同狀態下的搜尋關鍵字與內容效度分析。

### 4.3 市場逆向工程 (Prism Engine 9.0)
- **核心邏輯**: Trinity Core (三維戰略矩陣)。
- **Phase 0 (Grounding)**: 使用 Google Search 獲取競品真實「災情/缺點」。
- **Phase 1 (Calculation)**: 計算三個戰略座標：
  - **Demand Tension**: 痛點張力。
  - **Competitive Lock-in**: 競品鎖定度 (若發現災情則大幅降低)。
  - **Entry Feasibility**: 切入可行性。
- **Output**: 產出 `PersonaCandidate` 與 `ProductDiagnosis`。

### 4.4 時空戰略 (Chronos)
- **核心邏輯**: 結合真實日曆與個人經濟週期。
- **流程**: Google Search 當日新聞/天氣 -> 計算 **Liquidity** (購買力) 與 **Bandwidth** (心智頻寬)。

## 5. 狀態持久化 (Persistence Protocol)
- **Identity**: `the_sim_persona_v1`
- **Context**: `the_sim_modifiers_v1` (Tuner), `the_sim_scenario_v1` (Mode)
- **Product Radar**: `the_sim_product_radar_v1`
- **Lab Draft**: `the_sim_lab_draft_v1`
