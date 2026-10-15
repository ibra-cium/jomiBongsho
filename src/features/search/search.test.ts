import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { FeatureCollection, Polygon } from 'geojson';
import type { DagProps } from '@/engine/types';
import { searchDags } from './search';

const dagsJson = fs.readFileSync(
  path.resolve(__dirname, '../../../public/data/dags.geojson'),
  'utf-8',
);
const dags = JSON.parse(dagsJson) as FeatureCollection<Polygon, DagProps>;

describe('searchDags', () => {
  it('finds Dag 101 with English digits "101"', () => {
    const results = searchDags('101', dags.features);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]?.feature.properties.id).toBe('101');
  });

  it('finds Dag 101 with Bangla digits "১০১"', () => {
    const results = searchDags('১০১', dags.features);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]?.feature.properties.id).toBe('101');
  });

  it('finds Dag 103 with "১০৩" and "103"', () => {
    const resultsBn = searchDags('১০৩', dags.features);
    const resultsEn = searchDags('103', dags.features);
    expect(resultsBn[0]?.feature.properties.id).toBe('103');
    expect(resultsEn[0]?.feature.properties.id).toBe('103');
  });

  it('finds dags matching older survey "CS 1"', () => {
    const results = searchDags('CS 1', dags.features);
    expect(results.length).toBeGreaterThan(0);
    // In our synthetic data, CS 1 maps to dags 101 & 102
    const ids = results.map((r) => r.feature.properties.id);
    expect(ids).toContain('101');
  });

  it('finds dags matching older survey "CS 12" or "cs12"', () => {
    const results = searchDags('CS 12', dags.features);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.feature.properties.dagNo.CS).toBe('12');
  });

  it('handles Bangla survey prefix "সিএস ১২"', () => {
    const results = searchDags('সিএস ১২', dags.features);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.feature.properties.dagNo.CS).toBe('12');
  });

  it('finds dags matching "RS 201"', () => {
    const results = searchDags('RS 201', dags.features);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.feature.properties.id).toBe('101');
  });

  it('returns empty array when no dag matches', () => {
    const results = searchDags('999', dags.features);
    expect(results).toEqual([]);
  });

  it('returns empty array for empty query', () => {
    expect(searchDags('', dags.features)).toEqual([]);
    expect(searchDags('   ', dags.features)).toEqual([]);
  });
});
