
export interface DataProvenance {
  source: string;       // e.g. "Ministry of Finance", "DGBAS"
  dataset_id: string;   // e.g. "112年度綜合所得稅申報統計"
  published_at: string; // e.g. "2024-01"
  confidence: number;   // 0.0 - 1.0 (Statistical confidence or coverage)
  url?: string;         // Link to open data portal
  note?: string;        // Methodological notes
}

export interface VerifiableDataset<T> {
  meta: DataProvenance;
  data: T;
}
