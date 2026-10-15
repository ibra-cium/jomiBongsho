/**
 * index.ts — Public engine entry point
 * Pure TypeScript, no React/DOM/fetch — AGENTS.md rule 4
 *
 * The UI calls only `analyseDag` (and later calculateCost, findDagAtPoint).
 * DOMAIN_RULES.md §10
 *
 * analyseDag is memoized by dagId to stay under 20 ms per call after the first.
 */

import { replayLedger } from './ledger';
import { runChecks } from './checks';
import { computeVerdict, sortIssues, buildOwnerRows } from './verdict';
import { estimatePrice } from './price';
import type { OwnerRow } from './verdict';
import type { TimelineEntry } from './ledger';
import type { DagProps, DemoData, Issue, PriceEstimate, Verdict } from './types';

// ---------------------------------------------------------------------------
// DagAnalysis — what the UI receives
// ---------------------------------------------------------------------------

export interface DagAnalysis {
  /** The dag's GeoJSON properties */
  dag: DagProps;
  /** Merged and sorted issues (ledger + checks) */
  issues: Issue[];
  /** Green / yellow / red verdict */
  verdict: Verdict;
  /** Owner rows for UI display (valid holders, claims, estates) */
  owners: OwnerRow[];
  /** Full timeline from the ledger */
  timeline: TimelineEntry[];
  /** Comparable-sales price estimate */
  priceEstimate: PriceEstimate;
}

// ---------------------------------------------------------------------------
// Memoization cache
// ---------------------------------------------------------------------------

// Key: dagId. We keep a reference to the data object to detect if data changed.
// For this prototype data is loaded once; cache is keyed by dagId.
let _cachedDataRef: WeakRef<DemoData> | null = null;
const _memo = new Map<string, DagAnalysis>();

function isCacheValid(data: DemoData): boolean {
  return _cachedDataRef !== null && _cachedDataRef.deref() === data;
}

function clearCacheIfNeeded(data: DemoData): void {
  if (!isCacheValid(data)) {
    _memo.clear();
    _cachedDataRef = new WeakRef(data);
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Analyses a single dag and returns the full analysis object.
 *
 * @param dagId   - the dag to analyse (BS dag number as string, e.g. "103")
 * @param data    - the full demo data object (loaded once by the app)
 * @param opts    - optional overrides; today defaults to DEMO_TODAY='2026-10-01'
 */
export function analyseDag(dagId: string, data: DemoData, opts?: { today?: string }): DagAnalysis {
  const today = opts?.today ?? '2026-10-01';

  // Check memo (keyed by dagId; assumes data reference is stable within a session)
  clearCacheIfNeeded(data);
  const cacheKey = `${dagId}|${today}`;
  const cached = _memo.get(cacheKey);
  if (cached) return cached;

  // ── 1. Find the dag ──────────────────────────────────────────────────────
  const feature = data.dags.features.find((f) => f.properties.id === dagId);
  if (!feature) {
    throw new Error(`analyseDag: dag "${dagId}" not found in data.dags`);
  }
  const dag = feature.properties;

  // ── 2. Filter events for this dag ────────────────────────────────────────
  const dagEvents = data.events.filter((e) => e.dagId === dagId);

  // ── 3. Replay the ledger ─────────────────────────────────────────────────
  const ledger = replayLedger(dagId, dagEvents, today);

  // ── 4. Run non-ledger checks ─────────────────────────────────────────────
  const checkIssues = runChecks(dag, dagEvents, ledger, today, {
    allDags: data.dags,
    allEvents: data.events,
  });

  // ── 5. Merge and sort issues ─────────────────────────────────────────────
  const allIssues = sortIssues([...ledger.issues, ...checkIssues], dagEvents);

  // ── 6. Compute verdict ───────────────────────────────────────────────────
  const verdict = computeVerdict(allIssues);

  // ── 7. Build owner rows ──────────────────────────────────────────────────
  const owners = buildOwnerRows(dag, ledger, data.people, dagEvents);

  // ── 8. Calculate price estimate ──────────────────────────────────────────
  const priceEstimate = estimatePrice(dag, data.dags, data.events, { today });

  // ── 9. Assemble result ───────────────────────────────────────────────────
  const result: DagAnalysis = {
    dag,
    issues: allIssues,
    verdict,
    owners,
    timeline: ledger.timeline,
    priceEstimate,
  };

  _memo.set(cacheKey, result);
  return result;
}

// Re-export types and functions from engine
export { estimatePrice, percentileInc } from './price';
export type { OwnerRow } from './verdict';
export type { TimelineEntry } from './ledger';
export type { Comp, PriceEstimate, CompExcludeReason } from './types';
