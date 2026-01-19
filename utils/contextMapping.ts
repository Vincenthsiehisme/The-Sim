
import { ScenarioMode, SimulationModifiers, SocialPlatform } from '../types';
import { EyeOff, Search, Wallet, Clock } from 'lucide-react';

// === DYNAMIC TIER CONFIGURATION ===
// Returns different labels/descriptions based on scenario mode
export const getTierConfig = (mode: ScenarioMode) => ({
  budget_anxiety: mode === 'sales' ? [
    { value: 10, label: "闊綽", desc: "金錢寬裕，只在乎品質與服務，對價格極不敏感。", color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500" },
    { value: 30, label: "寬裕", desc: "願意為更好的體驗支付溢價。", color: "text-emerald-500", bg: "bg-emerald-400", dot: "bg-emerald-400" },
    { value: 50, label: "理性", desc: "會計算性價比，覺得划算才會購買。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "拮据", desc: "預算有限，主動尋找折扣，對原價有抗性。", color: "text-orange-500", bg: "bg-orange-400", dot: "bg-orange-400" },
    { value: 90, label: "生存", desc: "拒絕一切非必要開支，價格是唯一考量。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
  ] : mode === 'content' ? [
    // Content Mode: Value Threshold
    { value: 10, label: "高價值門檻", desc: "只看權威來源或獨家深度內容，拒絕農場文。", color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500" },
    { value: 30, label: "重視質感", desc: "偏好排版精美、資訊密度高的優質內容。", color: "text-emerald-500", bg: "bg-emerald-400", dot: "bg-emerald-400" },
    { value: 50, label: "一般標準", desc: "內容有趣或實用即可，不特別挑剔來源。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "來者不拒", desc: "容易被聳動標題吸引，對內容品質要求不高。", color: "text-orange-500", bg: "bg-orange-400", dot: "bg-orange-400" },
    { value: 90, label: "低門檻", desc: "只尋找免費資源或懶人包，拒絕付費訂閱。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
  ] : [
    // Friend Mode: Generosity / Financial Values
    { value: 10, label: "慷慨", desc: "願意請客，不計較小錢，大方分享。", color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500" },
    { value: 30, label: "大方", desc: "出去玩願意分擔多一點，不會斤斤計較。", color: "text-emerald-500", bg: "bg-emerald-400", dot: "bg-emerald-400" },
    { value: 50, label: "AA制", desc: "親兄弟明算帳，公平分攤，互不佔便宜。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "節省", desc: "會提議去便宜的地方，對價格比較敏感。", color: "text-orange-500", bg: "bg-orange-400", dot: "bg-orange-400" },
    { value: 90, label: "哭窮", desc: "總是說自己沒錢，甚至會想佔朋友便宜。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
  ],
  patience: mode === 'sales' ? [
    { value: 10, label: "極度急躁", desc: "流程需在3秒內完成，極易放棄結帳。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
    { value: 30, label: "沒空等待", desc: "討厭繁瑣註冊或過長載入時間。", color: "text-orange-500", bg: "bg-orange-400", dot: "bg-orange-400" },
    { value: 50, label: "普通耐心", desc: "可以接受標準的購物與結帳流程。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "願意等待", desc: "為了買到好東西，願意花時間填表或等待預購。", color: "text-emerald-500", bg: "bg-emerald-400", dot: "bg-emerald-400" },
    { value: 90, label: "極具耐心", desc: "會詳細閱讀所有條款，不介意複雜流程。", color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500" },
  ] : mode === 'content' ? [
    // Content Mode: Reading Patience
    { value: 10, label: "標題掃描", desc: "只讀標題和粗體字，稍微太長直接跳出。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
    { value: 30, label: "缺乏耐性", desc: "需要懶人包或重點摘要，無法閱讀長文。", color: "text-orange-500", bg: "bg-orange-400", dot: "bg-orange-400" },
    { value: 50, label: "一般閱讀", desc: "會閱讀有興趣的段落，篇幅適中即可。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "願意深讀", desc: "能夠閱讀長篇深度報導或技術文件。", color: "text-emerald-500", bg: "bg-emerald-400", dot: "bg-emerald-400" },
    { value: 90, label: "重度鑽研", desc: "會逐字閱讀並查證細節，熱愛硬核內容。", color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500" },
  ] : [
    // Friend Mode: Listening Patience
    { value: 10, label: "插嘴王", desc: "完全沒耐心聽你說完，急著表達自己的意見。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
    { value: 30, label: "急躁", desc: "會頻繁看手機或打斷，希望能快點講重點。", color: "text-orange-500", bg: "bg-orange-400", dot: "bg-orange-400" },
    { value: 50, label: "一般傾聽", desc: "有在聽，也會適時回應，但不會太深入。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "耐心傾聽", desc: "願意花時間聽你訴苦，不會隨便打斷。", color: "text-emerald-500", bg: "bg-emerald-400", dot: "bg-emerald-400" },
    { value: 90, label: "心靈導師", desc: "極度有耐心，引導你說出心裡話。", color: "text-emerald-600", bg: "bg-emerald-500", dot: "bg-emerald-500" },
  ],
  social_mask: [
    { value: 10, label: "真實直言", desc: "完全透明，心裡想什麼就說什麼，不修飾。", color: "text-violet-600", bg: "bg-violet-500", icon: EyeOff, dot: "bg-violet-500" },
    { value: 30, label: "直率", desc: "講話直接，好惡分明，不太客套。", color: "text-indigo-500", bg: "bg-indigo-400", dot: "bg-indigo-400" },
    { value: 50, label: "一般社交", desc: "維持基本的禮貌與社會互動規範。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 70, label: "客套禮貌", desc: "會講場面話，為了禮貌可能不會直接拒絕。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-300" },
    { value: 90, label: "官方防備", desc: "回答像公關稿，隱藏真實意圖，難以測知真心。", color: "text-slate-400", bg: "bg-slate-300", dot: "bg-slate-400" },
  ],
  purchase_intent: mode === 'sales' ? [
    { value: 10, label: "隨意閒逛", desc: "無目的瀏覽，容易分心跳出。", color: "text-slate-400", bg: "bg-slate-300", dot: "bg-slate-300" },
    { value: 30, label: "觀望中", desc: "有一點興趣，但還沒打算行動。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-400" },
    { value: 50, label: "比較評估", desc: "正在評估不同選項，會看性價比。", color: "text-indigo-500", bg: "bg-indigo-400", dot: "bg-indigo-400" },
    { value: 70, label: "目標明確", desc: "知道自己要什麼，只在意規格是否符合。", color: "text-amber-600", bg: "bg-amber-500", dot: "bg-amber-500" },
    { value: 90, label: "急迫需求", desc: "為了解決問題願意妥協，轉換率極高。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
  ] : mode === 'content' ? [
    // Content Mode: Goal Orientation
    { value: 10, label: "殺時間", desc: "只是無聊滑手機，沒有特定目的。", color: "text-slate-400", bg: "bg-slate-300", dot: "bg-slate-300" },
    { value: 30, label: "隨意瀏覽", desc: "看看有沒有什麼有趣的新鮮事。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-400" },
    { value: 50, label: "興趣探索", desc: "對特定主題感興趣，願意花時間了解。", color: "text-indigo-500", bg: "bg-indigo-400", dot: "bg-indigo-400" },
    { value: 70, label: "尋找答案", desc: "帶著具體問題來尋找解決方案。", color: "text-amber-600", bg: "bg-amber-500", dot: "bg-amber-500" },
    { value: 90, label: "學術研究", desc: "正在進行系統性的資料蒐集與研究。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
  ] : [
    // Friend Mode: Topic Interest
    { value: 10, label: "敷衍", desc: "對話題沒興趣，只想句點你。", color: "text-slate-400", bg: "bg-slate-300", dot: "bg-slate-300" },
    { value: 30, label: "放空", desc: "聽聽而已，沒什麼反應。", color: "text-slate-500", bg: "bg-slate-400", dot: "bg-slate-400" },
    { value: 50, label: "禮貌回應", desc: "會適當回應，維持對話熱度。", color: "text-indigo-500", bg: "bg-indigo-400", dot: "bg-indigo-400" },
    { value: 70, label: "感興趣", desc: "覺得話題有趣，會主動分享看法。", color: "text-amber-600", bg: "bg-amber-500", dot: "bg-amber-500" },
    { value: 90, label: "超投入", desc: "對話題充滿熱情，會一直聊下去。", color: "text-rose-600", bg: "bg-rose-500", dot: "bg-rose-500" },
  ],
});

// Mapping for Slider Titles
export const SLIDER_LABELS: Record<ScenarioMode, Record<string, string>> = {
  sales: {
    budget_anxiety: "預算敏感度",
    patience: "交易耐心",
    social_mask: "社交防備",
    purchase_intent: "購買意圖"
  },
  content: {
    budget_anxiety: "價值門檻",
    patience: "閱讀耐性",
    social_mask: "互動活躍",
    purchase_intent: "目的導向"
  },
  friend: {
    budget_anxiety: "金錢觀念",
    patience: "傾聽耐心",
    social_mask: "社交防備",
    purchase_intent: "話題興趣"
  }
};

export const PLATFORM_PRESETS: Record<SocialPlatform, {
    description: string;
    modifiers: Partial<SimulationModifiers>;
}> = {
    'LINE': {
        description: "在封閉親友群組中，傾向客氣、長輩圖風、避免衝突。",
        modifiers: {
            social_mask: 90, // Polite
            patience: 70,    // Patient listener
        }
    },
    'PTT': {
        description: "在匿名論壇中，講話直白、帶刺、使用鄉民用語。",
        modifiers: {
            social_mask: 10, // Raw/Honest
            patience: 30,    // Impatient
        }
    },
    'IG': {
        description: "在公開社群中，重視人設形象、氛圍感與簡潔。",
        modifiers: {
            social_mask: 70, // Image conscious
        }
    },
    'General': {
        description: "回歸原始設定的自然互動狀態。",
        modifiers: {} // Should reset to baseline in implementation
    }
};
