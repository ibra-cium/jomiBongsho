/**
 * price.test.ts — Unit tests for comparable-sales price estimate engine
 * Tests written BEFORE implementation per AGENTS.md §3 rule 4.
 */

import { describe, expect, it } from 'vitest';
import type {
  DagProps,
  DeedEvent,
  Feature,
  FeatureCollection,
  GeoPolygon,
  LandEvent,
} from './types';
import { estimatePrice, percentileInc } from './price';

// ---------------------------------------------------------------------------
// Helpers to build test fixtures
// ---------------------------------------------------------------------------

function makePolygon(lng: number, lat: number): GeoPolygon {
  const d = 0.001; // roughly 110m
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lng - d, lat - d],
        [lng + d, lat - d],
        [lng + d, lat + d],
        [lng - d, lat + d],
        [lng - d, lat - d],
      ],
    ],
  };
}

function makeFeature(
  id: string,
  overrides: Partial<DagProps> = {},
  center: [number, number] = [90.05, 23.87],
): Feature<GeoPolygon, DagProps> {
  return {
    type: 'Feature',
    properties: {
      id,
      mouzaId: 'notunchar',
      dagNo: { BS: id },
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
      flags: {},
      ...overrides,
    },
    geometry: makePolygon(center[0], center[1]),
  };
}

function makeSaleDeed(
  id: string,
  dagId: string,
  date: string,
  declaredPriceBdt: number,
  share: string = '1/1',
): DeedEvent {
  return {
    id,
    dagId,
    date,
    type: 'deed',
    kind: 'sale',
    deedNo: `D-${id}`,
    sellers: [{ personId: 'p-seller', share }],
    buyers: [{ personId: 'p-buyer', share }],
    declaredPriceBdt,
    subRegistryBn: 'মানিকগঞ্জ সদর',
  };
}

// ---------------------------------------------------------------------------
// 1. Percentile calculation tests (Excel PERCENTILE.INC linear interpolation)
// ---------------------------------------------------------------------------

describe('percentileInc — linear interpolation maths', () => {
  it('returns single element for array of length 1', () => {
    expect(percentileInc([42], 0.5)).toBe(42);
    expect(percentileInc([42], 0)).toBe(42);
    expect(percentileInc([42], 1)).toBe(42);
  });

  it('calculates exact percentiles for odd-length sorted array [10, 20, 30, 40, 50]', () => {
    const arr = [10, 20, 30, 40, 50];
    expect(percentileInc(arr, 0)).toBe(10);
    expect(percentileInc(arr, 0.25)).toBe(20);
    expect(percentileInc(arr, 0.5)).toBe(30);
    expect(percentileInc(arr, 0.75)).toBe(40);
    expect(percentileInc(arr, 1)).toBe(50);
  });

  it('interpolates percentiles for even-length sorted array [10, 20, 30, 40]', () => {
    const arr = [10, 20, 30, 40];
    // k = 3 * 0.5 = 1.5 -> 20 + 0.5*(30-20) = 25
    expect(percentileInc(arr, 0.5)).toBe(25);
    // k = 3 * 0.25 = 0.75 -> 10 + 0.75*(20-10) = 17.5
    expect(percentileInc(arr, 0.25)).toBe(17.5);
    // k = 3 * 0.75 = 2.25 -> 30 + 0.25*(40-30) = 32.5
    expect(percentileInc(arr, 0.75)).toBe(32.5);
  });
});

// ---------------------------------------------------------------------------
// 2. Candidate filtering tests
// ---------------------------------------------------------------------------

describe('estimatePrice — candidate filtering', () => {
  const targetFeature = makeFeature('101', { landClass: 'vita', recordedAreaDecimal: 10 });
  const today = '2026-10-01';

  it('excludes comps with a different land class', () => {
    // 4 comps, 2 with nal and 2 with vita
    const f1 = makeFeature('102', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f2 = makeFeature('103', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f3 = makeFeature('104', { landClass: 'nal', recordedAreaDecimal: 10 });
    const f4 = makeFeature('105', { landClass: 'nal', recordedAreaDecimal: 10 });

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [targetFeature, f1, f2, f3, f4],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2026-01-01', 1_000_000),
      makeSaleDeed('e2', '103', '2026-02-01', 1_000_000),
      makeSaleDeed('e3', '104', '2026-03-01', 1_000_000),
      makeSaleDeed('e4', '105', '2026-04-01', 1_000_000),
    ];

    const result = estimatePrice(targetFeature.properties, allDags, events, { today });
    // Since only 2 comps have same landClass (vita) and min required is 3, status is insufficient
    expect(result.status).toBe('insufficient');
  });

  it('excludes sales older than 24 months before today', () => {
    // Target is '2026-10-01'; 24 months cutoff is '2024-10-01'
    const f1 = makeFeature('102', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f2 = makeFeature('103', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f3 = makeFeature('104', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f4 = makeFeature('105', { landClass: 'vita', recordedAreaDecimal: 10 });

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [targetFeature, f1, f2, f3, f4],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2024-09-15', 1_000_000), // > 24 months old!
      makeSaleDeed('e2', '103', '2025-05-01', 1_000_000),
      makeSaleDeed('e3', '104', '2025-06-01', 1_000_000),
      makeSaleDeed('e4', '105', '2025-07-01', 1_000_000),
    ];

    const result = estimatePrice(targetFeature.properties, allDags, events, { today });
    // 3 valid comps remain within 24 months
    expect(result.status).toBe('ok');
    // e1 should be excluded
    const compE1 = result.comps.find((c) => c.eventId === 'e1');
    expect(compE1).toBeUndefined(); // Not a candidate within 24 months
  });

  it('excludes deed matching excludeEventId option (used for UNDER_DECLARED)', () => {
    const f1 = makeFeature('102', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f2 = makeFeature('103', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f3 = makeFeature('104', { landClass: 'vita', recordedAreaDecimal: 10 });

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [targetFeature, f1, f2, f3],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2025-05-01', 1_000_000),
      makeSaleDeed('e2', '103', '2025-06-01', 1_000_000),
      makeSaleDeed('e3', '104', '2025-07-01', 1_000_000),
    ];

    const result = estimatePrice(targetFeature.properties, allDags, events, {
      today,
      excludeEventId: 'e1',
    });
    // With e1 excluded, only 2 comps remain -> insufficient
    expect(result.status).toBe('insufficient');
  });
});

// ---------------------------------------------------------------------------
// 3. Road-neutral adjustment & target road-facing multiplier
// ---------------------------------------------------------------------------

describe('estimatePrice — road facing adjustments', () => {
  const today = '2026-10-01';

  it('divides road-facing comps by 1.15 to make them road-neutral', () => {
    const target = makeFeature('101', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });
    // 4 comps, 1 is road-facing with price 115,000/dec -> road-neutral is 100,000/dec
    const f1 = makeFeature('102', { landClass: 'vita', recordedAreaDecimal: 10, roadFacing: true });
    const f2 = makeFeature('103', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });
    const f3 = makeFeature('104', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });
    const f4 = makeFeature('105', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [target, f1, f2, f3, f4],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2025-05-01', 1_150_000), // 115,000/dec on road -> 100,000 neutral
      makeSaleDeed('e2', '103', '2025-06-01', 1_000_000), // 100,000/dec neutral
      makeSaleDeed('e3', '104', '2025-07-01', 1_000_000), // 100,000/dec neutral
      makeSaleDeed('e4', '105', '2025-08-01', 1_000_000), // 100,000/dec neutral
    ];

    const result = estimatePrice(target.properties, allDags, events, { today });
    expect(result.status).toBe('ok');
    const comp1 = result.comps.find((c) => c.eventId === 'e1');
    expect(comp1?.roadNeutralPricePerDecimalBdt).toBeCloseTo(100_000, 0);
    expect(result.perDecimal?.mid).toBe(100_000);
  });

  it('multiplies result by 1.15 when target dag is road-facing', () => {
    const target = makeFeature('101', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: true,
    });
    const f1 = makeFeature('102', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });
    const f2 = makeFeature('103', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });
    const f3 = makeFeature('104', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });
    const f4 = makeFeature('105', {
      landClass: 'vita',
      recordedAreaDecimal: 10,
      roadFacing: false,
    });

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [target, f1, f2, f3, f4],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2025-05-01', 1_000_000), // 100,000/dec
      makeSaleDeed('e2', '103', '2025-06-01', 1_000_000),
      makeSaleDeed('e3', '104', '2025-07-01', 1_000_000),
      makeSaleDeed('e4', '105', '2025-08-01', 1_000_000),
    ];

    const result = estimatePrice(target.properties, allDags, events, { today });
    expect(result.status).toBe('ok');
    // 100,000 * 1.15 = 115,000
    expect(result.perDecimal?.mid).toBe(115_000);
    expect(result.adjustments).toEqual([{ key: 'roadFacing', pct: 15 }]);
  });
});

// ---------------------------------------------------------------------------
// 4. Outlier removal: underDeclared (< 0.5 * median) and IQR outliers
// ---------------------------------------------------------------------------

describe('estimatePrice — outlier exclusion', () => {
  const today = '2026-10-01';

  it('excludes comp with price < 0.5 * median as underDeclared', () => {
    const target = makeFeature('101', { landClass: 'vita', recordedAreaDecimal: 10 });
    // 5 comps: 4 around 100k, 1 at 30k (< 50% of 100k)
    const f1 = makeFeature('102', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f2 = makeFeature('103', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f3 = makeFeature('104', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f4 = makeFeature('105', { landClass: 'vita', recordedAreaDecimal: 10 });
    const f5 = makeFeature('106', { landClass: 'vita', recordedAreaDecimal: 10 });

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [target, f1, f2, f3, f4, f5],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2025-05-01', 300_000), // 30,000/dec -> under-declared!
      makeSaleDeed('e2', '103', '2025-06-01', 980_000),
      makeSaleDeed('e3', '104', '2025-07-01', 1_000_000),
      makeSaleDeed('e4', '105', '2025-08-01', 1_020_000),
      makeSaleDeed('e5', '106', '2025-09-01', 1_000_000),
    ];

    const result = estimatePrice(target.properties, allDags, events, { today });
    expect(result.status).toBe('ok');
    const compUnder = result.comps.find((c) => c.eventId === 'e1');
    expect(compUnder?.used).toBe(false);
    expect(compUnder?.excludeReason).toBe('underDeclared');
  });

  it('excludes comp outside Q1 - 1.5*IQR ... Q3 + 1.5*IQR as outlier', () => {
    const target = makeFeature('101', { landClass: 'vita', recordedAreaDecimal: 10 });
    // Comps: 100k, 101k, 102k, 103k, 104k, and one extreme high 500k
    const features = ['102', '103', '104', '105', '106', '107'].map((id) =>
      makeFeature(id, { landClass: 'vita', recordedAreaDecimal: 10 }),
    );

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [target, ...features],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2025-05-01', 1_000_000),
      makeSaleDeed('e2', '103', '2025-06-01', 1_010_000),
      makeSaleDeed('e3', '104', '2025-07-01', 1_020_000),
      makeSaleDeed('e4', '105', '2025-08-01', 1_030_000),
      makeSaleDeed('e5', '106', '2025-09-01', 1_040_000),
      makeSaleDeed('e6', '107', '2025-09-15', 5_000_000), // 500k/dec -> extreme outlier
    ];

    const result = estimatePrice(target.properties, allDags, events, { today });
    expect(result.status).toBe('ok');
    const compOutlier = result.comps.find((c) => c.eventId === 'e6');
    expect(compOutlier?.used).toBe(false);
    expect(compOutlier?.excludeReason).toBe('outlier');
  });
});

// ---------------------------------------------------------------------------
// 5. Rounding & paisa representation
// ---------------------------------------------------------------------------

describe('estimatePrice — rounding and paisa representation', () => {
  const today = '2026-10-01';

  it('rounds perDecimal and total to nearest 1,000 taka and provides exact paisa', () => {
    const target = makeFeature('101', { landClass: 'vita', recordedAreaDecimal: 12.5 });
    const features = ['102', '103', '104', '105'].map((id) =>
      makeFeature(id, { landClass: 'vita', recordedAreaDecimal: 10 }),
    );

    const allDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [target, ...features],
    };

    const events: LandEvent[] = [
      makeSaleDeed('e1', '102', '2025-05-01', 1_002_400), // 100,240
      makeSaleDeed('e2', '103', '2025-06-01', 1_003_600), // 100,360
      makeSaleDeed('e3', '104', '2025-07-01', 1_005_100), // 100,510
      makeSaleDeed('e4', '105', '2025-08-01', 1_007_000), // 100,700
    ];

    const result = estimatePrice(target.properties, allDags, events, { today });
    expect(result.status).toBe('ok');
    const perDecimalMid = result.perDecimal?.mid ?? 0;
    const totalMid = result.total?.mid ?? 0;
    expect(perDecimalMid % 1000).toBe(0);
    expect(result.perDecimalPaisa?.mid).toBe(perDecimalMid * 100);
    expect(result.totalPaisa?.mid).toBe(totalMid * 100);
  });
});
