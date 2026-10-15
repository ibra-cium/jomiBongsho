/**
 * price.ts — Comparable-sales price estimation engine
 * Pure TypeScript, no React/DOM/fetch — AGENTS.md rule 4
 *
 * Implements DOMAIN_RULES.md §6:
 * 1. Candidates: valid sale deeds on other dags, same landClass, dated within 24 months before today.
 * 2. Price per decimal = declaredPriceBdt ÷ (soldShare × recordedAreaDecimal of that dag).
 * 3. Distance = centroid to centroid (Turf). Keep ≤ 500 m; if fewer than 4, use ≤ 1000 m; if fewer than 3, status: 'insufficient'.
 * 4. Make comps road-neutral: divide road-facing comps by 1.15.
 * 5. Remove outliers: drop values below 0.5 × median (mark excluded: 'underDeclared'),
 *    then drop values outside Q1 − 1.5·IQR … Q3 + 1.5·IQR (excluded: 'outlier').
 * 6. low = P25, mid = median, high = P75 of what is left; multiply by 1.15 if the target dag is road-facing.
 * 7. Money in integer paisa inside the engine; format to taka in UI.
 */

import centroid from '@turf/centroid';
import distance from '@turf/distance';
import Fraction from 'fraction.js';
import { sumShares } from './fraction';
import type {
  Comp,
  DagProps,
  DeedEvent,
  Feature,
  FeatureCollection,
  GeoPolygon,
  LandEvent,
  PriceEstimate,
} from './types';

// ---------------------------------------------------------------------------
// Linear interpolation percentile (Excel PERCENTILE.INC style)
// ---------------------------------------------------------------------------

/**
 * Computes percentile with linear interpolation over a sorted array.
 * Exact equivalent to Excel's PERCENTILE.INC and NumPy method='linear'.
 */
export function percentileInc(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0]!;
  if (p <= 0) return sorted[0]!;
  if (p >= 1) return sorted[sorted.length - 1]!;

  const k = (sorted.length - 1) * p;
  const i = Math.floor(k);
  const f = k - i;
  if (i >= sorted.length - 1) return sorted[sorted.length - 1]!;
  return sorted[i]! + f * (sorted[i + 1]! - sorted[i]!);
}

// ---------------------------------------------------------------------------
// Date helper — cutoff for 24 months before today
// ---------------------------------------------------------------------------

function getMonthsCutoffDate(todayStr: string, months: number): string {
  const parts = todayStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return '1900-01-01';

  const date = new Date(Date.UTC(y, m - 1 - months, d));
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roundTo1000(val: number): number {
  return Math.round(val / 1000) * 1000;
}

function getSoldShareFraction(deed: DeedEvent): Fraction {
  if (deed.sellers && deed.sellers.length > 0) {
    return sumShares(deed.sellers.map((s) => s.share));
  }
  if (deed.buyers && deed.buyers.length > 0) {
    return sumShares(deed.buyers.map((b) => b.share));
  }
  return new Fraction(1);
}

// Cache centroids per polygon feature geometry to keep repeated runs sub-millisecond
const _centroidCache = new WeakMap<GeoPolygon, [number, number]>();

function getCentroidCoords(feature: Feature<GeoPolygon, DagProps>): [number, number] {
  const cached = _centroidCache.get(feature.geometry);
  if (cached) return cached;
  const c = centroid(feature);
  const coords: [number, number] = [c.geometry.coordinates[0]!, c.geometry.coordinates[1]!];
  _centroidCache.set(feature.geometry, coords);
  return coords;
}

// ---------------------------------------------------------------------------
// Main estimation function
// ---------------------------------------------------------------------------

export interface EstimatePriceOptions {
  today?: string;
  excludeEventId?: string;
}

/**
 * Calculates a transparent comparable-sales price estimate for a target dag.
 */
export function estimatePrice(
  targetDag: DagProps,
  allDags: FeatureCollection<GeoPolygon, DagProps>,
  allEvents: LandEvent[],
  opts?: EstimatePriceOptions,
): PriceEstimate {
  const today = opts?.today ?? '2026-10-01';
  const cutoffDate = getMonthsCutoffDate(today, 24);

  // 1. Find target feature and centroid
  const targetFeature = allDags.features.find((f) => f.properties.id === targetDag.id);
  if (!targetFeature) {
    return {
      status: 'insufficient',
      comps: [],
      radiusM: 500,
      adjustments: [],
    };
  }
  const targetCentroid = getCentroidCoords(targetFeature);

  // Map dags by id for fast lookup
  const dagFeatureMap = new Map<string, Feature<GeoPolygon, DagProps>>();
  for (const f of allDags.features) {
    dagFeatureMap.set(f.properties.id, f);
  }

  // 2. Gather candidates from valid sale deeds on OTHER dags with the same landClass
  const candidateComps: Comp[] = [];

  for (const event of allEvents) {
    if (event.type !== 'deed') continue;
    const deed = event as DeedEvent;
    if (deed.kind !== 'sale') continue;
    if (deed.declaredPriceBdt <= 0) continue;
    if (opts?.excludeEventId && deed.id === opts.excludeEventId) continue;
    if (deed.dagId === targetDag.id) continue;

    // Check date within 24 months before today
    if (deed.date > today || deed.date < cutoffDate) continue;

    const compFeature = dagFeatureMap.get(deed.dagId);
    if (!compFeature) continue;
    if (compFeature.properties.landClass !== targetDag.landClass) continue;

    const soldShare = getSoldShareFraction(deed).valueOf();
    const recordedArea = compFeature.properties.recordedAreaDecimal;
    const soldDecimal = soldShare * recordedArea;
    if (soldDecimal <= 0) continue;

    const rawPricePerDecimalBdt = deed.declaredPriceBdt / soldDecimal;
    const isRoadFacing = Boolean(compFeature.properties.roadFacing);
    const roadNeutralPricePerDecimalBdt = isRoadFacing
      ? rawPricePerDecimalBdt / 1.15
      : rawPricePerDecimalBdt;

    const compCentroid = getCentroidCoords(compFeature);
    const distanceKm = distance(targetCentroid, compCentroid, { units: 'kilometers' });
    const distanceM = Math.round(distanceKm * 1000);

    candidateComps.push({
      dagId: deed.dagId,
      eventId: deed.id,
      deedNo: deed.deedNo,
      date: deed.date,
      distanceM,
      rawPricePerDecimalBdt,
      roadNeutralPricePerDecimalBdt,
      isRoadFacing,
      used: false,
    });
  }

  // 3. Distance radius: <= 500 m; if fewer than 4, use <= 1000 m; if fewer than 3, status: 'insufficient'
  const within500 = candidateComps.filter((c) => c.distanceM <= 500);
  let radiusM: 500 | 1000 = 500;
  let activePool: Comp[] = [];

  if (within500.length >= 4) {
    radiusM = 500;
    activePool = within500;
    for (const c of candidateComps) {
      if (c.distanceM > 500) {
        c.used = false;
        c.excludeReason = 'distance';
      }
    }
  } else {
    radiusM = 1000;
    const within1000 = candidateComps.filter((c) => c.distanceM <= 1000);
    for (const c of candidateComps) {
      if (c.distanceM > 1000) {
        c.used = false;
        c.excludeReason = 'distance';
      }
    }

    if (within1000.length < 3) {
      return {
        status: 'insufficient',
        comps: candidateComps,
        radiusM: 1000,
        adjustments: [],
      };
    }
    activePool = within1000;
  }

  // 4. Remove outliers:
  // Step 4a: drop values below 0.5 * median (mark excluded: 'underDeclared')
  activePool.sort((a, b) => a.roadNeutralPricePerDecimalBdt - b.roadNeutralPricePerDecimalBdt);
  const initialMedian = percentileInc(
    activePool.map((c) => c.roadNeutralPricePerDecimalBdt),
    0.5,
  );

  for (const c of activePool) {
    if (c.roadNeutralPricePerDecimalBdt < 0.5 * initialMedian) {
      c.used = false;
      c.excludeReason = 'underDeclared';
    } else {
      c.used = true;
    }
  }

  const poolAfterUnderDeclared = activePool.filter((c) => c.used);
  if (poolAfterUnderDeclared.length < 3) {
    return {
      status: 'insufficient',
      comps: candidateComps,
      radiusM,
      adjustments: [],
    };
  }

  // Step 4b: drop values outside Q1 - 1.5*IQR ... Q3 + 1.5*IQR (mark excluded: 'outlier')
  const q1 = percentileInc(
    poolAfterUnderDeclared.map((c) => c.roadNeutralPricePerDecimalBdt),
    0.25,
  );
  const q3 = percentileInc(
    poolAfterUnderDeclared.map((c) => c.roadNeutralPricePerDecimalBdt),
    0.75,
  );
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  for (const c of poolAfterUnderDeclared) {
    if (
      c.roadNeutralPricePerDecimalBdt < lowerBound ||
      c.roadNeutralPricePerDecimalBdt > upperBound
    ) {
      c.used = false;
      c.excludeReason = 'outlier';
    } else {
      c.used = true;
    }
  }

  const finalUsed = poolAfterUnderDeclared.filter((c) => c.used);
  if (finalUsed.length < 3) {
    return {
      status: 'insufficient',
      comps: candidateComps,
      radiusM,
      adjustments: [],
    };
  }

  // 5. low = P25, mid = median, high = P75 of what is left
  let low = percentileInc(
    finalUsed.map((c) => c.roadNeutralPricePerDecimalBdt),
    0.25,
  );
  let mid = percentileInc(
    finalUsed.map((c) => c.roadNeutralPricePerDecimalBdt),
    0.5,
  );
  let high = percentileInc(
    finalUsed.map((c) => c.roadNeutralPricePerDecimalBdt),
    0.75,
  );

  // 6. Multiply by 1.15 if the target dag is road-facing
  const adjustments: { key: 'roadFacing'; pct: 15 }[] = [];
  if (targetDag.roadFacing) {
    low = low * 1.15;
    mid = mid * 1.15;
    high = high * 1.15;
    adjustments.push({ key: 'roadFacing', pct: 15 });
  }

  // 7. Rounding: nearest 1,000 taka, and integer paisa
  const lowTaka = roundTo1000(low);
  const midTaka = roundTo1000(mid);
  const highTaka = roundTo1000(high);

  const totalLowTaka = roundTo1000(lowTaka * targetDag.recordedAreaDecimal);
  const totalMidTaka = roundTo1000(midTaka * targetDag.recordedAreaDecimal);
  const totalHighTaka = roundTo1000(highTaka * targetDag.recordedAreaDecimal);

  // Sort comps: used first, then by date descending
  candidateComps.sort((a, b) => {
    if (a.used !== b.used) return a.used ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  return {
    status: 'ok',
    perDecimal: { low: lowTaka, mid: midTaka, high: highTaka },
    total: { low: totalLowTaka, mid: totalMidTaka, high: totalHighTaka },
    perDecimalPaisa: { low: lowTaka * 100, mid: midTaka * 100, high: highTaka * 100 },
    totalPaisa: { low: totalLowTaka * 100, mid: totalMidTaka * 100, high: totalHighTaka * 100 },
    comps: candidateComps,
    radiusM,
    adjustments,
  };
}
