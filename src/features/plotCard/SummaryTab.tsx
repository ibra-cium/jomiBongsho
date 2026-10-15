import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Stamp, VerdictType } from '@/ui/Stamp';
import { IssueRow } from './IssueRow';
import { OwnersList } from './OwnerRow';
import type { DagAnalysis } from '@/engine';
import type { LandEvent, Person } from '@/engine/types';

export interface SummaryTabProps {
  analysis: DagAnalysis;
  events: LandEvent[];
  people: Person[];
  onNavigateToTimeline?: (eventId?: string) => void;
  className?: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  analysis,
  events,
  people,
  onNavigateToTimeline,
  className = '',
}) => {
  const { t } = useT();

  const { verdict, issues, owners, dag } = analysis;

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
