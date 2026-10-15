/**
 * Data loading module for Jomi Bongsho
 * Fetches the 6 synthetic datasets, validates shapes, and caches in memory
 */
import type {
  DemoData,
  Mouza,
  FeatureCollection,
  GeoPolygon,
  DagProps,
  Person,
  LandEvent,
  Scenario,
  FeeRules,
} from '@/engine/types';
import { validateDemoData } from './validate';

let cachedPromise: Promise<DemoData> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function loadDemoData(): Promise<DemoData> {
  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      const [mouza, dags, people, events, scenarios, feeRules] = await Promise.all([
        fetchJson<Mouza>('/data/mouza.json'),
        fetchJson<FeatureCollection<GeoPolygon, DagProps>>('/data/dags.geojson'),
        fetchJson<Person[]>('/data/people.json'),
        fetchJson<LandEvent[]>('/data/events.json'),
        fetchJson<Scenario[]>('/data/scenarios.json'),
        fetchJson<FeeRules>('/data/feeRules.json'),
      ]);

      const demoData: DemoData = {
        mouza,
        dags,
        people,
        events,
        scenarios,
        feeRules,
      };

      validateDemoData(demoData);
      return demoData;
    } catch (err) {
      cachedPromise = null; // allow retry on failure
      throw err;
    }
  })();

  return cachedPromise;
}

export function clearDataCache(): void {
  cachedPromise = null;
}
