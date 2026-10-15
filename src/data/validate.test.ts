import { describe, it, expect } from 'vitest';
import { validateDemoData, validateMouza, validateDags } from './validate';
import type { DemoData } from '@/engine/types';

describe('validateDemoData', () => {
  const sampleMouza: import('@/engine/types').Mouza = {
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
    sheetCorners: [
      [90.04, 23.88],
      [90.06, 23.88],
      [90.06, 23.86],
      [90.04, 23.86],
    ],
    roadLine: {
      type: 'LineString',
      coordinates: [
        [90.04, 23.86],
        [90.06, 23.86],
      ],
    },
  };

  const sampleDags = {
    type: 'FeatureCollection' as const,
    features: Array.from({ length: 48 }, (_, i) => ({
      type: 'Feature' as const,
      id: String(101 + i),
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [90.05, 23.87],
            [90.051, 23.87],
            [90.051, 23.871],
            [90.05, 23.871],
            [90.05, 23.87],
          ],
        ],
      },
      properties: {
        id: String(101 + i),
        mouzaId: 'notun-char',
        dagNo: { CS: '1', SA: '1', RS: '1', BS: String(101 + i) },
        landClass: 'vita' as const,
        recordedAreaDecimal: 20,
        roadFacing: true,
        flags: {},
      },
    })),
  };

  const validData: DemoData = {
    mouza: sampleMouza,
    dags: sampleDags,
    people: [{ id: 'p-1', nameBn: 'করিম', nameEn: 'Karim', sex: 'M' }],
    events: [],
    scenarios: [
      {
        dagId: '101',
        key: 'clean-chain',
        expected: 'green',
        titleBn: 'নিষ্কণ্টক জমি',
        titleEn: 'Clean land',
        storyBn: 'মালিকানা স্পষ্ট',
        storyEn: 'Clean title',
      },
    ],
    feeRules: {
      fiscalYear: '2025-26',
      status: 'DEMO',
      sources: [],
      bp: {
        stampDuty: 150,
        registrationFee: 100,
        localGovtTax: { union: 200, pourashava: 300, city: 300 },
        sourceTax: { A: 600, B: 400, C: 300 },
      },
      fixedFeesBdt: { eFee: 100, nFee: 100, courtFee: 20, affidavitStamp: 200 },
      mutationFeesBdt: { courtFee: 20, noticeFee: 50, recordCorrection: 1000, ledgerCopy: 100 },
    },
  };

  it('validates correct demo data successfully', () => {
    expect(() => validateDemoData(validData)).not.toThrow();
    expect(validateDemoData(validData)).toBe(true);
  });

  it('rejects invalid mouza', () => {
    expect(() => validateMouza(null)).toThrow('Invalid mouza');
    expect(() => validateMouza({ id: 'test' })).toThrow('Invalid mouza');
  });

  it('rejects dags with fewer than 48 features', () => {
    expect(() =>
      validateDags({
        type: 'FeatureCollection',
        features: sampleDags.features.slice(0, 10),
      }),
    ).toThrow('Expected at least 48 dags');
  });

  it('rejects non-object data', () => {
    expect(() => validateDemoData(null as unknown as DemoData)).toThrow('Invalid data payload');
  });
});
