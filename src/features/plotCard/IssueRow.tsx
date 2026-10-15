import React, { useState } from 'react';
import {
  AlertTriangle,
  OctagonAlert,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import Fraction from 'fraction.js';
import { useT } from '@/i18n/useT';
import type { TranslationKey } from '@/i18n/bn';
import { formatDate, toBanglaDigits, formatTaka, formatNumber } from '@/lib/format';
import { FamilyTree } from './FamilyTree';
import type {
  Issue,
  LandEvent,
  Person,
  DeedEvent,
  MutationEvent,
  CaseEvent,
  RecordEvent,
} from '@/engine/types';

export interface IssueRowProps {
  issue: Issue;
  events: LandEvent[];
  people: Person[];
  recordedAreaDecimal: number;
  onNavigateToTimeline?: (eventId?: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const IssueRow: React.FC<IssueRowProps> = ({
  issue,
  events,
  people,
  recordedAreaDecimal,
  onNavigateToTimeline,
  className = '',
  defaultExpanded = false,
}) => {
  const { t, lang } = useT();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const peopleMap = new Map(people.map((p) => [p.id, p]));

  // Severity configurations
  const config = {
    critical: {
      badgeClass: 'bg-bad-wash text-bad border-bad/30',
      icon: <OctagonAlert className="w-5 h-5 text-bad shrink-0" aria-hidden="true" />,
      label: t('verdictBad'),
      cardBorder: 'border-bad/20 hover:border-bad/40',
      actionBg: 'bg-bad/5 border-bad/20 text-bad',
    },
    warning: {
      badgeClass: 'bg-warn-wash text-warn border-warn/30',
      icon: <AlertTriangle className="w-5 h-5 text-warn shrink-0" aria-hidden="true" />,
      label: t('verdictWarn'),
      cardBorder: 'border-warn/20 hover:border-warn/40',
      actionBg: 'bg-warn/5 border-warn/20 text-warn',
    },
    info: {
      badgeClass: 'bg-accent/10 text-accent border-accent/20',
      icon: <Info className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />,
      label: t('details'),
      cardBorder: 'border-line hover:border-accent/40',
      actionBg: 'bg-paper-2 border-line text-ink',
    },
  }[issue.severity];

  // Resolve translated title, body, and next action
  const titleKey = `issue_${issue.code}_title` as TranslationKey;
  const bodyKey = `issue_${issue.code}_body` as TranslationKey;
  const nextKey = `issue_${issue.code}_next` as TranslationKey;

  // Format parameters for localized interpolation
  const formattedParams: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(issue.params)) {
    if (k.toLowerCase().includes('date') && typeof v === 'string') {
      formattedParams[k] = formatDate(v, lang);
    } else if (k === 'seller' || k === 'firstBuyer' || k === 'secondBuyer' || k === 'deceasedId') {
      const p = peopleMap.get(String(v));
      formattedParams[k] = p ? (lang === 'bn' ? p.nameBn : p.nameEn) : String(v);
    } else if (k === 'days' || k === 'count' || k === 'pct') {
      formattedParams[k] = lang === 'bn' ? toBanglaDigits(v) : v;
    } else if (k === 'share' || k === 'owned' || k === 'selling') {
      formattedParams[k] = lang === 'bn' ? toBanglaDigits(String(v)) : String(v);
    } else if (k === 'marketPrice' || k === 'declaredPrice' || k === 'arrearsBdt') {
      formattedParams[k] = typeof v === 'number' ? formatNumber(v, lang) : String(v);
    } else {
      formattedParams[k] = v;
    }
  }

  const title = t(titleKey);
  const body = t(bodyKey, formattedParams);
  const nextStep = t(nextKey);

  // Evidence events
  const relatedEvents = issue.eventIds
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is LandEvent => Boolean(e));

  // Build family tree heirs if faraizTable is present (e.g. HEIR_OVER_SALE)
  const familyTreeHeirs = issue.faraizTable?.map((row) => {
    const p = peopleMap.get(row.personId);
    const fractionVal = new Fraction(row.share).valueOf();
    const area = parseFloat((fractionVal * recordedAreaDecimal).toFixed(2));
    const isOverSelling =
      issue.params.seller === row.personId ||
      issue.params.seller === p?.nameBn ||
      issue.params.seller === p?.nameEn;

    return {
      personId: row.personId,
      name: p ? (lang === 'bn' ? p.nameBn : p.nameEn) : row.personId,
      relation: row.relation,
      share: row.share,
      areaDecimal: area,
      isOverSelling,
    };
  });

  const deceasedPerson = issue.params.deceasedId
    ? peopleMap.get(String(issue.params.deceasedId))
    : undefined;
  const deceasedName = deceasedPerson
    ? lang === 'bn'
      ? deceasedPerson.nameBn
      : deceasedPerson.nameEn
    : String(issue.params.deceasedId || t('deceased'));

  return (
    <div
      className={`bg-paper border rounded-2xl shadow-paper transition-all overflow-hidden ${config.cardBorder} ${className}`}
    >
      {/* Header Row — Clickable to Toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3.5 sm:p-4 text-left flex items-start gap-3 select-none hover:bg-paper-2/40 transition-colors cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="pt-0.5">{config.icon}</div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-bold text-sm sm:text-base text-ink">{title}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
            >
              {config.label}
            </span>
          </div>

          <p className="text-xs text-ink-2 leading-relaxed">{body}</p>
        </div>

        <div className="text-ink-3 p-1 shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Action Line: "কী করবেন" (What to do next) */}
      <div className="px-3.5 sm:px-4 pb-3">
        <div
          className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${config.actionBg}`}
        >
          <span className="font-bold shrink-0">{t('whatToDo')}:</span>
          <span className="leading-snug">{nextStep}</span>
        </div>
      </div>

      {/* Expanded Evidence & Records Drawer */}
      {expanded && (
        <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-4 border-t border-line/60 bg-paper-2/30">
          {/* Family Tree visualization if available (HEIR_OVER_SALE) */}
          {familyTreeHeirs && familyTreeHeirs.length > 0 && (
            <div className="pt-2">
              <FamilyTree
                deceasedName={deceasedName}
                heirs={familyTreeHeirs}
                highlightPersonId={String(issue.params.seller || '')}
                totalAreaDecimal={recordedAreaDecimal}
              />
            </div>
          )}

          {/* Evidence Event Cards */}
          {relatedEvents.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span>
                    {t('evidence')} (
                    {lang === 'bn' ? toBanglaDigits(relatedEvents.length) : relatedEvents.length})
                  </span>
                </div>
                {onNavigateToTimeline && (
                  <button
                    type="button"
                    onClick={() => onNavigateToTimeline(relatedEvents[0]?.id)}
                    className="text-accent hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <span>{t('viewInTimeline')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid gap-2">
                {relatedEvents.map((ev) => {
                  let eventLabel: string = ev.type;
                  let eventDetail = '';

                  if (ev.type === 'deed') {
                    const d = ev as DeedEvent;
                    const sellerNames = d.sellers
                      .map((s) => {
                        const p = peopleMap.get(s.personId);
                        return p ? (lang === 'bn' ? p.nameBn : p.nameEn) : s.personId;
                      })
                      .join(', ');
                    const buyerNames = d.buyers
                      .map((b) => {
                        const p = peopleMap.get(b.personId);
                        return p ? (lang === 'bn' ? p.nameBn : p.nameEn) : b.personId;
                      })
                      .join(', ');
                    eventLabel = `${t('filterDeed')} নং ${lang === 'bn' ? toBanglaDigits(d.deedNo) : d.deedNo}`;
                    eventDetail = `${sellerNames} → ${buyerNames} (${formatTaka(d.declaredPriceBdt, lang, { short: true })})`;
                  } else if (ev.type === 'mutation') {
                    const m = ev as MutationEvent;
                    eventLabel = `${t('filterMutation')} কেস নং ${lang === 'bn' ? toBanglaDigits(m.caseNo) : m.caseNo}`;
                    if (m.refDeedNo) {
                      eventDetail = `${t('claimDeedRef')}: ${lang === 'bn' ? toBanglaDigits(m.refDeedNo) : m.refDeedNo}`;
                    }
                  } else if (ev.type === 'case') {
                    const c = ev as CaseEvent;
                    eventLabel = `${t('filterCase')} নং ${lang === 'bn' ? toBanglaDigits(c.caseNo) : c.caseNo}`;
                    eventDetail = `${c.courtBn} (${c.status})`;
                  } else if (ev.type === 'record') {
                    const r = ev as RecordEvent;
                    eventLabel = `${r.survey.toUpperCase()} ${t('filterRecord')} (খতিয়ান ${lang === 'bn' ? toBanglaDigits(r.khatianNo) : r.khatianNo})`;
                  }

                  return (
                    <div
                      key={ev.id}
                      className="p-2.5 bg-paper rounded-xl border border-line flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-ink flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>{eventLabel}</span>
                        </div>
                        {eventDetail && (
                          <div className="text-[11px] text-ink-2 pl-3.5">{eventDetail}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-ink-3 shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(ev.date, lang)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
