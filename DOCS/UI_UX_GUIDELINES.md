
# UI/UX & Interaction Guidelines

## 1. 核心視覺化組件 (Core Visualizations)

### 1.1 戰略矩陣圖 (Strategic Matrix / Cockpit)
- **適用**: Product Mirror (Gap Analysis)。
- **視覺**: 3D Scatter Chart (X=Pain, Y=Ease, Z=Size)。
- **顏色編碼**: 
  - **S級 (Rose)**: 高張力、高可行性。
  - **A級 (Indigo)**: 中上機會。
  - **B級 (Slate)**: 一般機會。
- **互動**: 點擊氣泡可展開右側「戰術駕駛艙 (HUD)」。

### 1.2 意圖卡片 (Intent Card)
- **適用**: Search Lab。
- **狀態語義**:
  - **Urgent Pain**: 紅色/警示風格 (ShieldAlert)。
  - **Rational**: 靛色/腦力風格 (Brain)。
  - **Skeptic**: 灰色/防禦風格 (Alert)。
- **High/Low Validity**: 使用綠色區塊表示「高點擊」，紅色刪除線區塊表示「低效度」。

### 1.3 測謊儀表板 (Polygraph Panel)
- **適用**: Simulator。
- **Bluff Detection**: 當 Action < 30% 且 Verbal 正面時，顯示紅色 "BLUFF DETECTED" 警示燈。
- **Gut Feeling**: 漫畫式對話框，置於頭像上方，代表潛意識直覺。

### 1.4 現實校準卡 (Reality Anchor)
- **視覺**: 左側 Perception (虛)，右側 Reality (實)，中間 Link 圖標。
- **Delusional**: 紅色斷裂鏈結，背景顯示 "DELUSIONAL" 浮水印。

## 2. 互動反饋 (Interaction Patterns)
- **Micro-Interaction Loader**: 在 Chat 模式中，根據角色 Archetype 顯示不同的 Loading 文字 (e.g. "計算 CP 值中...", "查看評論中...")。
- **Cognitive Stream**: 在 Simulator 中，顯示 AI 思考步驟 ("搜尋競品" -> "比對預算")。

## 3. 控制台設計 (Context Tuner)
- **Mobile-First**: 手機版預設收合為 Drawer。
- **Preset-First**: 優先展示平台按鈕 (LINE/PTT/IG)，點擊後自動套用複雜參數，降低認知負荷。
