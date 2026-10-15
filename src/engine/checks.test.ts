/**
 * checks.test.ts — Tests for src/engine/checks.ts (non-ledger checks)
 * Tests written BEFORE implementation per AGENTS.md §3 rule 5.
 */

import { describe, expect, it } from 'vitest';
import type { DagProps, GeoPolygon, LandEvent } from './types';
import { runChecks } from './checks';
import type { LedgerResult } from './ledger';
import Fraction from 'fraction.js';

// ---------------------------------------------------------------------------
// Helpers to build minimal test fixtures
// ---------------------------------------------------------------------------

function makeDagProps(overrides: Partial<DagProps> = {}): DagProps {
  return {
    id: '101',
    mouzaId: 'notunchar',
    dagNo: { BS: '101' },
    landClass: 'bastu',
    recordedAreaDecimal: 10,
    roadFacing: false,
    flags: {},
    ...overrides,
  };
}

function makeEmptyLedger(overrides: Partial<LedgerResult> = {}): LedgerResult {
  return {
    balances: new Map<string, Fraction>([['p1', new Fraction(1)]]),
    estates: [],
    claims: [],
    timeline: [],
    issues: [],
    everOwned: new Set(['p1']),
    inheritedFrom: new Map(),
    validDeedNos: new Map(),
    mutatedDeedNos: new Set(),
    lastInheritanceDate: null,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<LandEvent> & { type: LandEvent['type'] }): LandEvent {
  const base = { id: 'e1', dagId: '101', date: '2025-01-01' };
  // We use any-cast to build a minimal event for each type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...base, ...overrides } as any;
}

// ---------------------------------------------------------------------------
// KHAS_LAND check
// ---------------------------------------------------------------------------

describe('KHAS_LAND check', () => {
  it('raises KHAS_LAND critical issue when flags.khas is true', () => {
    const dag = makeDagProps({ flags: { khas: true } });
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, [], ledger, '2026-10-01');
    const khas = issues.find((i) => i.code === 'KHAS_LAND');
    expect(khas).toBeDefined();
    expect(khas!.severity).toBe('critical');
  });

  it('does NOT raise KHAS_LAND when flags.khas is false', () => {
    const dag = makeDagProps({ flags: { khas: false } });
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, [], ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'KHAS_LAND')).toBeUndefined();
  });

  it('does NOT raise KHAS_LAND when flags is empty', () => {
    const dag = makeDagProps({ flags: {} });
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, [], ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'KHAS_LAND')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PENDING_CASE check
// ---------------------------------------------------------------------------

describe('PENDING_CASE check', () => {
  it('raises PENDING_CASE critical when latest case event is pending', () => {
    const dag = makeDagProps();
    const events: LandEvent[] = [
      makeEvent({
        id: 'c1',
        type: 'case',
        date: '2025-06-01',
        caseNo: 'CS/123/2025',
        courtBn: 'সহকারী জজ আদালত',
        status: 'pending',
      }),
    ];
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    const found = issues.find((i) => i.code === 'PENDING_CASE');
    expect(found).toBeDefined();
    expect(found!.severity).toBe('critical');
  });

  it('does NOT raise PENDING_CASE when latest case event is disposed', () => {
    const dag = makeDagProps();
    const events: LandEvent[] = [
      makeEvent({
        id: 'c1',
        type: 'case',
        date: '2025-01-01',
        caseNo: 'CS/100/2024',
        courtBn: 'সহকারী জজ আদালত',
        status: 'pending',
      }),
      makeEvent({
        id: 'c2',
        type: 'case',
        date: '2025-06-01',
        caseNo: 'CS/100/2024',
        courtBn: 'সহকারী জজ আদালত',
        status: 'disposed',
      }),
    ];
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'PENDING_CASE')).toBeUndefined();
  });

  it('raises PENDING_CASE if any unique case number is still pending', () => {
    const dag = makeDagProps();
    const events: LandEvent[] = [
      makeEvent({
        id: 'c1',
        type: 'case',
        date: '2025-01-01',
        caseNo: 'CASE-A',
        courtBn: 'আদালত',
        status: 'pending',
      }),
      makeEvent({
        id: 'c2',
        type: 'case',
        date: '2025-06-01',
        caseNo: 'CASE-B',
        courtBn: 'আদালত',
        status: 'disposed',
      }),
    ];
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    const found = issues.find((i) => i.code === 'PENDING_CASE');
    expect(found).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// REG_WITHOUT_MUTATION check (90-day rule)
// ---------------------------------------------------------------------------

describe('REG_WITHOUT_MUTATION check', () => {
  it('raises REG_WITHOUT_MUTATION warning for a valid deed older than 90 days with no mutation', () => {
    const dag = makeDagProps();
    // valid deed registered > 90 days before today
    const deedId = 'd1';
    const ledger = makeEmptyLedger({
      validDeedNos: new Map([['DEED-001', deedId]]),
      mutatedDeedNos: new Set(), // not mutated
    });
    // The deed event itself (date > 90 days before 2026-10-01)
    const events: LandEvent[] = [
      makeEvent({
        id: deedId,
        type: 'deed',
        date: '2025-01-01', // well beyond 90 days before 2026-10-01
        deedNo: 'DEED-001',
        kind: 'sale',
        sellers: [{ personId: 'p1', share: '1/2' }],
        buyers: [{ personId: 'p2', share: '1/2' }],
        declaredPriceBdt: 500000,
        subRegistryBn: 'উপজেলা সাব-রেজিস্ট্রি',
      }),
    ];
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    const found = issues.find((i) => i.code === 'REG_WITHOUT_MUTATION');
    expect(found).toBeDefined();
    expect(found!.severity).toBe('warning');
  });

  it('does NOT raise REG_WITHOUT_MUTATION when a valid deed is mutated', () => {
    const dag = makeDagProps();
    const deedId = 'd1';
    const ledger = makeEmptyLedger({
      validDeedNos: new Map([['DEED-001', deedId]]),
      mutatedDeedNos: new Set(['DEED-001']), // mutated
    });
    const events: LandEvent[] = [
      makeEvent({
        id: deedId,
        type: 'deed',
        date: '2025-01-01',
        deedNo: 'DEED-001',
        kind: 'sale',
        sellers: [{ personId: 'p1', share: '1/2' }],
        buyers: [{ personId: 'p2', share: '1/2' }],
        declaredPriceBdt: 500000,
        subRegistryBn: 'উপজেলা সাব-রেজিস্ট্রি',
      }),
    ];
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'REG_WITHOUT_MUTATION')).toBeUndefined();
  });

  it('does NOT raise REG_WITHOUT_MUTATION for a deed within 90 days', () => {
    const dag = makeDagProps();
    const deedId = 'd1';
    const ledger = makeEmptyLedger({
      validDeedNos: new Map([['DEED-NEW', deedId]]),
      mutatedDeedNos: new Set(),
    });
    const events: LandEvent[] = [
      makeEvent({
        id: deedId,
        type: 'deed',
        date: '2026-09-01', // only 30 days before 2026-10-01
        deedNo: 'DEED-NEW',
        kind: 'sale',
        sellers: [{ personId: 'p1', share: '1/2' }],
        buyers: [{ personId: 'p2', share: '1/2' }],
        declaredPriceBdt: 300000,
        subRegistryBn: 'উপজেলা সাব-রেজিস্ট্রি',
      }),
    ];
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'REG_WITHOUT_MUTATION')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// RAPID_RESALE check (3+ valid deeds in 180-day window)
// ---------------------------------------------------------------------------

describe('RAPID_RESALE check', () => {
  it('raises RAPID_RESALE warning for 3 valid deeds within 180 days', () => {
    const dag = makeDagProps();
    // 3 valid deeds within a 5-month window
    const ledger = makeEmptyLedger({
      validDeedNos: new Map([
        ['D1', 'e1'],
        ['D2', 'e2'],
        ['D3', 'e3'],
      ]),
      mutatedDeedNos: new Set(),
    });
    const events: LandEvent[] = [
      makeEvent({
        id: 'e1',
        type: 'deed',
        date: '2026-01-15',
        deedNo: 'D1',
        kind: 'sale',
        sellers: [{ personId: 'p1', share: '1/1' }],
        buyers: [{ personId: 'p2', share: '1/1' }],
        declaredPriceBdt: 100000,
        subRegistryBn: 'x',
      }),
      makeEvent({
        id: 'e2',
        type: 'deed',
        date: '2026-03-10',
        deedNo: 'D2',
        kind: 'sale',
        sellers: [{ personId: 'p2', share: '1/1' }],
        buyers: [{ personId: 'p3', share: '1/1' }],
        declaredPriceBdt: 120000,
        subRegistryBn: 'x',
      }),
      makeEvent({
        id: 'e3',
        type: 'deed',
        date: '2026-05-20',
        deedNo: 'D3',
        kind: 'sale',
        sellers: [{ personId: 'p3', share: '1/1' }],
        buyers: [{ personId: 'p4', share: '1/1' }],
        declaredPriceBdt: 150000,
        subRegistryBn: 'x',
      }),
    ];
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    const found = issues.find((i) => i.code === 'RAPID_RESALE');
    expect(found).toBeDefined();
    expect(found!.severity).toBe('warning');
  });

  it('does NOT raise RAPID_RESALE for only 2 valid deeds in 180 days', () => {
    const dag = makeDagProps();
    const ledger = makeEmptyLedger({
      validDeedNos: new Map([
        ['D1', 'e1'],
        ['D2', 'e2'],
      ]),
      mutatedDeedNos: new Set(),
    });
    const events: LandEvent[] = [
      makeEvent({
        id: 'e1',
        type: 'deed',
        date: '2026-01-01',
        deedNo: 'D1',
        kind: 'sale',
        sellers: [{ personId: 'p1', share: '1/1' }],
        buyers: [{ personId: 'p2', share: '1/1' }],
        declaredPriceBdt: 100000,
        subRegistryBn: 'x',
      }),
      makeEvent({
        id: 'e2',
        type: 'deed',
        date: '2026-04-01',
        deedNo: 'D2',
        kind: 'sale',
        sellers: [{ personId: 'p2', share: '1/1' }],
        buyers: [{ personId: 'p3', share: '1/1' }],
        declaredPriceBdt: 120000,
        subRegistryBn: 'x',
      }),
    ];
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'RAPID_RESALE')).toBeUndefined();
  });

  it('does NOT raise RAPID_RESALE for 3 deeds spread more than 180 days apart', () => {
    const dag = makeDagProps();
    const ledger = makeEmptyLedger({
      validDeedNos: new Map([
        ['D1', 'e1'],
        ['D2', 'e2'],
        ['D3', 'e3'],
      ]),
      mutatedDeedNos: new Set(),
    });
    const events: LandEvent[] = [
      makeEvent({
        id: 'e1',
        type: 'deed',
        date: '2024-01-01',
        deedNo: 'D1',
        kind: 'sale',
        sellers: [{ personId: 'p1', share: '1/1' }],
        buyers: [{ personId: 'p2', share: '1/1' }],
        declaredPriceBdt: 100000,
        subRegistryBn: 'x',
      }),
      makeEvent({
        id: 'e2',
        type: 'deed',
        date: '2024-10-01',
        deedNo: 'D2',
        kind: 'sale',
        sellers: [{ personId: 'p2', share: '1/1' }],
        buyers: [{ personId: 'p3', share: '1/1' }],
        declaredPriceBdt: 120000,
        subRegistryBn: 'x',
      }),
      makeEvent({
        id: 'e3',
        type: 'deed',
        date: '2025-07-01',
        deedNo: 'D3',
        kind: 'sale',
        sellers: [{ personId: 'p3', share: '1/1' }],
        buyers: [{ personId: 'p4', share: '1/1' }],
        declaredPriceBdt: 150000,
        subRegistryBn: 'x',
      }),
    ];
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'RAPID_RESALE')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// TAX_ARREARS check
// ---------------------------------------------------------------------------

describe('TAX_ARREARS check', () => {
  it('raises TAX_ARREARS info when latest landTax event has arrears > 0', () => {
    const dag = makeDagProps();
    const events: LandEvent[] = [
      makeEvent({
        id: 'lt1',
        type: 'landTax',
        date: '2026-01-01',
        paidUpToYear: 2022,
        arrearsBdt: 18500,
      }),
    ];
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    const found = issues.find((i) => i.code === 'TAX_ARREARS');
    expect(found).toBeDefined();
    expect(found!.severity).toBe('info');
    expect(found!.params['arrearsBdt']).toBe(18500);
  });

  it('does NOT raise TAX_ARREARS when latest landTax event has arrears 0', () => {
    const dag = makeDagProps();
    const events: LandEvent[] = [
      makeEvent({
        id: 'lt1',
        type: 'landTax',
        date: '2026-01-01',
        paidUpToYear: 2026,
        arrearsBdt: 0,
      }),
    ];
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'TAX_ARREARS')).toBeUndefined();
  });

  it('does NOT raise TAX_ARREARS when there are no landTax events', () => {
    const dag = makeDagProps();
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, [], ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'TAX_ARREARS')).toBeUndefined();
  });

  it('uses the LATEST landTax event (by date) even if older ones have arrears', () => {
    const dag = makeDagProps();
    const events: LandEvent[] = [
      makeEvent({
        id: 'lt1',
        type: 'landTax',
        date: '2024-01-01',
        paidUpToYear: 2022,
        arrearsBdt: 5000,
      }),
      makeEvent({
        id: 'lt2',
        type: 'landTax',
        date: '2026-08-01',
        paidUpToYear: 2026,
        arrearsBdt: 0,
      }),
    ];
    const ledger = makeEmptyLedger();
    const issues = runChecks(dag, events, ledger, '2026-10-01');
    expect(issues.find((i) => i.code === 'TAX_ARREARS')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Combined: no false positives for a clean dag
// ---------------------------------------------------------------------------

describe('Clean dag produces no check issues', () => {
  it('returns no issues for a perfectly clean dag', () => {
    const dag = makeDagProps({ flags: {} });
    const ledger = makeEmptyLedger({
      validDeedNos: new Map(),
      mutatedDeedNos: new Set(),
    });
    const issues = runChecks(dag, [], ledger, '2026-10-01');
    expect(issues).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// UNDER_DECLARED check tests
// ---------------------------------------------------------------------------

describe('UNDER_DECLARED check', () => {
  const d = 0.001;
  const targetPolygon: GeoPolygon = {
    type: 'Polygon',
    coordinates: [
      [
        [90.05 - d, 23.87 - d],
        [90.05 + d, 23.87 - d],
        [90.05 + d, 23.87 + d],
        [90.05 - d, 23.87 + d],
        [90.05 - d, 23.87 - d],
      ],
    ],
  };

  it('detects sale deed declared at < 50% of comparable market estimate', () => {
    const targetDag = makeDagProps({ id: '106', landClass: 'vita', recordedAreaDecimal: 10 });
    const targetFeature = {
      type: 'Feature' as const,
      properties: targetDag,
      geometry: targetPolygon,
    };

    // 4 comp dags with market price ~100k/dec
    const compFeatures = ['101', '102', '103', '104'].map((id) => ({
      type: 'Feature' as const,
      properties: makeDagProps({ id, landClass: 'vita', recordedAreaDecimal: 10 }),
      geometry: targetPolygon,
    }));

    const allDags = {
      type: 'FeatureCollection' as const,
      features: [targetFeature, ...compFeatures],
    };

    const compEvents: LandEvent[] = compFeatures.map((f, idx) => ({
      id: `ev-comp-${f.properties.id}`,
      dagId: f.properties.id,
      date: `2025-0${idx + 1}-01`,
      type: 'deed',
      kind: 'sale',
      deedNo: `D-comp-${f.properties.id}`,
      sellers: [{ personId: 'p1', share: '1/1' }],
      buyers: [{ personId: 'p2', share: '1/1' }],
      declaredPriceBdt: 1_000_000, // 100,000 / dec
      subRegistryBn: 'মানিকগঞ্জ সদর',
    }));

    // Target dag deed declared at 30k/dec (< 50% of 100k)
    const targetDeed: LandEvent = {
      id: 'ev-106-sale',
      dagId: '106',
      date: '2026-05-18',
      type: 'deed',
      kind: 'sale',
      deedNo: 'D-2026-106',
      sellers: [{ personId: 'p1', share: '1/1' }],
      buyers: [{ personId: 'p2', share: '1/1' }],
      declaredPriceBdt: 300_000, // 30,000 / dec
      subRegistryBn: 'মানিকগঞ্জ সদর',
    };

    const ledger = makeEmptyLedger({
      validDeedNos: new Map([['D-2026-106', 'ev-106-sale']]),
      mutatedDeedNos: new Set(['D-2026-106']),
    });

    const issues = runChecks(targetDag, [targetDeed], ledger, '2026-10-01', {
      allDags,
      allEvents: [...compEvents, targetDeed],
    });

    const issue = issues.find((i) => i.code === 'UNDER_DECLARED');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
    expect(issue?.eventIds).toEqual(['ev-106-sale']);
    expect(issue?.params.declaredPrice).toBe(30_000);
    expect(issue?.params.pct).toBe(30);
  });
});
