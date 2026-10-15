import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type {
  DagProps,
  FeatureCollection,
  GeoPolygon,
  LandEvent,
  Person,
} from '../src/engine/types';
import { DEMO_TODAY } from './config';
import { generateData } from './generate-data';
import { SCENARIOS } from './scenarios';

const DATA_DIR = path.resolve(process.cwd(), 'public/data');

function computeFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

describe('Synthetic Data Generator (P1-T02)', () => {
  it('produces byte-identical files when run twice (determinism)', () => {
    // First run
    generateData();
    const files = [
      'mouza.json',
      'dags.geojson',
      'people.json',
      'events.json',
      'scenarios.json',
      'feeRules.json',
    ];
    const firstHashes = files.map((file) => computeFileHash(path.join(DATA_DIR, file)));

    // Second run
    generateData();
    const secondHashes = files.map((file) => computeFileHash(path.join(DATA_DIR, file)));

    expect(firstHashes).toEqual(secondHashes);
  });

  it('contains exactly 48 dags with IDs 101 to 148', () => {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'dags.geojson'), 'utf8');
    const geojson = JSON.parse(raw) as FeatureCollection<GeoPolygon, DagProps>;

    expect(geojson.features).toHaveLength(48);

    const ids = geojson.features.map((f) => f.properties.id);
    for (let i = 101; i <= 148; i++) {
      expect(ids).toContain(String(i));
    }

    // Row 0 dags are road-facing
    for (let i = 101; i <= 108; i++) {
      const dag = geojson.features.find((f) => f.properties.id === String(i));
      expect(dag?.properties.roadFacing).toBe(true);
    }

    // Row 1-5 dags are not road-facing
    for (let i = 109; i <= 148; i++) {
      const dag = geojson.features.find((f) => f.properties.id === String(i));
      expect(dag?.properties.roadFacing).toBe(false);
    }
  });

  it('sets dag 103 area to exactly 30.0 decimal', () => {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'dags.geojson'), 'utf8');
    const geojson = JSON.parse(raw) as FeatureCollection<GeoPolygon, DagProps>;
    const dag103 = geojson.features.find((f) => f.properties.id === '103');
    expect(dag103?.properties.recordedAreaDecimal).toBe(30.0);
  });

  it('contains all 12 scenario dags with correct expected verdicts', () => {
    const rawScenarios = fs.readFileSync(path.join(DATA_DIR, 'scenarios.json'), 'utf8');
    const scenarios = JSON.parse(rawScenarios) as typeof SCENARIOS;

    expect(scenarios).toHaveLength(12);
    expect(scenarios.map((s) => s.dagId)).toEqual([
      '101',
      '102',
      '103',
      '104',
      '105',
      '106',
      '107',
      '108',
      '109',
      '110',
      '111',
      '112',
    ]);

    expect(scenarios.find((s) => s.dagId === '101')?.expected).toBe('green');
    expect(scenarios.find((s) => s.dagId === '102')?.expected).toBe('red');
    expect(scenarios.find((s) => s.dagId === '103')?.expected).toBe('red');
    expect(scenarios.find((s) => s.dagId === '104')?.expected).toBe('yellow');
    expect(scenarios.find((s) => s.dagId === '105')?.expected).toBe('yellow');
    expect(scenarios.find((s) => s.dagId === '106')?.expected).toBe('yellow');
    expect(scenarios.find((s) => s.dagId === '107')?.expected).toBe('red');
    expect(scenarios.find((s) => s.dagId === '108')?.expected).toBe('red');
    expect(scenarios.find((s) => s.dagId === '109')?.expected).toBe('red');
    expect(scenarios.find((s) => s.dagId === '110')?.expected).toBe('yellow');
    expect(scenarios.find((s) => s.dagId === '111')?.expected).toBe('red');
    expect(scenarios.find((s) => s.dagId === '112')?.expected).toBe('green');
  });

  it('guarantees >= 6 sales in 24 months before DEMO_TODAY for common land classes', () => {
    const rawEvents = fs.readFileSync(path.join(DATA_DIR, 'events.json'), 'utf8');
    const events = JSON.parse(rawEvents) as LandEvent[];

    const rawDags = fs.readFileSync(path.join(DATA_DIR, 'dags.geojson'), 'utf8');
    const geojson = JSON.parse(rawDags) as FeatureCollection<GeoPolygon, DagProps>;
    const dagClassMap = new Map(
      geojson.features.map((f) => [f.properties.id, f.properties.landClass]),
    );

    const cutoff = '2024-10-01';
    const recentSales = events.filter(
      (ev) =>
        ev.type === 'deed' && ev.kind === 'sale' && ev.date >= cutoff && ev.date <= DEMO_TODAY,
    );

    const counts: Record<string, number> = { bastu: 0, vita: 0, nal: 0 };
    for (const sale of recentSales) {
      const lc = dagClassMap.get(sale.dagId);
      if (lc && lc in counts) {
        counts[lc] = (counts[lc] ?? 0) + 1;
      }
    }

    expect(counts['bastu']).toBeGreaterThanOrEqual(6);
    expect(counts['vita']).toBeGreaterThanOrEqual(6);
    expect(counts['nal']).toBeGreaterThanOrEqual(6);
  });

  it('guarantees synthetic privacy: no phone, NID, or address fields', () => {
    const rawPeople = fs.readFileSync(path.join(DATA_DIR, 'people.json'), 'utf8');
    const people = JSON.parse(rawPeople) as Person[];

    expect(people.length).toBeGreaterThanOrEqual(140);

    for (const p of people) {
      const keys = Object.keys(p);
      expect(keys).not.toContain('phone');
      expect(keys).not.toContain('nid');
      expect(keys).not.toContain('nidNumber');
      expect(keys).not.toContain('address');
      expect(p.nameBn.length).toBeGreaterThan(0);
      expect(p.nameEn.length).toBeGreaterThan(0);
      expect(['M', 'F']).toContain(p.sex);
    }
  });

  it('ensures no event date is after DEMO_TODAY', () => {
    const rawEvents = fs.readFileSync(path.join(DATA_DIR, 'events.json'), 'utf8');
    const events = JSON.parse(rawEvents) as LandEvent[];

    for (const ev of events) {
      expect(ev.date <= DEMO_TODAY).toBe(true);
    }
  });
});
