import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadDemoData, clearDataCache } from './loadData';

describe('loadDemoData', () => {
  beforeEach(() => {
    clearDataCache();
    vi.restoreAllMocks();
  });

  it('fetches all datasets and caches the result', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('mouza.json')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'notun-char',
              nameBn: 'নতুন চর',
              nameEn: 'Notun Char',
              jlNo: '০০০',
              upazilaBn: 'মানিকগঞ্জ সদর',
              upazilaEn: 'Manikganj Sadar',
              districtBn: 'মানিকগঞ্জ',
              districtEn: 'Manikganj',
              areaClass: 'union',
              sourceTaxClass: 'B',
              center: [90.05, 23.87],
              bbox: [90.04, 23.86, 90.06, 23.88],
              sheetCorners: [],
              roadLine: { type: 'LineString', coordinates: [] },
            }),
        });
      }
      if (url.includes('dags.geojson')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              type: 'FeatureCollection',
              features: Array.from({ length: 48 }, (_, i) => ({
                type: 'Feature',
                id: String(101 + i),
                properties: { id: String(101 + i) },
              })),
            }),
        });
      }
      if (url.includes('people.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 'p-1', nameBn: 'করিম', nameEn: 'Karim', sex: 'M' }]),
        });
      }
      if (url.includes('events.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('scenarios.json')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                dagId: '101',
                key: 'clean-chain',
                expected: 'green',
                titleBn: 'নিষ্কণ্টক জমি',
                titleEn: 'Clean land',
                storyBn: 'মালিকানা স্পষ্ট',
                storyEn: 'Clean title',
              },
            ]),
        });
      }
      if (url.includes('feeRules.json')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              fiscalYear: '2025-26',
              status: 'DEMO',
              sources: [],
              bp: { stampDuty: 150 },
            }),
        });
      }
      return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });
    });

    global.fetch = mockFetch;

    const data1 = await loadDemoData();
    expect(data1.mouza.id).toBe('notun-char');
    expect(data1.dags.features.length).toBe(48);

    // Second call should use cache
    const data2 = await loadDemoData();
    expect(data2).toBe(data1);
    expect(mockFetch).toHaveBeenCalledTimes(6);
  });

  it('allows retry on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    await expect(loadDemoData()).rejects.toThrow('Network error');

    // Second call after clear or fail should retry
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });
    await expect(loadDemoData()).rejects.toThrow('Failed to load');
  });
});
