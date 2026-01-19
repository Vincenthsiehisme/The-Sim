
// SOURCE: Ministry of Health and Welfare (衛福部社工司) - 113年度(2024)最低生活費
// UNIT: TWD / Month
// Context: "Poverty Line" represents the absolute minimum cost to survive in a specific region.

export const POVERTY_LINE_2024 = {
  "Taipei": 19649,      // 臺北市
  "NewTaipei": 16400,   // 新北市
  "Taoyuan": 15977,     // 桃園市
  "Taichung": 15518,    // 臺中市
  "Tainan": 14230,      // 臺南市
  "Kaohsiung": 14419,   // 高雄市
  "Hsinchu": 17000,     // 新竹市 (Estimated based on high cost)
  "General": 14230,     // 臺灣省 (基隆/新竹縣/苗栗等)
  "Offshore": 13138     // 金門/連江
};

// Map internal GeoProfile IDs to Official Region Keys
export const getRegionKey = (geoId: string): keyof typeof POVERTY_LINE_2024 => {
  switch (geoId) {
    case 'taipei_core': return 'Taipei';
    case 'commuter_belt': return 'NewTaipei';
    case 'tech_hub': return 'Hsinchu'; // High cost area
    case 'comfort_zone': return 'Tainan'; // Representing South/Central relaxed cost
    case 'rural_area': return 'General';
    default: return 'General';
  }
};
