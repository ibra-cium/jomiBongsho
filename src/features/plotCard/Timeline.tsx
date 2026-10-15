import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Scale,
  Users,
  Building,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import Fraction from 'fraction.js';
import { useT } from '@/i18n/useT';
import type { TranslationKey } from '@/i18n/bn';
import { formatDate, toBanglaDigits, formatTaka } from '@/lib/format';
import { FamilyTree } from './FamilyTree';
import { faraiz } from '@/engine/faraiz';
import type { TimelineEntry } from '@/engine';
import type {
  IssueCode,
  Person,
  DeedEvent,
  MutationEvent,
  InheritanceEvent,
  CaseEvent,
  RecordEvent,
  LandTaxEvent,
} from '@/engine/types';

export interface TimelineProps {
  timeline: TimelineEntry[];
  people: Person[];
  recordedAreaDecimal: number;
  highlightEventId?: string;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  timeline,
  people,
  recordedAreaDecimal,
  highlightEventId,
  className = '',
}) => {
  const { t, lang } = useT();
  const [filter, setFilter] = useState<string>('all');
  const [expandedFaraizId, setExpandedFaraizId] = useState<string | null>(null);

  const peopleMap = new Map(people.map((p) => [p.id, p]));

  // Filter tabs
  const filterOptions = [
    { id: 'all', label: t('filterAll') },
    { id: 'record', label: t('filterRecord') },
    { id: 'deed', label: t('filterDeed') },
    { id: 'mutation', label: t('filterMutation') },
    { id: 'inheritance', label: t('filterInheritance') },
    { id: 'case', label: t('filterCase') },
  ];

  const filteredEntries = timeline.filter((entry) => {
    if (filter === 'all') return true;
    return entry.event.type === filter;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFilter(opt.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === opt.id
                ? 'bg-ink text-paper shadow-xs'
                : 'bg-paper-2 text-ink-2 hover:bg-paper-3 border border-line'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline Ledger List */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line">
        {filteredEntries.map((entry) => {
          const { event, valid, issueCodes } = entry;
          const isHighlighted = highlightEventId === event.id;

          // Event type details
          let title = '';
          let subtitle = '';
          let eventIcon = <FileText className="w-4 h-4 text-ink-2" />;
          let faraizTreeComponent: React.ReactNode = null;

          if (event.type === 'record') {
            const r = event as RecordEvent;
            title = `${r.survey.toUpperCase()} ${t('khatian')} (${t('khatianNo')} ${lang === 'bn' ? toBanglaDigits(r.khatianNo) : r.khatianNo})`;
            subtitle = r.holdings
              .map((h) => {
                const p = peopleMap.get(h.personId);
                const name = p ? (lang === 'bn' ? p.nameBn : p.nameEn) : h.personId;
                const s = lang === 'bn' ? toBanglaDigits(h.share) : h.share;
                return `${name} (${s})`;
              })
              .join(' · ');
            eventIcon = <FileSpreadsheet className="w-4 h-4 text-sepia" />;
          } else if (event.type === 'deed') {
            const d = event as DeedEvent;
            title = `${t('deedNo')} ${lang === 'bn' ? toBanglaDigits(d.deedNo) : d.deedNo} (${d.kind === 'sale' ? t('sale') : t('gift')})`;
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
            subtitle = `${sellerNames} → ${buyerNames} | ${d.subRegistryBn} | ${formatTaka(d.declaredPriceBdt, lang, { short: true })}`;
            eventIcon = <FileText className="w-4 h-4 text-accent" />;
          } else if (event.type === 'mutation') {
            const m = event as MutationEvent;
            title = `${t('filterMutation')} ${t('caseNo')} ${lang === 'bn' ? toBanglaDigits(m.caseNo) : m.caseNo}`;
            subtitle = m.refDeedNo
              ? `${t('claimDeedRef')}: ${lang === 'bn' ? toBanglaDigits(m.refDeedNo) : m.refDeedNo}`
              : t('acquiredInheritance');
            eventIcon = <CheckCircle2 className="w-4 h-4 text-ok" />;
          } else if (event.type === 'inheritance') {
            const inh = event as InheritanceEvent;
            const p = peopleMap.get(inh.deceasedId);
            const decName = p ? (lang === 'bn' ? p.nameBn : p.nameEn) : inh.deceasedId;
            title = `${decName} — ${t('inheritanceDistribution')}`;
            const heirCountStr =
              lang === 'bn' ? toBanglaDigits(inh.heirs.length) : inh.heirs.length;
            subtitle = `${t('heirCount', { n: heirCountStr })} (${inh.law === 'muslim' ? t('muslimLaw') : t('hinduLaw')})`;
            eventIcon = <Users className="w-4 h-4 text-sepia" />;

            // Inheritance family tree calculation
            const hasWife = inh.heirs.some((h) => h.relation === 'wife');
            const hasHusband = inh.heirs.some((h) => h.relation === 'husband');
            const deceasedSex: 'M' | 'F' = hasHusband ? 'F' : hasWife ? 'M' : 'M';
            const faraizRes = faraiz({
              deceasedSex,
              law: inh.law,
              heirs: inh.heirs,
            });

            if (faraizRes.supported) {
              const heirsData = faraizRes.shares.map((row) => {
                const heirPerson = peopleMap.get(row.personId);
                const frac = new Fraction(row.share).valueOf();
                const area = parseFloat((frac * recordedAreaDecimal).toFixed(2));
                return {
                  personId: row.personId,
                  name: heirPerson
                    ? lang === 'bn'
                      ? heirPerson.nameBn
                      : heirPerson.nameEn
                    : row.personId,
                  relation: row.relation,
                  share: row.share,
                  areaDecimal: area,
                };
              });

              faraizTreeComponent = (
                <div className="pt-2">
                  <FamilyTree
                    deceasedName={decName}
                    heirs={heirsData}
                    totalAreaDecimal={recordedAreaDecimal}
                  />
                </div>
              );
            } else {
              faraizTreeComponent = (
                <div className="pt-2">
                  <FamilyTree
                    deceasedName={decName}
                    heirs={[]}
                    unsupportedReason={faraizRes.reason}
                  />
                </div>
              );
            }
          } else if (event.type === 'case') {
            const c = event as CaseEvent;
            title = `${t('filterCase')} ${t('caseNo')} ${lang === 'bn' ? toBanglaDigits(c.caseNo) : c.caseNo}`;
            const statusStr =
              c.status === 'pending' ? t('courtStatusPending') : t('courtStatusDisposed');
            subtitle = `${c.courtBn} | ${t('statusLabel')}: ${statusStr}`;
            eventIcon = <Scale className="w-4 h-4 text-bad" />;
          } else if (event.type === 'landTax') {
            const lt = event as LandTaxEvent;
            title = t('landTaxPayment');
            const yearStr = lang === 'bn' ? toBanglaDigits(lt.paidUpToYear) : lt.paidUpToYear;
            subtitle = `${yearStr} ${t('paidUpTo')} | ${t('arrears')}: ${formatTaka(lt.arrearsBdt, lang)}`;
            eventIcon = <Building className="w-4 h-4 text-ink-2" />;
          }

          const hasFaraiz = Boolean(faraizTreeComponent);
          const isFaraizOpen = expandedFaraizId === event.id;

          return (
            <div
              key={event.id}
              id={`timeline-event-${event.id}`}
              className={`relative group transition-all ${
                isHighlighted ? 'ring-2 ring-accent rounded-2xl p-1' : ''
              }`}
            >
              {/* Timeline Dot (Green/Ink if valid, Red Strikethrough if invalid) */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  !valid
                    ? 'bg-bad border-bad text-white shadow-xs'
                    : 'bg-paper border-sepia text-sepia'
                }`}
              >
                {!valid ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-sepia" />
                )}
              </div>

              {/* Event Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  !valid
                    ? 'bg-bad-wash/20 border-bad/30 hover:border-bad/50'
                    : 'bg-paper border-line hover:border-ink/20 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {eventIcon}
                        <span className="font-serif font-bold text-xs sm:text-sm text-ink truncate">
                          {title}
                        </span>
                      </div>

                      {!valid && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bad text-white flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          <span>{t('invalidEventBadge')}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink-2 leading-relaxed">{subtitle}</p>

                    {/* Invalid reason notes */}
                    {!valid && issueCodes.length > 0 && (
                      <div className="text-[11px] font-semibold text-bad pt-0.5">
                        {issueCodes
                          .map((code: IssueCode) => t(`issue_${code}_title` as TranslationKey))
                          .join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-ink-3 shrink-0 pt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(event.date, lang)}</span>
                  </div>
                </div>

                {/* Optional Faraiz Accordion Button */}
                {hasFaraiz && (
                  <div className="mt-3 pt-2.5 border-t border-line/60">
                    <button
                      type="button"
                      onClick={() => setExpandedFaraizId(isFaraizOpen ? null : event.id)}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isFaraizOpen ? t('closeFamilyTree') : t('viewFamilyTree')}</span>
                      {isFaraizOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isFaraizOpen && faraizTreeComponent}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
