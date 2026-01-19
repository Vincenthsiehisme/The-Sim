
// SOURCE: DGBAS (主計總處) - 111年家庭收支調查報告
// METRIC: Average Propensity to Consume (APC) = Consumption / Disposable Income
// Context: How much of every earned dollar is spent vs saved.

export const PROPENSITY_BY_AGE = {
  "18-24": 0.84, // 青年高消費 (未滿30歲平均)
  "25-29": 0.80, // 逐步社會化
  "30-34": 0.76, // 家庭責任開始
  "35-44": 0.72, // 育兒房貸壓力，強迫儲蓄/還款
  "45-54": 0.68, // 收入高峰，儲蓄率提升
  "55-64": 0.65, // 退休恐懼，儲蓄率最高
  "65+": 0.68    // 老年醫療支出回升
};

export const getPropensity = (ageRange: string): number => {
  // Direct match or fallback
  if (ageRange in PROPENSITY_BY_AGE) {
    return PROPENSITY_BY_AGE[ageRange as keyof typeof PROPENSITY_BY_AGE];
  }
  // Fuzzy matching
  if (ageRange.includes('18') || ageRange.includes('24')) return PROPENSITY_BY_AGE["18-24"];
  if (ageRange.includes('25') || ageRange.includes('29')) return PROPENSITY_BY_AGE["25-29"];
  if (ageRange.includes('30')) return PROPENSITY_BY_AGE["30-34"];
  if (ageRange.includes('35') || ageRange.includes('40')) return PROPENSITY_BY_AGE["35-44"];
  if (ageRange.includes('50')) return PROPENSITY_BY_AGE["45-54"];
  if (ageRange.includes('60')) return PROPENSITY_BY_AGE["55-64"];
  
  return 0.75; // Default safe value
};
