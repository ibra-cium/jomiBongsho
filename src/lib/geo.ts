import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Feature, Polygon } from 'geojson';
import type { DagProps } from '@/engine/types';

export type DagFeature = Feature<Polygon, DagProps>;

/**
 * Finds the Dag feature containing the given [lng, lat] point.
 * Returns null if the point is outside all dags or if dags array is empty.
 */
export function findDagAtPoint(lngLat: [number, number], dags: DagFeature[]): DagFeature | null {
  if (!dags || dags.length === 0) {
    return null;
  }

  const pt = point(lngLat);

  for (const feature of dags) {
    if (feature.geometry && feature.geometry.type === 'Polygon') {
      try {
        if (booleanPointInPolygon(pt, feature)) {
          return feature;
        }
      } catch {
        // Continue searching in case of malformed polygon
      }
    }
  }

  return null;
}
