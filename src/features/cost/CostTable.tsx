import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatTaka, toBanglaDigits } from '@/lib/format';
import type { CostCalculation } from '@/engine/types';

export interface CostTableProps {
  calculation: CostCalculation;
  className?: string;
}

export const CostTable: React.FC<CostTableProps> = ({ calculation, className = '' }) => {
  const { t, lang } = useT();
  const [expandedFixed, setExpandedFixed] = useState(false);
  const [expandedMutation, setExpandedMutation] = useState(false);

  const formatRate = (bp?: number) => {
    if (bp === undefined) return lang === 'bn' ? 'নির্দিষ্ট' : 'Fixed';
    const pct = bp / 100;
    const pctStr = pct.toFixed(2).replace(/\.00$/, '');
    return lang === 'bn' ? `${toBanglaDigits(pctStr)}%` : `${pctStr}%`;
  };

  return (
    <div
      className={`bg-paper-2 border border-line rounded-2xl p-3.5 sm:p-4 shadow-paper space-y-3 ${className}`}
    >
      {/* Ledger Line Items */}
      <div className="divide-y divide-dotted divide-line/80 font-sans text-xs sm:text-sm">
        {calculation.lines.map((line) => {
          const isFixedFees = line.id === 'fixedFees';
          const isMutation = line.id === 'mutationFee';
          const isArrears = line.id === 'landTaxArrears';

          return (
            <div
              key={line.id}
              className={`py-2 first:pt-0 last:pb-1 ${isArrears ? 'bg-warn-wash/30 -mx-2 px-2 rounded-lg' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Title + Rate Pill */}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink flex items-center gap-1.5 flex-wrap leading-snug">
                    <span>{lang === 'bn' ? line.labelBn : line.labelEn}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded tabular-nums ${
                        isArrears ? 'bg-warn/15 text-warn font-bold' : 'bg-paper-3 text-ink-2'
                      }`}
                    >
                      {isArrears
                        ? lang === 'bn'
                          ? 'বকেয়া'
                          : 'Arrears'
                        : formatRate(line.basisPoints)}
                    </span>
                    {isFixedFees && (
                      <button
                        type="button"
                        onClick={() => setExpandedFixed(!expandedFixed)}
                        className="inline-flex items-center gap-0.5 text-[10px] text-accent hover:underline cursor-pointer py-0.5 px-1.5 rounded bg-accent/10"
                        aria-expanded={expandedFixed}
                        aria-label={t('fixedFeesBreakdownToggle')}
                      >
                        <span>{t('fixedFeesBreakdownToggle')}</span>
                        {expandedFixed ? (
                          <ChevronUp className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronDown className="w-2.5 h-2.5" />
                        )}
                      </button>
                    )}
                    {isMutation && (
                      <button
                        type="button"
                        onClick={() => setExpandedMutation(!expandedMutation)}
                        className="inline-flex items-center gap-0.5 text-[10px] text-accent hover:underline cursor-pointer py-0.5 px-1.5 rounded bg-accent/10"
                        aria-expanded={expandedMutation}
                        aria-label={t('mutationBreakdownToggle')}
                      >
                        <span>{t('mutationBreakdownToggle')}</span>
                        {expandedMutation ? (
                          <ChevronUp className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronDown className="w-2.5 h-2.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {line.noteBn && (
                    <p className="text-[11px] text-ink-3 mt-0.5 leading-tight">
                      {lang === 'bn' ? line.noteBn : line.noteEn}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right font-medium text-ink tabular-nums whitespace-nowrap shrink-0">
                  {formatTaka(line.amountBdt, lang)}
                </div>
              </div>

              {/* Expandable Fixed Fees Sub-items */}
              {isFixedFees && expandedFixed && line.subItems && (
                <div className="mt-2 p-2 bg-paper/80 rounded-xl space-y-1 text-xs">
                  {line.subItems.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center text-ink-2 pl-2 border-l border-accent/40"
                    >
                      <span>{lang === 'bn' ? sub.labelBn : sub.labelEn}</span>
                      <span className="tabular-nums font-medium text-ink">
                        {formatTaka(sub.amountBdt, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expandable Mutation Fee Sub-items */}
              {isMutation && expandedMutation && line.subItems && (
                <div className="mt-2 p-2 bg-paper/80 rounded-xl space-y-1 text-xs">
                  {line.subItems.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center text-ink-2 pl-2 border-l border-accent/40"
                    >
                      <span>{lang === 'bn' ? sub.labelBn : sub.labelEn}</span>
                      <span className="tabular-nums font-medium text-ink">
                        {formatTaka(sub.amountBdt, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-2.5 border-t-2 border-line space-y-2 text-xs sm:text-sm">
        {/* Government Fees Subtotal */}
        <div className="flex items-center justify-between text-ink font-semibold">
          <div className="flex items-center gap-1.5">
            <span>{t('costGovtFeesTotalRow')}</span>
            {calculation.effectiveRatePct > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-accent/10 text-accent">
                {lang === 'bn'
                  ? `${toBanglaDigits(calculation.effectiveRatePct.toFixed(1))}%`
                  : `${calculation.effectiveRatePct.toFixed(1)}%`}
              </span>
            )}
          </div>
          <span className="text-accent font-bold tabular-nums whitespace-nowrap">
            {formatTaka(calculation.feesTotalBdt, lang)}
          </span>
        </div>

        {/* Land Price */}
        <div className="flex items-center justify-between text-ink-2">
          <span>{t('costLandPriceRow')}</span>
          <span className="font-medium text-ink tabular-nums whitespace-nowrap">
            {formatTaka(calculation.landPriceBdt, lang)}
          </span>
        </div>

        {/* Grand Total Row in Display Style */}
        <div className="p-3 bg-paper-3/60 rounded-xl flex items-center justify-between gap-3 mt-1.5">
          <div className="min-w-0">
            <div className="font-serif font-bold text-sm sm:text-base text-ink leading-tight">
              {t('costGrandTotalRow')}
            </div>
            <div className="text-[10px] sm:text-[11px] font-sans text-ink-3 mt-0.5">
              {t('costEffectiveRate', {
                rate:
                  lang === 'bn'
                    ? toBanglaDigits(calculation.effectiveRatePct.toFixed(1))
                    : calculation.effectiveRatePct.toFixed(1),
              })}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-serif font-bold text-lg sm:text-xl text-accent tabular-nums whitespace-nowrap">
              {formatTaka(calculation.grandTotalBdt, lang)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
