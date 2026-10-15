/**
 * Data validation helpers for Jomi Bongsho
 * Performs light shape assertions on loaded synthetic data
 */
import type { DemoData, Mouza, FeatureCollection, GeoPolygon, DagProps } from '@/engine/types';

export function validateMouza(data: unknown): asserts data is Mouza {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid mouza: not an object');
  }
  const m = data as Partial<Mouza>;
  if (!m.id || !m.nameBn || !m.center || !m.bbox || !m.roadLine) {
    throw new Error('Invalid mouza: missing required fields (id, nameBn, center, bbox, roadLine)');
  }
  if (!Array.isArray(m.center) || m.center.length !== 2) {
    throw new Error('Invalid mouza: center must be [lng, lat]');
  }
  if (!Array.isArray(m.bbox) || m.bbox.length !== 4) {
    throw new Error('Invalid mouza: bbox must be [minLng, minLat, maxLng, maxLat]');
  }
}

export function validateDags(
  data: unknown,
): asserts data is FeatureCollection<GeoPolygon, DagProps> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid dags: not an object');
  }
  const fc = data as Partial<FeatureCollection<GeoPolygon, DagProps>>;
  if (fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
    throw new Error('Invalid dags: must be FeatureCollection');
  }
  if (fc.features.length < 48) {
    throw new Error(`Invalid dags: Expected at least 48 dags, found ${fc.features.length}`);
  }
}

export function validateDemoData(data: unknown): data is DemoData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data payload: not an object');
  }

  const d = data as Partial<DemoData>;
  validateMouza(d.mouza);
  validateDags(d.dags);

  if (!Array.isArray(d.people) || d.people.length === 0) {
    throw new Error('Invalid people: array cannot be empty');
  }

  if (!Array.isArray(d.events)) {
    throw new Error('Invalid events: must be an array');
  }

  if (!Array.isArray(d.scenarios) || d.scenarios.length === 0) {
    throw new Error('Invalid scenarios: array cannot be empty');
  }

  if (!d.feeRules || typeof d.feeRules !== 'object' || !d.feeRules.bp) {
    throw new Error('Invalid feeRules: missing fee rules definition');
  }

  return true;
}
