
// SOURCE: Ministry of Interior (內政部不動產資訊平台) - 112年Q3 房價負擔能力指標
// METRIC: Loan Burden Rate (房貸負擔率)
// Context: >30% is "Reasonable", >50% is "Too Heavy".
// This defines the "Pain Threshold" for housing costs in each region.

export const HOUSING_BURDEN_RATE = {
  "Taipei": 0.6713,    // 臺北市 (Extreme)
  "NewTaipei": 0.5535, // 新北市 (Very Heavy)
  "Taichung": 0.5032,  // 臺中市 (Heavy)
  "Hsinchu": 0.4500,   // 新竹縣市 (Estimated avg)
  "Tainan": 0.4000,    // 臺南市
  "Kaohsiung": 0.3974, // 高雄市
  "General": 0.3500    // Other areas (Reasonable limit)
};

export const getHousingBurden = (geoId: string): number => {
  switch (geoId) {
    case 'taipei_core': return HOUSING_BURDEN_RATE.Taipei;
    case 'commuter_belt': return HOUSING_BURDEN_RATE.NewTaipei;
    case 'tech_hub': return HOUSING_BURDEN_RATE.Hsinchu;
    case 'comfort_zone': return HOUSING_BURDEN_RATE.Kaohsiung;
    case 'rural_area': return 0.25; // Rural is significantly lower
    default: return HOUSING_BURDEN_RATE.General;
  }
};
