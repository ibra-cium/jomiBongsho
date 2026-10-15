/**
 * checks.ts — Non-ledger checks for a single dag
 * Pure TypeScript, no React/DOM/fetch — AGENTS.md rule 4
 *
 * Implements the post-ledger checks from DOMAIN_RULES.md §4:
 *   KHAS_LAND, PENDING_CASE, REG_WITHOUT_MUTATION,
 *   RAPID_RESALE, TAX_ARREARS
 *
 * Skipped until later tickets:
 *   UNDER_DECLARED (P1-T09), AREA_MISMATCH (P5-T03), ACQUISITION (P5-T02)
 */

import type {
  CaseEvent,
  DagProps,
  DeedEvent,
  FeatureCollection,
  GeoPolygon,
  Issue,
  LandEvent,
  LandTaxEvent,
} from './types';
import type { LedgerResult } from './ledger';
import { sumShares } from './fraction';
import { estimatePrice } from './price';

// ---------------------------------------------------------------------------
// Helper — days between two ISO date strings
// ---------------------------------------------------------------------------

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

function getMonthsCutoffDate(todayStr: string, months: number): string {
  const parts = todayStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return '1900-01-01';

  const date = new Date(Date.UTC(y, m - 1 - months, d));
  return date.toISOString().slice(0, 10);
}

export interface RunChecksContext {
  allDags?: FeatureCollection<GeoPolygon, DagProps>;
  allEvents?: LandEvent[];
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Runs all non-ledger checks against a dag and returns any new Issues found.
 * The ledger issues are already embedded in `ledger.issues`; this function
 * adds the checks that require looking at dag flags and the event stream
 * directly (after the ledger has been replayed).
 */
export function runChecks(
  dag: DagProps,
  events: LandEvent[],
  ledger: LedgerResult,
  today: string,
  context?: RunChecksContext,
): Issue[] {
  const issues: Issue[] = [];

  // ── 1. KHAS_LAND ──────────────────────────────────────────────────────────
  // Raised when flags.khas is true — DOMAIN_RULES §4
  if (dag.flags.khas) {
    issues.push({
      code: 'KHAS_LAND',
      severity: 'critical',
      eventIds: [],
      params: {},
    });
  }

  // ── 2. ACQUISITION (placeholder — P5-T02 adds the flag and data) ──────────
  // Code is in IssueCode union; text is in i18n; check will be activated in P5-T02
  // if (dag.flags.acquisition) { ... }

  // ── 3. PENDING_CASE ───────────────────────────────────────────────────────
  // Find all case events, group by caseNo, determine if the latest event
  // for each unique case number has status 'pending'.
  const caseEvents = events.filter((e): e is CaseEvent => e.type === 'case');
  // Group by caseNo — keep the latest (by date, then id) for each case
  const latestByCaseNo = new Map<string, CaseEvent>();
  for (const ce of caseEvents) {
    const existing = latestByCaseNo.get(ce.caseNo);
    if (
      !existing ||
      ce.date > existing.date ||
      (ce.date === existing.date && ce.id > existing.id)
    ) {
      latestByCaseNo.set(ce.caseNo, ce);
    }
  }
  for (const ce of latestByCaseNo.values()) {
    if (ce.status === 'pending') {
      issues.push({
        code: 'PENDING_CASE',
        severity: 'critical',
        eventIds: [ce.id],
        params: { caseNo: ce.caseNo, courtBn: ce.courtBn },
      });
    }
  }

  // ── 4. REG_WITHOUT_MUTATION ───────────────────────────────────────────────
  // A valid deed with no mutation referencing it, and more than 90 days old.
  // valid deeds: in ledger.validDeedNos (deedNo → eventId)
  // mutated deeds: in ledger.mutatedDeedNos (deedNo)
  const deedEvents = new Map<string, DeedEvent>();
  for (const e of events) {
    if (e.type === 'deed') deedEvents.set(e.id, e as DeedEvent);
  }

  for (const [deedNo, eventId] of ledger.validDeedNos.entries()) {
    // Skip deeds that have been mutated
    if (ledger.mutatedDeedNos.has(deedNo)) continue;
    // Look up the deed event to get its date
    const deedEvent = deedEvents.get(eventId);
    if (!deedEvent) continue;
    // Check if more than 90 days before today
    const days = daysBetween(deedEvent.date, today);
    if (days > 90) {
      issues.push({
        code: 'REG_WITHOUT_MUTATION',
        severity: 'warning',
        eventIds: [eventId],
        params: {
          date: deedEvent.date,
          days: Math.floor(days),
          deedNo,
        },
      });
    }
  }

  // ── 5. RAPID_RESALE ────────────────────────────────────────────────────────
  // 3 or more valid deeds inside any 180-day window — DOMAIN_RULES §4
  // Collect dates of all valid deeds, sorted ascending
  const validDeedDates: { date: string; eventId: string }[] = [];
  for (const [deedNo, eventId] of ledger.validDeedNos.entries()) {
    // Only sale deeds (not gifts) contribute to rapid resale suspicion
    const deedEvent = deedEvents.get(eventId);
    if (!deedEvent) continue;
    // Include all valid deed kinds per the rule (no kind restriction in spec)
    validDeedDates.push({ date: deedEvent.date, eventId });
    void deedNo; // suppress unused warning
  }
  validDeedDates.sort((a, b) => a.date.localeCompare(b.date));

  // Sliding window: for each deed i, find how many other deeds are within 180 days
  let rapidResaleFound = false;
  for (let i = 0; i < validDeedDates.length && !rapidResaleFound; i++) {
    const anchor = validDeedDates[i];
    if (!anchor) continue;
    const window: string[] = [anchor.eventId];
    for (let j = i + 1; j < validDeedDates.length; j++) {
      const curr = validDeedDates[j];
      if (!curr) break;
      const span = daysBetween(anchor.date, curr.date);
      if (span <= 180) {
        window.push(curr.eventId);
      } else {
        break; // sorted, no need to continue
      }
    }
    if (window.length >= 3) {
      rapidResaleFound = true;
      issues.push({
        code: 'RAPID_RESALE',
        severity: 'warning',
        eventIds: window,
        params: {
          count: window.length,
        },
      });
    }
  }

  // ── 6. TAX_ARREARS ────────────────────────────────────────────────────────
  // Latest landTax event (by date, then id) with arrearsBdt > 0 — DOMAIN_RULES §4
  const taxEvents = events.filter((e): e is LandTaxEvent => e.type === 'landTax');
  if (taxEvents.length > 0) {
    // Pick the latest by date, then id as tiebreaker
    const latest = taxEvents.reduce((best, curr) => {
      if (curr.date > best.date || (curr.date === best.date && curr.id > best.id)) return curr;
      return best;
    });
    if (latest.arrearsBdt > 0) {
      issues.push({
        code: 'TAX_ARREARS',
        severity: 'info',
        eventIds: [latest.id],
        params: {
          arrearsBdt: latest.arrearsBdt,
          paidUpToYear: latest.paidUpToYear,
        },
      });
    }
  }

  // ── 7. UNDER_DECLARED ─────────────────────────────────────────────────────
  // Valid sale deed in the last 36 months with price per decimal < 50% of the
  // area estimate (mid) for this dag, computed without that deed — DOMAIN_RULES §4
  if (context?.allDags && context?.allEvents) {
    const cutoff36m = getMonthsCutoffDate(today, 36);

    for (const [deedNo, eventId] of ledger.validDeedNos.entries()) {
      const deedEvent = deedEvents.get(eventId);
      if (!deedEvent || deedEvent.kind !== 'sale' || deedEvent.declaredPriceBdt <= 0) continue;
      if (deedEvent.date > today || deedEvent.date < cutoff36m) continue;

      const holdings = deedEvent.sellers.length > 0 ? deedEvent.sellers : deedEvent.buyers;
      const soldFrac = sumShares(holdings.map((s) => s.share)).valueOf();
      const soldArea = soldFrac * dag.recordedAreaDecimal;
      if (soldArea <= 0) continue;

      const pricePerDecimal = deedEvent.declaredPriceBdt / soldArea;

      // Compute estimate for this dag without this deed
      const estimate = estimatePrice(dag, context.allDags, context.allEvents, {
        today,
        excludeEventId: deedEvent.id,
      });

      if (estimate.status === 'ok' && estimate.perDecimal) {
        const mid = estimate.perDecimal.mid;
        if (pricePerDecimal < 0.5 * mid) {
          const pct = Math.round((pricePerDecimal / mid) * 100);
          issues.push({
            code: 'UNDER_DECLARED',
            severity: 'warning',
            eventIds: [deedEvent.id],
            params: {
              marketPrice: mid,
              declaredPrice: Math.round(pricePerDecimal),
              pct,
            },
          });
        }
      }
      void deedNo;
    }
  }

  // ── Skipped (later tickets): AREA_MISMATCH (P5-T03), ACQUISITION (P5-T02) ──

  return issues;
}
