/**
 * ledger.ts — Share ledger replay engine
 * Pure TypeScript, no React/DOM/fetch — AGENTS.md rule 4
 *
 * Implements DOMAIN_RULES.md §2 exactly:
 *   record → deed → mutation → inheritance → case/landTax
 *
 * Think of a dag like a bank account where shares must always total 100%.
 * Every event either transfers shares between people (deed, inheritance)
 * or resets the record (survey). Invalid deeds don't move shares — instead
 * the would-be buyer becomes a "disputed claim". The invariant:
 *   sum(balances) + sum(estates) === 1 after every event.
 */

import Fraction from 'fraction.js';
import { faraiz } from './faraiz';
import type {
  DeedEvent,
  FaraizRow,
  InheritanceEvent,
  Issue,
  IssueCode,
  LandEvent,
  MutationEvent,
} from './types';

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface TimelineEntry {
  event: LandEvent;
  valid: boolean;
  /** Short key describing what this event did (for UI) */
  effectKey: string;
  /** Named params for display text templates */
  params: Record<string, string | number>;
  /** Issue codes raised by this specific event */
  issueCodes: IssueCode[];
}

export interface LedgerResult {
  /** personId → current valid share (only people with a positive balance) */
  balances: Map<string, Fraction>;
  /** Deceased estates waiting for legal review */
  estates: { deceasedId: string; share: Fraction; reason: string }[];
  /** Buyers of invalid deeds — disputed claims */
  claims: { personId: string; share: Fraction; deedId: string }[];
  /** Every event + what it did + valid/invalid */
  timeline: TimelineEntry[];
  /** All issues raised across the replay */
  issues: Issue[];
  /** Anyone who ever validly held a share */
  everOwned: Set<string>;
  /** heirId → deceasedId — tracks inheritance origin */
  inheritedFrom: Map<string, string>;
  /** deedNo → eventId for valid deeds (used by mutation checks) */
  validDeedNos: Map<string, string>;
  /** deedNos that have been mutated */
  mutatedDeedNos: Set<string>;
  /** Date of the last inheritance event (for mutation null-refDeedNo rule) */
  lastInheritanceDate: string | null;
}

// ---------------------------------------------------------------------------
// Helper — days between two ISO date strings
// ---------------------------------------------------------------------------

function daysBetween(a: string, b: string): number {
  return Math.abs((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Helper — sum all balances + estates for invariant check
// ---------------------------------------------------------------------------

function sumLedger(balances: Map<string, Fraction>, estates: LedgerResult['estates']): Fraction {
  let total = new Fraction(0);
  for (const bal of balances.values()) total = total.add(bal);
  for (const est of estates) total = total.add(est.share);
  return total;
}

// ---------------------------------------------------------------------------
// Main replay function
// ---------------------------------------------------------------------------

/**
 * Replays all events for a single dag in chronological order (date, then id)
 * and returns the full ledger state.
 *
 * @param dagId  - the dag being analysed (for filtering and context)
 * @param events - all events for this dag (unsorted OK; we sort internally)
 * @param today  - ISO date string for the reference date (default DEMO_TODAY)
 */
export function replayLedger(
  dagId: string,
  events: LandEvent[],
  today = '2026-10-01',
): LedgerResult {
  // Only replay events up to and including today (DOMAIN_RULES: "today" is always the argument)
  // Sort: by date ascending, then by id as tiebreaker (stable sort)
  const sorted = [...events]
    .filter((e) => e.date <= today)
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.id.localeCompare(b.id);
    });

  // Initialise mutable state
  const balances = new Map<string, Fraction>();
  const estates: LedgerResult['estates'] = [];
  const claims: LedgerResult['claims'] = [];
  const timeline: TimelineEntry[] = [];
  const issues: Issue[] = [];
  const everOwned = new Set<string>();
  const inheritedFrom = new Map<string, string>();
  const validDeedNos = new Map<string, string>(); // deedNo → eventId
  const mutatedDeedNos = new Set<string>();
  // sellers who have appeared in a valid deed (for DOUBLE_SALE detection)
  const priorValidSellers = new Set<string>();
  const priorValidDeedMap = new Map<string, string>();
  let lastInheritanceDate: string | null = null;

  // Helper to raise an issue (deduplication not required; caller decides)
  function addIssue(
    code: IssueCode,
    severity: Issue['severity'],
    eventIds: string[],
    params: Record<string, string | number> = {},
    faraizTable?: FaraizRow[],
  ): void {
    const issue: Issue = { code, severity, eventIds, params };
    if (faraizTable !== undefined) issue.faraizTable = faraizTable;
    issues.push(issue);
  }

  // ---------------------------------------------------------------------------
  // Process each event
  // ---------------------------------------------------------------------------

  for (const event of sorted) {
    const entry: TimelineEntry = {
      event,
      valid: true,
      effectKey: event.type,
      params: {},
      issueCodes: [],
    };

    switch (event.type) {
      // -----------------------------------------------------------------------
      // 1. record — replaces all balances with khatian holdings
      // -----------------------------------------------------------------------
      case 'record': {
        balances.clear();
        estates.length = 0; // record clears estates too (new survey supersedes)

        let sum = new Fraction(0);
        for (const h of event.holdings) {
          const f = new Fraction(h.share);
          balances.set(h.personId, f);
          everOwned.add(h.personId);
          sum = sum.add(f);
        }

        if (!sum.equals(new Fraction(1))) {
          addIssue('RECORD_SUM_ERROR', 'critical', [event.id], {
            sum: sum.toFraction(),
            survey: event.survey,
            dagId,
          });
          entry.issueCodes.push('RECORD_SUM_ERROR');
          entry.valid = false;
        }

        entry.effectKey = 'record_set';
        entry.params = { survey: event.survey, khatianNo: event.khatianNo };
        break;
      }

      // -----------------------------------------------------------------------
      // 2. deed — transfers shares from sellers to buyers
      // -----------------------------------------------------------------------
      case 'deed': {
        const deedEv = event as DeedEvent;
        let deedValid = true;
        const deedIssues: IssueCode[] = [];

        // Check each seller line according to the decision order in DOMAIN_RULES §2
        for (const seller of deedEv.sellers) {
          const sellShare = new Fraction(seller.share);
          const available = balances.get(seller.personId) ?? new Fraction(0);

          if (!everOwned.has(seller.personId)) {
            // Seller was never an owner → CHAIN_BREAK
            addIssue('CHAIN_BREAK', 'critical', [event.id], {
              seller: seller.personId,
              share: seller.share,
            });
            deedIssues.push('CHAIN_BREAK');
            deedValid = false;
          } else if (available.compare(sellShare) < 0) {
            // Seller doesn't have enough. Determine which kind of over-sale.
            if (priorValidSellers.has(seller.personId)) {
              // Seller already appeared in a previous valid deed → DOUBLE_SALE
              const priorDeedId = priorValidDeedMap.get(seller.personId);
              const priorDeed = priorDeedId
                ? (sorted.find((e) => e.id === priorDeedId) as DeedEvent | undefined)
                : undefined;
              const firstDate = priorDeed?.date ?? '';
              const firstBuyer = priorDeed?.buyers[0]?.personId ?? '';
              const secondDate = event.date;
              const secondBuyer = deedEv.buyers[0]?.personId ?? '';

              const evIds = priorDeedId ? [priorDeedId, event.id] : [event.id];
              addIssue('DOUBLE_SALE', 'critical', evIds, {
                seller: seller.personId,
                share: seller.share,
                available: available.toFraction(),
                firstDate,
                firstBuyer,
                secondDate,
                secondBuyer,
              });
              deedIssues.push('DOUBLE_SALE');
            } else if (inheritedFrom.has(seller.personId)) {
              // Seller got share through inheritance → HEIR_OVER_SALE
              // Attach the faraiz table of the deceased's inheritance event
              const deceasedId = inheritedFrom.get(seller.personId)!;
              const inheritEv = sorted.find(
                (e) =>
                  e.type === 'inheritance' && (e as InheritanceEvent).deceasedId === deceasedId,
              ) as InheritanceEvent | undefined;

              let faraizTable: FaraizRow[] | undefined;
              if (inheritEv) {
                const result = faraiz({
                  deceasedSex: 'M', // we don't have sex in event; faraiz result may be supported
                  law: inheritEv.law,
                  heirs: inheritEv.heirs,
                });
                if (result.supported) faraizTable = result.shares;
              }

              addIssue(
                'HEIR_OVER_SALE',
                'critical',
                [event.id],
                {
                  seller: seller.personId,
                  owned: available.toFraction(),
                  selling: seller.share,
                  deceasedId,
                },
                faraizTable,
              );
              deedIssues.push('HEIR_OVER_SALE');
            } else {
              // Regular over-sale
              addIssue('OVER_SALE', 'critical', [event.id], {
                seller: seller.personId,
                owned: available.toFraction(),
                selling: seller.share,
              });
              deedIssues.push('OVER_SALE');
            }
            deedValid = false;
          }
        }

        if (deedValid) {
          // Apply the transfers
          for (const seller of deedEv.sellers) {
            const sellShare = new Fraction(seller.share);
            const cur = balances.get(seller.personId)!;
            const remaining = cur.sub(sellShare);
            if (remaining.equals(new Fraction(0))) {
              balances.delete(seller.personId);
            } else {
              balances.set(seller.personId, remaining);
            }
            priorValidSellers.add(seller.personId);
            priorValidDeedMap.set(seller.personId, event.id);
          }
          for (const buyer of deedEv.buyers) {
            const buyShare = new Fraction(buyer.share);
            const cur = balances.get(buyer.personId) ?? new Fraction(0);
            balances.set(buyer.personId, cur.add(buyShare));
            everOwned.add(buyer.personId);
          }
          validDeedNos.set(deedEv.deedNo, event.id);
          entry.effectKey = 'deed_valid';
          entry.params = {
            deedNo: deedEv.deedNo,
            price: deedEv.declaredPriceBdt,
          };
        } else {
          // Invalid deed: buyers become disputed claims
          for (const buyer of deedEv.buyers) {
            claims.push({
              personId: buyer.personId,
              share: new Fraction(buyer.share),
              deedId: event.id,
            });
          }
          entry.valid = false;
          entry.effectKey = 'deed_invalid';
          entry.params = { deedNo: deedEv.deedNo };
        }

        entry.issueCodes = deedIssues;
        break;
      }

      // -----------------------------------------------------------------------
      // 3. mutation — checks against ledger, does NOT change balances
      // -----------------------------------------------------------------------
      case 'mutation': {
        const mutEv = event as MutationEvent;

        if (mutEv.refDeedNo !== null) {
          // refDeedNo must exist in validDeedNos
          if (!validDeedNos.has(mutEv.refDeedNo)) {
            addIssue('MUTATION_WITHOUT_DEED', 'critical', [event.id], {
              refDeedNo: mutEv.refDeedNo,
              caseNo: mutEv.caseNo,
            });
            entry.issueCodes.push('MUTATION_WITHOUT_DEED');
            entry.valid = false;
          } else {
            // Mark the deed as mutated
            mutatedDeedNos.add(mutEv.refDeedNo);
            entry.effectKey = 'mutation_recorded';
            entry.params = { refDeedNo: mutEv.refDeedNo, caseNo: mutEv.caseNo };

            // Check for mismatch between holdingsAfter and current balances
            let mismatch = false;
            const afterSet = new Map<string, Fraction>();
            for (const h of mutEv.holdingsAfter) afterSet.set(h.personId, new Fraction(h.share));
            for (const [pid, bal] of balances) {
              const after = afterSet.get(pid);
              if (!after || !after.equals(bal)) {
                mismatch = true;
                break;
              }
            }
            if (!mismatch && afterSet.size !== balances.size) mismatch = true;

            if (mismatch) {
              addIssue('MUTATION_MISMATCH', 'warning', [event.id], {
                caseNo: mutEv.caseNo,
              });
              entry.issueCodes.push('MUTATION_MISMATCH');
            }
          }
        } else {
          // refDeedNo null: allowed only within 2 years of an inheritance event
          if (lastInheritanceDate !== null && daysBetween(lastInheritanceDate, event.date) <= 730) {
            // Allowed heir mutation
            mutatedDeedNos.add('__heir__' + event.id);
            entry.effectKey = 'mutation_heir';
            entry.params = { caseNo: mutEv.caseNo };

            // Check mismatch vs current balances
            let mismatch = false;
            const afterSet = new Map<string, Fraction>();
            for (const h of mutEv.holdingsAfter) afterSet.set(h.personId, new Fraction(h.share));
            for (const [pid, bal] of balances) {
              const after = afterSet.get(pid);
              if (!after || !after.equals(bal)) {
                mismatch = true;
                break;
              }
            }
            if (!mismatch && afterSet.size !== balances.size) mismatch = true;

            if (mismatch) {
              addIssue('MUTATION_MISMATCH', 'warning', [event.id], {
                caseNo: mutEv.caseNo,
              });
              entry.issueCodes.push('MUTATION_MISMATCH');
            }
          } else {
            addIssue('MUTATION_WITHOUT_DEED', 'critical', [event.id], {
              caseNo: mutEv.caseNo,
              reason: 'null_ref_too_late',
            });
            entry.issueCodes.push('MUTATION_WITHOUT_DEED');
            entry.valid = false;
          }
        }

        break;
      }

      // -----------------------------------------------------------------------
      // 4. inheritance — distribute deceased's balance using faraiz (or estate)
      // -----------------------------------------------------------------------
      case 'inheritance': {
        const inhEv = event as InheritanceEvent;
        const deceasedBal = balances.get(inhEv.deceasedId) ?? new Fraction(0);

        if (deceasedBal.equals(new Fraction(0))) {
          // Zero-balance inheritance: note only, no share movement
          entry.effectKey = 'inheritance_zero';
          entry.params = { deceasedId: inhEv.deceasedId };
          break;
        }

        // Remove the deceased
        balances.delete(inhEv.deceasedId);

        // Determine deceased sex from heirs (male if wives, female if husband)
        // We infer from the event's heirs — wives → deceased was male; husband → female
        // Default to 'M' if neither (will likely hit INVALID_SPOUSE or handled by law check)
        const hasWife = inhEv.heirs.some((h) => h.relation === 'wife');
        const hasHusband = inhEv.heirs.some((h) => h.relation === 'husband');
        const deceasedSex: 'M' | 'F' = hasHusband ? 'F' : hasWife ? 'M' : 'M';

        const faraizResult = faraiz({
          deceasedSex,
          law: inhEv.law,
          heirs: inhEv.heirs,
        });

        if (faraizResult.supported) {
          // Distribute shares proportionally to the deceased's balance
          for (const row of faraizResult.shares) {
            const heirFraction = new Fraction(row.share);
            const heirAmount = deceasedBal.mul(heirFraction);
            const cur = balances.get(row.personId) ?? new Fraction(0);
            balances.set(row.personId, cur.add(heirAmount));
            everOwned.add(row.personId);
            inheritedFrom.set(row.personId, inhEv.deceasedId);
          }
          entry.effectKey = 'inheritance_distributed';
          entry.params = { deceasedId: inhEv.deceasedId };
          lastInheritanceDate = event.date;
        } else {
          // Unsupported case → estate
          estates.push({
            deceasedId: inhEv.deceasedId,
            share: deceasedBal,
            reason: faraizResult.reason,
          });
          addIssue('ESTATE_LEGAL_REVIEW', 'warning', [event.id], {
            deceasedId: inhEv.deceasedId,
            reason: faraizResult.reason,
          });
          entry.issueCodes.push('ESTATE_LEGAL_REVIEW');
          entry.effectKey = 'inheritance_estate';
          entry.params = { deceasedId: inhEv.deceasedId, reason: faraizResult.reason };
          lastInheritanceDate = event.date; // still record date for mutation window
        }

        break;
      }

      // -----------------------------------------------------------------------
      // 5. case, landTax — no ledger change
      // -----------------------------------------------------------------------
      case 'case': {
        entry.effectKey = 'case_recorded';
        entry.params = { caseNo: event.caseNo, status: event.status };
        break;
      }

      case 'landTax': {
        entry.effectKey = 'land_tax_recorded';
        entry.params = { paidUpToYear: event.paidUpToYear, arrearsBdt: event.arrearsBdt };
        break;
      }
    }

    timeline.push(entry);
  }

  return {
    balances,
    estates,
    claims,
    timeline,
    issues,
    everOwned,
    inheritedFrom,
    validDeedNos,
    mutatedDeedNos,
    lastInheritanceDate,
  };
}

/**
 * Asserts the ledger invariant: sum(balances) + sum(estates) === 1.
 * Throws if violated. Used in tests.
 */
export function assertLedgerInvariant(result: LedgerResult, dagId: string): void {
  const total = sumLedger(result.balances, result.estates);
  if (!total.equals(new Fraction(1))) {
    throw new Error(
      `Ledger invariant violated for dag ${dagId}: sum = ${total.toFraction()}, expected 1`,
    );
  }
}
