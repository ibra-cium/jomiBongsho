/**
 * ledger.test.ts — Tests first (TESTING.md §3 golden rule)
 * Tests for src/engine/ledger.ts following DOMAIN_RULES.md §2
 */

import { describe, expect, it } from 'vitest';
import Fraction from 'fraction.js';
import { replayLedger } from './ledger';
import type { DeedEvent, InheritanceEvent, LandEvent, MutationEvent, RecordEvent } from './types';

// ---------------------------------------------------------------------------
// Helpers to build minimal events
// ---------------------------------------------------------------------------

function rec(
  id: string,
  dagId: string,
  date: string,
  holdings: { personId: string; share: string }[],
): RecordEvent {
  return { id, dagId, date, type: 'record', survey: 'BS', khatianNo: 'K-1', holdings };
}

function deed(
  id: string,
  dagId: string,
  date: string,
  deedNo: string,
  sellers: { personId: string; share: string }[],
  buyers: { personId: string; share: string }[],
  price = 100000,
): DeedEvent {
  return {
    id,
    dagId,
    date,
    type: 'deed',
    deedNo,
    kind: 'sale',
    sellers,
    buyers,
    declaredPriceBdt: price,
    subRegistryBn: 'ঢাকা',
  };
}

function inheritance(
  id: string,
  dagId: string,
  date: string,
  deceasedId: string,
  law: 'muslim' | 'hindu',
  heirs: { personId: string; relation: string }[],
): InheritanceEvent {
  return {
    id,
    dagId,
    date,
    type: 'inheritance',
    deceasedId,
    law,
    heirs: heirs as InheritanceEvent['heirs'],
  };
}

function mutation(
  id: string,
  dagId: string,
  date: string,
  caseNo: string,
  refDeedNo: string | null,
  holdingsAfter: { personId: string; share: string }[],
): MutationEvent {
  return { id, dagId, date, type: 'mutation', caseNo, refDeedNo, holdingsAfter };
}

const TODAY = '2026-10-01';
const DAG = 'D1';

// ---------------------------------------------------------------------------
// 1. Record replace
// ---------------------------------------------------------------------------

describe('record event', () => {
  it('sets initial balances and adds to everOwned', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [
        { personId: 'alice', share: '1/2' },
        { personId: 'bob', share: '1/2' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.balances.get('alice')?.toFraction()).toBe('1/2');
    expect(result.balances.get('bob')?.toFraction()).toBe('1/2');
    expect(result.everOwned.has('alice')).toBe(true);
    expect(result.everOwned.has('bob')).toBe(true);
  });

  it('replaces previous balances on a new record', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      rec('r2', DAG, '2010-01-01', [{ personId: 'bob', share: '1/1' }]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.balances.has('alice')).toBe(false);
    expect(result.balances.get('bob')?.equals(new Fraction(1))).toBe(true);
  });

  it('raises RECORD_SUM_ERROR when holdings do not sum to 1', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [
        { personId: 'alice', share: '1/3' },
        { personId: 'bob', share: '1/3' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'RECORD_SUM_ERROR')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Valid deed — moves shares correctly
// ---------------------------------------------------------------------------

describe('valid deed', () => {
  it('subtracts from seller and adds to buyer', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '1/2' }],
        [{ personId: 'bob', share: '1/2' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.balances.get('alice')?.toFraction()).toBe('1/2');
    expect(result.balances.get('bob')?.toFraction()).toBe('1/2');
    expect(result.issues).toHaveLength(0);
  });

  it('removes seller balance when it reaches zero', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '1/1' }],
        [{ personId: 'bob', share: '1/1' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.balances.has('alice')).toBe(false);
    expect(result.balances.get('bob')?.equals(new Fraction(1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. DOUBLE_SALE — seller already appeared in a prior valid deed
// ---------------------------------------------------------------------------

describe('DOUBLE_SALE', () => {
  it('detects double sale and makes second buyer a disputed claim', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '1/1' }],
        [{ personId: 'bob', share: '1/1' }],
      ),
      deed(
        'd2',
        DAG,
        '2011-01-01',
        'DN-2',
        [{ personId: 'alice', share: '1/1' }],
        [{ personId: 'carol', share: '1/1' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'DOUBLE_SALE')).toBe(true);
    expect(result.claims.some((c) => c.personId === 'carol')).toBe(true);
    // alice's balance from d1 already went to bob — she sold everything, so now 0
    expect(result.balances.has('alice')).toBe(false);
    expect(result.balances.get('bob')?.equals(new Fraction(1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. HEIR_OVER_SALE — seller got share through inheritance and tries to sell more
// ---------------------------------------------------------------------------

describe('HEIR_OVER_SALE', () => {
  it('detects heir overselling and attaches faraiz table', () => {
    // Faruk inherits 7/20 but tries to sell 1/2
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'malek', share: '1/1' }]),
      inheritance('i1', DAG, '2021-01-01', 'malek', 'muslim', [
        { personId: 'rahima', relation: 'wife' },
        { personId: 'faruk', relation: 'son' },
        { personId: 'selim', relation: 'son' },
        { personId: 'nasima', relation: 'daughter' },
      ]),
      deed(
        'd1',
        DAG,
        '2026-01-01',
        'DN-1',
        [{ personId: 'faruk', share: '1/2' }],
        [{ personId: 'buyer', share: '1/2' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    const issue = result.issues.find((i) => i.code === 'HEIR_OVER_SALE');
    expect(issue).toBeDefined();
    expect(issue?.faraizTable).toBeDefined();
    expect(issue?.faraizTable?.length).toBeGreaterThan(0);
    // Faruk balance should stay 7/20 (deed is invalid)
    const farukBal = result.balances.get('faruk');
    expect(farukBal?.toFraction()).toBe('7/20');
    // buyer becomes a claim
    expect(result.claims.some((c) => c.personId === 'buyer')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. OVER_SALE — seller tries to sell more than they own (no prior deed, no inheritance)
// ---------------------------------------------------------------------------

describe('OVER_SALE', () => {
  it('detects over-sale by a legitimate owner who sells more than they hold', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [
        { personId: 'alice', share: '1/2' },
        { personId: 'bob', share: '1/2' },
      ]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '3/4' }], // has only 1/2
        [{ personId: 'carol', share: '3/4' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'OVER_SALE')).toBe(true);
    expect(result.claims.some((c) => c.personId === 'carol')).toBe(true);
    // alice's balance unchanged (deed invalid)
    expect(result.balances.get('alice')?.toFraction()).toBe('1/2');
  });
});

// ---------------------------------------------------------------------------
// 6. CHAIN_BREAK — seller was never an owner
// ---------------------------------------------------------------------------

describe('CHAIN_BREAK', () => {
  it('detects chain break when seller never owned any part', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'stranger', share: '1/1' }], // never owned
        [{ personId: 'carol', share: '1/1' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'CHAIN_BREAK')).toBe(true);
    expect(result.claims.some((c) => c.personId === 'carol')).toBe(true);
    expect(result.balances.get('alice')?.equals(new Fraction(1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Inheritance supported → distributes shares correctly
// ---------------------------------------------------------------------------

describe('inheritance — supported', () => {
  it('distributes inheritance shares using faraiz', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'malek', share: '1/1' }]),
      inheritance('i1', DAG, '2021-01-01', 'malek', 'muslim', [
        { personId: 'rahima', relation: 'wife' },
        { personId: 'faruk', relation: 'son' },
        { personId: 'selim', relation: 'son' },
        { personId: 'nasima', relation: 'daughter' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    // wife gets 1/8
    expect(result.balances.get('rahima')?.toFraction()).toBe('1/8');
    // each son gets 7/20
    expect(result.balances.get('faruk')?.toFraction()).toBe('7/20');
    expect(result.balances.get('selim')?.toFraction()).toBe('7/20');
    // daughter gets 7/40
    expect(result.balances.get('nasima')?.toFraction()).toBe('7/40');
    // deceased balance removed
    expect(result.balances.has('malek')).toBe(false);
    // heirs tracked in inheritedFrom
    expect(result.inheritedFrom.get('faruk')).toBe('malek');
    expect(result.issues).toHaveLength(0);
  });

  it('handles deceased with zero balance gracefully (no-op in balances)', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      // alice sells all
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '1/1' }],
        [{ personId: 'bob', share: '1/1' }],
      ),
      // alice dies with zero balance
      inheritance('i1', DAG, '2020-01-01', 'alice', 'muslim', [
        { personId: 'son1', relation: 'son' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    // zero-balance inheritance: no shares distributed, no issue
    expect(result.balances.has('son1')).toBe(false);
    expect(result.balances.get('bob')?.equals(new Fraction(1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Inheritance unsupported → estate + ESTATE_LEGAL_REVIEW
// ---------------------------------------------------------------------------

describe('inheritance — unsupported → estate', () => {
  it('moves share to estates and raises ESTATE_LEGAL_REVIEW when faraiz is unsupported', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'malek', share: '1/1' }]),
      inheritance('i1', DAG, '2023-01-01', 'malek', 'muslim', [
        // only daughters → NO_SON
        { personId: 'd1', relation: 'daughter' },
        { personId: 'd2', relation: 'daughter' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'ESTATE_LEGAL_REVIEW')).toBe(true);
    expect(result.estates.some((e) => e.deceasedId === 'malek')).toBe(true);
    expect(result.balances.has('malek')).toBe(false);
  });

  it('moves share to estates for Hindu law', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'ratan', share: '1/1' }]),
      inheritance('i1', DAG, '2023-01-01', 'ratan', 'hindu', [
        { personId: 'son1', relation: 'son' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'ESTATE_LEGAL_REVIEW')).toBe(true);
    expect(result.estates.some((e) => e.deceasedId === 'ratan')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 9. Mutation with deed → marks deed as mutated
// ---------------------------------------------------------------------------

describe('mutation with deed', () => {
  it('marks the referenced deed as mutated (no ledger change)', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '1/1' }],
        [{ personId: 'bob', share: '1/1' }],
      ),
      mutation('m1', DAG, '2010-06-01', 'CASE-1', 'DN-1', [{ personId: 'bob', share: '1/1' }]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.filter((i) => i.code === 'MUTATION_WITHOUT_DEED')).toHaveLength(0);
    // bob still has the balance
    expect(result.balances.get('bob')?.equals(new Fraction(1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. Mutation without deed → MUTATION_WITHOUT_DEED
// ---------------------------------------------------------------------------

describe('mutation without deed', () => {
  it('raises MUTATION_WITHOUT_DEED when refDeedNo does not exist', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      mutation('m1', DAG, '2010-01-01', 'CASE-1', 'DN-NONEXISTENT', [
        { personId: 'bob', share: '1/1' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'MUTATION_WITHOUT_DEED')).toBe(true);
  });

  it('raises MUTATION_WITHOUT_DEED for null refDeedNo when too far from inheritance', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'malek', share: '1/1' }]),
      inheritance('i1', DAG, '2020-01-01', 'malek', 'muslim', [
        { personId: 'son1', relation: 'son' },
      ]),
      // mutation without deed 3 years after inheritance (> 2 years) → MUTATION_WITHOUT_DEED
      mutation('m1', DAG, '2023-06-01', 'CASE-1', null, [{ personId: 'son1', share: '1/1' }]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.some((i) => i.code === 'MUTATION_WITHOUT_DEED')).toBe(true);
  });

  it('allows null refDeedNo within 2 years after an inheritance event', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'malek', share: '1/1' }]),
      inheritance('i1', DAG, '2021-01-01', 'malek', 'muslim', [
        { personId: 'son1', relation: 'son' },
      ]),
      // mutation within 2 years of inheritance → OK
      mutation('m1', DAG, '2022-06-01', 'CASE-1', null, [{ personId: 'son1', share: '1/1' }]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    expect(result.issues.filter((i) => i.code === 'MUTATION_WITHOUT_DEED')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 11. Invariant: sum(balances) + sum(estates) === 1 after every event
// ---------------------------------------------------------------------------

describe('invariant', () => {
  it('maintains sum === 1 through record, deed, and inheritance', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'malek', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'malek', share: '1/4' }],
        [{ personId: 'bob', share: '1/4' }],
      ),
      inheritance('i1', DAG, '2021-01-01', 'malek', 'muslim', [
        { personId: 'faruk', relation: 'son' },
        { personId: 'rahima', relation: 'wife' },
      ]),
    ];
    const result = replayLedger(DAG, events, TODAY);
    let total = new Fraction(0);
    for (const bal of result.balances.values()) total = total.add(bal);
    for (const est of result.estates) total = total.add(est.share);
    expect(total.equals(new Fraction(1))).toBe(true);
  });

  it('maintains invariant even with a double-sale (invalid deed does not change balances)', () => {
    const events: LandEvent[] = [
      rec('r1', DAG, '2000-01-01', [{ personId: 'alice', share: '1/1' }]),
      deed(
        'd1',
        DAG,
        '2010-01-01',
        'DN-1',
        [{ personId: 'alice', share: '1/1' }],
        [{ personId: 'bob', share: '1/1' }],
      ),
      deed(
        'd2',
        DAG,
        '2011-01-01',
        'DN-2',
        [{ personId: 'alice', share: '1/1' }], // double-sale
        [{ personId: 'carol', share: '1/1' }],
      ),
    ];
    const result = replayLedger(DAG, events, TODAY);
    let total = new Fraction(0);
    for (const bal of result.balances.values()) total = total.add(bal);
    for (const est of result.estates) total = total.add(est.share);
    expect(total.equals(new Fraction(1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 12. Scenario-specific acceptance tests from P1-T04 ticket
// ---------------------------------------------------------------------------

import { readFileSync } from 'fs';
import { join } from 'path';

function loadEvents(): LandEvent[] {
  const raw = readFileSync(join('public', 'data', 'events.json'), 'utf-8');
  return JSON.parse(raw) as LandEvent[];
}

describe('acceptance: specific scenario dags', () => {
  let allEvents: LandEvent[];

  try {
    allEvents = loadEvents();
  } catch {
    // Skip if data not generated yet
    it.skip('data not available', () => {});
    return;
  }

  it('dag 102 → DOUBLE_SALE; Buyer B in claims; Jalal balance 0', () => {
    const events = allEvents.filter((e) => e.dagId === '102');
    const result = replayLedger('102', events, TODAY);
    expect(result.issues.some((i) => i.code === 'DOUBLE_SALE')).toBe(true);
    expect(result.claims.some((c) => c.personId === 'p-buyer-b')).toBe(true);
    expect(result.balances.has('p-jalal')).toBe(false);
  });

  it('dag 103 → HEIR_OVER_SALE; Faruk balance stays 7/20', () => {
    const events = allEvents.filter((e) => e.dagId === '103');
    const result = replayLedger('103', events, TODAY);
    expect(result.issues.some((i) => i.code === 'HEIR_OVER_SALE')).toBe(true);
    expect(result.issues.find((i) => i.code === 'HEIR_OVER_SALE')?.faraizTable).toBeDefined();
    expect(result.balances.get('p-faruk')?.toFraction()).toBe('7/20');
  });

  it('dag 107 → CHAIN_BREAK', () => {
    const events = allEvents.filter((e) => e.dagId === '107');
    const result = replayLedger('107', events, TODAY);
    expect(result.issues.some((i) => i.code === 'CHAIN_BREAK')).toBe(true);
  });

  it('dag 110 → estate + ESTATE_LEGAL_REVIEW', () => {
    const events = allEvents.filter((e) => e.dagId === '110');
    const result = replayLedger('110', events, TODAY);
    expect(result.issues.some((i) => i.code === 'ESTATE_LEGAL_REVIEW')).toBe(true);
    expect(result.estates.length).toBeGreaterThan(0);
  });

  it('dag 111 → MUTATION_WITHOUT_DEED', () => {
    const events = allEvents.filter((e) => e.dagId === '111');
    const result = replayLedger('111', events, TODAY);
    expect(result.issues.some((i) => i.code === 'MUTATION_WITHOUT_DEED')).toBe(true);
  });

  it('invariant holds for all 48 generated dags', () => {
    const dagIds = [...new Set(allEvents.map((e) => e.dagId))];
    for (const dagId of dagIds) {
      const events = allEvents.filter((e) => e.dagId === dagId);
      const result = replayLedger(dagId, events, TODAY);
      let total = new Fraction(0);
      for (const bal of result.balances.values()) total = total.add(bal);
      for (const est of result.estates) total = total.add(est.share);
      expect(total.equals(new Fraction(1)), `Invariant failed for dag ${dagId}`).toBe(true);
    }
  });
});
