
import { describe, it, expect } from 'vitest';
import { smartDistillCsv } from '../smartDistiller';
import { RAW_CLEAN_CSV, RAW_DIRTY_CSV } from '../../__mocks__/personaFixtures';

describe('Smart Distiller (Data Ingestion Layer)', () => {
  it('should correctly parse a clean CSV', () => {
    const { stats, fullContext } = smartDistillCsv(RAW_CLEAN_CSV, null);
    
    // 3 data rows
    expect(stats.totalRows).toBe(3);
    // 2 unique dates (2023-10-01, 2023-10-02)
    expect(stats.activeDays).toBe(2);
    // Categories should detect 'Shopping' and 'News'
    expect(stats.topCategories).toContain('Shopping');
    // Full context should contain subject from rows
    expect(fullContext).toContain('iPhone 15');
  });

  it('should calculate hourly distribution correctly', () => {
    const { stats } = smartDistillCsv(RAW_CLEAN_CSV, null);
    // 09:00, 10:00, 12:00
    expect(stats.hourlyDistribution[9]).toBe(1);
    expect(stats.hourlyDistribution[10]).toBe(1);
    expect(stats.hourlyDistribution[12]).toBe(1);
    expect(stats.hourlyDistribution[0]).toBe(0);
  });

  it('should handle dirty data gracefully', () => {
    const { stats, standardRows } = smartDistillCsv(RAW_DIRTY_CSV, null);
    
    // Expect at least some valid rows extracted
    // Row 1: 2023/10/01 (Date parser usually handles slashes)
    // Row 3: 2023-10-01 10:00:00 (Valid)
    expect(stats.totalRows).toBeGreaterThanOrEqual(1);
    
    // Check if Emoji survived in the subject or content
    // Row 3 subject is "Emoji 🍎"
    const emojiRow = standardRows?.find(r => r.subject.includes('🍎'));
    expect(emojiRow).toBeDefined();
    expect(emojiRow?.action_type).toBe('click');
  });

  it('should infer action types from raw text without commas (Heuristics)', () => {
    // Note: smartDistiller skips the first line as header. 
    // We provide a dummy header to ensure the logic runs on subsequent lines.
    const rawLog = `Dummy Header
2023-10-01 10:00:00 user clicked on button
2023-10-01 10:05:00 [view] product page`;
    
    const { standardRows } = smartDistillCsv(rawLog, null);
    
    // Row 1: "clicked" -> click
    const row1 = standardRows?.find(r => r.content_body.includes('clicked'));
    expect(row1?.action_type).toBe('click');
    
    // Row 2: "[view]" -> view
    const row2 = standardRows?.find(r => r.content_body.includes('product page'));
    expect(row2?.action_type).toBe('view');
  });
});
