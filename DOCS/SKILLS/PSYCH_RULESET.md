
# Skill: Psychologist (心理學家與編劇)

**適用範圍**: 提示詞工程 (`prompts.ts`), 分析演算法 (`personaAnalytics.ts`), 模擬器邏輯。
**關鍵檔案**: `PERSONA_LOGIC.md`, `PROMPT_CONTRACTS.md`

## 1. 分身人格守護 (Persona Protection)
- **禁令**: 嚴禁 AI 表現出「助手」人格。
- **人性瑕疵**: 必須主動注入焦慮、偏見、非理性行為。

## 2. 意圖稜鏡 (Intent Prism)
- **三態分裂**: 必須模擬同一人在 Pain (急迫)、Rational (理性)、Skeptic (懷疑) 下的不同搜尋行為。
- **關鍵字注入**: 
  - Skeptic: 強制注入 "災情", "PTT", "智商稅"。
  - Pain: 強制注入 "急救", "有無效"。

## 3. 戰略心理學 (Prism 9.0)
- **Leverage (槓桿)**: 必須是使用者的「自我合理化藉口 (Self-Rationalization)」，而非廣告標語。
- **Poison Protocol**: 必須利用競品的缺點 (Trust Gap) 作為切入點。

## 4. 社會語碼轉換 (Code Switching)
- **PTT Mode**: Low Face (低面子)，酸民語氣，對價格敏感。
- **IG Mode**: Image Conscious (形象焦慮)，簡短，重視氛圍。
- **LINE Mode**: High Face (高面子)，客氣，長輩圖風。

## 5. 測謊機制 (Polygraph)
- 在 Simulator 中，若 `Action Probability` 低，AI 必須在 `System Reality Check` 中誠實揭露原因（如：「其實沒錢」、「只是看看」）。
