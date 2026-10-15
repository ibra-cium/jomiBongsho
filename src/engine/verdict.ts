/**
 * verdict.ts — Verdict computation and owner row builder
 * Pure TypeScript, no React/DOM/fetch — AGENTS.md rule 4
 *
 * Implements DOMAIN_RULES.md §5:
 *   any critical → red, any warning → yellow, else green
 *   Sort: critical → warning → info, then by date
 *   Green never says "safe"; it says "no risk found"
 */

import type { DagProps, DeedEvent, Issue, LandEvent, Person, Verdict } from './types';
import type { LedgerResult } from './ledger';

// ---------------------------------------------------------------------------
// Owner row — what the UI needs to render owners
// ---------------------------------------------------------------------------

export interface OwnerRow {
  personId: string;
  /** Display name (nameBn or nameEn) */
  nameBn: string;
  nameEn: string;
  /** Fraction string e.g. "7/20" */
  share: string;
  /** Area in decimal (float for display only) */
  areaDecimal: number;
  /** How this person acquired the share */
  acquiredBy: 'record' | 'deed' | 'inheritance';
  /** Is this a disputed claim (buyer of an invalid deed)? */
  isClaim: boolean;
  /** Is this an unsupported inheritance estate? */
  isEstate: boolean;
  /** Event id of the deed that is disputed (for claims) */
  deedId?: string;
  /** Reason estate is in legal review (for estates) */
  estateReason?: string;
}

// ---------------------------------------------------------------------------
// Severity ordering helper
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: Record<Issue['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

// ---------------------------------------------------------------------------
// computeVerdict
// ---------------------------------------------------------------------------

/**
 * Derives the green/yellow/red verdict from a merged issue list.
 * DOMAIN_RULES §5: any critical → red; any warning → yellow; else green.
 */
export function computeVerdict(issues: Issue[]): Verdict {
  if (issues.some((i) => i.severity === 'critical')) return 'red';
  if (issues.some((i) => i.severity === 'warning')) return 'yellow';
  return 'green';
}

// ---------------------------------------------------------------------------
// sortIssues
// ---------------------------------------------------------------------------

/**
 * Sorts issues per DOMAIN_RULES §5: critical → warning → info, then by date
 * of the first event referenced, oldest first.
 */
export function sortIssues(issues: Issue[], events: LandEvent[]): Issue[] {
  const dateOf = (issue: Issue): string => {
    const first = issue.eventIds[0];
    if (!first) return '0000-00-00';
    const ev = events.find((e) => e.id === first);
    return ev?.date ?? '0000-00-00';
  };
  return [...issues].sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return dateOf(a).localeCompare(dateOf(b));
  });
}

// ---------------------------------------------------------------------------
// buildOwnerRows
// ---------------------------------------------------------------------------

/**
 * Constructs the owner rows for the UI from ledger state.
 * Includes:
 *  - Valid balance holders (acquired via record, deed, or inheritance)
 *  - Disputed claim holders (buyers of invalid deeds)
 *  - Unsupported inheritance estates
 */
export function buildOwnerRows(
  dag: DagProps,
  ledger: LedgerResult,
  people: Person[],
  events: LandEvent[],
): OwnerRow[] {
  const peopleMap = new Map(people.map((p) => [p.id, p]));

  const rows: OwnerRow[] = [];

  // ── Valid balance holders ─────────────────────────────────────────────────
  for (const [personId, fraction] of ledger.balances.entries()) {
    const person = peopleMap.get(personId);
    const shareStr = fraction.toFraction();
    const areaDecimal = parseFloat((fraction.valueOf() * dag.recordedAreaDecimal).toFixed(2));

    // Determine how they acquired the share
    let acquiredBy: OwnerRow['acquiredBy'] = 'record';
    if (ledger.inheritedFrom.has(personId)) {
      acquiredBy = 'inheritance';
    } else {
      // Check if they appear in any valid deed as buyer
      const appearsInDeed = events.some(
        (e) =>
          e.type === 'deed' &&
          ledger.validDeedNos.has((e as DeedEvent).deedNo) &&
          (e as DeedEvent).buyers.some((b) => b.personId === personId),
      );
      if (appearsInDeed) acquiredBy = 'deed';
    }

    rows.push({
      personId,
      nameBn: person?.nameBn ?? personId,
      nameEn: person?.nameEn ?? personId,
      share: shareStr,
      areaDecimal,
      acquiredBy,
      isClaim: false,
      isEstate: false,
    });
  }

  // ── Disputed claims (buyers of invalid deeds) ─────────────────────────────
  for (const claim of ledger.claims) {
    const person = peopleMap.get(claim.personId);
    const areaDecimal = parseFloat((claim.share.valueOf() * dag.recordedAreaDecimal).toFixed(2));
    rows.push({
      personId: claim.personId,
      nameBn: person?.nameBn ?? claim.personId,
      nameEn: person?.nameEn ?? claim.personId,
      share: claim.share.toFraction(),
      areaDecimal,
      acquiredBy: 'deed',
      isClaim: true,
      isEstate: false,
      deedId: claim.deedId,
    });
  }

  // ── Estates awaiting legal review ─────────────────────────────────────────
  for (const estate of ledger.estates) {
    const person = peopleMap.get(estate.deceasedId);
    const areaDecimal = parseFloat((estate.share.valueOf() * dag.recordedAreaDecimal).toFixed(2));
    rows.push({
      personId: estate.deceasedId,
      nameBn: person?.nameBn ?? estate.deceasedId,
      nameEn: person?.nameEn ?? estate.deceasedId,
      share: estate.share.toFraction(),
      areaDecimal,
      acquiredBy: 'inheritance',
      isClaim: false,
      isEstate: true,
      estateReason: estate.reason,
    });
  }

  // Sort: valid holders first (by share descending), then claims, then estates
  rows.sort((a, b) => {
    if (a.isClaim !== b.isClaim) return a.isClaim ? 1 : -1;
    if (a.isEstate !== b.isEstate) return a.isEstate ? 1 : -1;
    return b.areaDecimal - a.areaDecimal;
  });

  return rows;
}
