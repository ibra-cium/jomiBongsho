import { describe, it, expect } from 'vitest';
import { findDagAtPoint } from './geo';
import fs from 'node:fs';
import path from 'node:path';
import type { FeatureCollection, Polygon } from 'geojson';
import type { DagProps } from '@/engine/types';

const dagsJson = fs.readFileSync(
  path.resolve(__dirname, '../../public/data/dags.geojson'),
  'utf-8',
);
const dags = JSON.parse(dagsJson) as FeatureCollection<Polygon, DagProps>;

describe('geo - findDagAtPoint', () => {
  it('finds Dag 101 from a coordinate inside its polygon', () => {
    // Coordinate inside Dag 101
    // Dag 101 bbox is around [90.0484, 23.8689] to [90.0488, 23.8693]
    const pointInside101: [number, number] = [90.0486, 23.8691];
    const match = findDagAtPoint(pointInside101, dags.features);
    expect(match).not.toBeNull();
    expect(match?.properties.id).toBe('101');
  });

  it('finds Dag 105 from a coordinate inside its polygon', () => {
    // Get centroid of 105 or a node inside
    const feature105 = dags.features.find((f) => f.properties.id === '105');
    expect(feature105).toBeDefined();
    const coords = feature105!.geometry.coordinates[0]!;
    // average coords to get an interior point
    const avgLng = coords.reduce((sum, c) => sum + (c[0] ?? 0), 0) / coords.length;
    const avgLat = coords.reduce((sum, c) => sum + (c[1] ?? 0), 0) / coords.length;

    const match = findDagAtPoint([avgLng, avgLat], dags.features);
    expect(match).not.toBeNull();
    expect(match?.properties.id).toBe('105');
  });

  it('returns null for coordinates outside the mouza', () => {
    // Manikganj town center or Dhaka center
    const dhakaCenter: [number, number] = [90.4125, 23.8103];
    const match = findDagAtPoint(dhakaCenter, dags.features);
    expect(match).toBeNull();
  });

  it('returns null when feature list is empty', () => {
    const point: [number, number] = [90.0486, 23.8691];
    expect(findDagAtPoint(point, [])).toBeNull();
  });
});
