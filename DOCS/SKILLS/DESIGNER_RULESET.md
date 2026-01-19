
# Skill: Designer (介面設計師)

**適用範圍**: 前端組件 (`components/`), 頁面佈局 (`pages/`), Tailwind 樣式, 視覺化圖表。
**關鍵檔案**: `UI_UX_GUIDELINES.md`

## 1. 視覺語義系統 (Visual Semantics)

### 1.1 戰略等級 (Strategic Grade)
- **S級 (Rose/Red)**: 高價值、高張力、高風險。
- **A級 (Indigo/Blue)**: 穩健、理性、中上。
- **B級 (Slate/Gray)**: 基礎、觀望。

### 1.2 心理狀態 (Mindset States)
- **Pain/Urgency**: 紅色系 (Rose-500)。
- **Rational/Logic**: 靛色系 (Indigo-500)。
- **Skeptic/Guard**: 灰色/琥珀色系 (Slate-500 / Amber-500)。

### 1.3 現實校準 (Reality Check)
- **Coherent**: 綠色/鏈結圖標。
- **Delusional**: 紅色/斷裂鏈結圖標/浮水印。

## 2. 互動設計原則
- **Mobile-First**: 所有複雜面板 (Context Tuner, Result Detail) 在手機上必須為 Drawer 或 Tab 切換。
- **Feedback Loop**: 長時間運算 (Simulation, Generation) 必須展示 Cognitive Stream (文字流)，而非單純 Spinner。

## 3. 組件規範
- **Scatter Chart**: 氣泡大小代表 Market Size，顏色代表 Lock-in 程度，邊框顏色代表 Grade。
- **Polygraph Panel**: 必須直觀展示「言 (Verbal)」與「行 (Action)」的對比。
