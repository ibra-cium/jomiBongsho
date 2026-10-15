import React, { useMemo } from 'react';
import { CheckCircle2, ShieldAlert, Calculator, MapPin } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import { formatTaka, toBanglaDigits } from '@/lib/format';
import { Stamp, VerdictType } from '@/ui/Stamp';
import { calculateCost } from '@/engine';
import { IssueRow } from './IssueRow';
import { OwnersList } from './OwnerRow';
import type { DagAnalysis } from '@/engine';
import type { LandEvent, Person, FeeRules, Mouza, LandTaxEvent } from '@/engine/types';

export interface SummaryTabProps {
  analysis: DagAnalysis;
  events: LandEvent[];
  people: Person[];
  feeRules?: FeeRules;
  mouza?: Mouza;
  onNavigateToTimeline?: (eventId?: string) => void;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  analysis,
  events,
  people,
  feeRules,
  mouza,
  onNavigateToTimeline,
  onNavigateToTab,
  className = '',
}) => {
  const { t, lang } = useT();
  const gpsDagId = useAppStore((state) => state.gpsLocation.dagId);

  const { verdict, issues, owners, dag, priceEstimate } = analysis;

  // Short cost calculation for Summary tab
  const costSummary = useMemo(() => {
    if (!feeRules || !mouza) return null;

    const defaultPriceBdt =
      priceEstimate.total?.mid && priceEstimate.total.mid > 0
        ? priceEstimate.total.mid
        : priceEstimate.perDecimal?.mid && priceEstimate.perDecimal.mid > 0
          ? Math.round(priceEstimate.perDecimal.mid * dag.recordedAreaDecimal)
          : 0;

    if (defaultPriceBdt <= 0) return null;

    const taxEvents = events.filter((e): e is LandTaxEvent => e.type === 'landTax');
    const arrearsBdt =
      taxEvents.length > 0
        ? (taxEvents.reduce((best, curr) => (curr.date > best.date ? curr : best)).arrearsBdt ?? 0)
        : 0;

    return calculateCost({
      declaredPriceBdt: defaultPriceBdt,
      recordedAreaDecimal: dag.recordedAreaDecimal,
      areaClass: mouza.areaClass,
      sourceTaxClass: mouza.sourceTaxClass,
      feeRules,
      arrearsBdt,
      buyerPaysSourceTax: true,
      estimateMidPerDecimalBdt: priceEstimate.perDecimal?.mid,
    });
  }, [feeRules, mouza, priceEstimate, dag.recordedAreaDecimal, events]);

  const verdictVariant: VerdictType =
    verdict === 'red' ? 'bad' : verdict === 'yellow' ? 'warn' : 'ok';

  const closingAdvice =
    verdict === 'red'
      ? t('summaryClosingCritical')
      : verdict === 'yellow'
        ? t('summaryClosingWarning')
        : t('summaryClosingClean');

  const closingBorder =
    verdict === 'red'
      ? 'border-bad/30 bg-bad-wash/30 text-bad'
      : verdict === 'yellow'
        ? 'border-warn/30 bg-warn-wash/30 text-warn'
        : 'border-ok/30 bg-ok-wash/30 text-ok';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 0. GPS Plot Mismatch Warning (Seller Plot Fraud Check) */}
      {gpsDagId && gpsDagId !== dag.id && (
        <div className="p-3.5 bg-warn-wash/80 border-2 border-warn rounded-2xl flex items-start gap-3 shadow-xs">
          <MapPin className="w-5 h-5 text-warn shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-serif font-bold text-xs sm:text-sm text-warn">
              {t('plotMismatchWarning')}
            </div>
            <p className="text-xs font-semibold text-ink leading-relaxed">
              {t('plotMismatchBody', {
                gps: lang === 'bn' ? toBanglaDigits(gpsDagId) : gpsDagId,
                selected: lang === 'bn' ? toBanglaDigits(dag.id) : dag.id,
              })}
            </p>
            <p className="text-[11px] text-ink-2 leading-relaxed">{t('plotMismatchAdvice')}</p>
          </div>
        </div>
      )}

      {/* 1. Hero Element: VerdictStamp (Von Restorff effect) */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1 text-center space-y-2">
        <Stamp
          verdict={verdictVariant}
          issueCount={issues.length}
          size="lg"
          className="shadow-md"
        />

        {/* Disclaimer immediately under the stamp */}
        <p className="text-[11px] text-ink-3 italic font-medium pt-1 max-w-xs text-center">
          {t('verdictDisclaimer')}
        </p>
      </div>

      {/* 2. Issues Section (if any) */}
      {issues.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-ink">
            <ShieldAlert className="w-3.5 h-3.5 text-bad" />
            <span>{t('seeIssues', { n: issues.length })}</span>
          </div>

          <div className="space-y-3">
            {issues.map((issue, idx) => (
              <IssueRow
                key={`${issue.code}-${idx}`}
                issue={issue}
                events={events}
                people={people}
                recordedAreaDecimal={dag.recordedAreaDecimal}
                onNavigateToTimeline={onNavigateToTimeline}
                defaultExpanded={idx === 0} // Expand first issue by default for quick insight
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-ok-wash/40 border border-ok/30 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-serif font-bold text-xs sm:text-sm text-ok">{t('verdictOk')}</div>
            <p className="text-xs text-ink-2 leading-relaxed">{t('noIssuesFound')}</p>
          </div>
        </div>
      )}

      {/* 2.5. Total Cost Short Summary Line (P1-T10) */}
      {costSummary && (
        <div className="p-3.5 bg-paper-2 border border-line rounded-2xl flex items-center justify-between text-xs gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="font-medium text-ink leading-tight">
              {t('summaryCostLine', {
                total: formatTaka(costSummary.grandTotalBdt, lang, { short: true }),
                fees: formatTaka(costSummary.feesTotalBdt, lang, { short: true }),
              })}
            </span>
          </div>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('cost')}
              className="text-accent font-semibold hover:underline shrink-0 text-xs cursor-pointer ml-1 whitespace-nowrap"
            >
              {t('viewCostDetails')} →
            </button>
          )}
        </div>
      )}

      {/* 3. Owners List */}
      <div className="pt-1 border-t border-line/60">
        <OwnersList owners={owners} />
      </div>

      {/* 4. Serial Position Ending: "কী করবেন" Closing Advice Box */}
      <div className="pt-2">
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${closingBorder}`}
        >
          <div className="font-bold shrink-0 flex items-center gap-1">
            <span>{t('whatToDo')}:</span>
          </div>
          <p className="leading-relaxed text-ink font-medium">{closingAdvice}</p>
        </div>
      </div>
    </div>
  );
};
