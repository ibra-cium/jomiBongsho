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
      className={`bg-paper-2 border border-line rounded-2xl p-4 sm:p-5 shadow-paper space-y-4 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-line text-ink-3 font-semibold pb-2">
              <th scope="col" className="py-2.5 pr-2 font-medium">
                {t('costTableItem')}
              </th>
              <th scope="col" className="py-2.5 px-2 text-center font-medium w-20">
                {t('costTableRate')}
              </th>
              <th scope="col" className="py-2.5 pl-2 text-right font-medium">
                {t('costTableAmount')}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-dotted divide-line/80 font-sans">
            {calculation.lines.map((line) => {
              const isFixedFees = line.id === 'fixedFees';
              const isMutation = line.id === 'mutationFee';
              const isArrears = line.id === 'landTaxArrears';

              return (
                <React.Fragment key={line.id}>
                  <tr
                    className={`hover:bg-paper-3/40 transition-colors ${isArrears ? 'bg-warn-wash/20' : ''}`}
                  >
                    <td className="py-3 pr-2 align-top">
                      <div className="font-medium text-ink flex items-center gap-1.5 flex-wrap">
                        <span>{lang === 'bn' ? line.labelBn : line.labelEn}</span>
                        {isFixedFees && (
                          <button
                            type="button"
                            onClick={() => setExpandedFixed(!expandedFixed)}
                            className="inline-flex items-center gap-0.5 text-[11px] text-accent hover:underline cursor-pointer ml-1 py-0.5 px-1.5 rounded bg-accent/10"
                            aria-expanded={expandedFixed}
                            aria-label={t('fixedFeesBreakdownToggle')}
                          >
                            <span>{t('fixedFeesBreakdownToggle')}</span>
                            {expandedFixed ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        {isMutation && (
                          <button
                            type="button"
                            onClick={() => setExpandedMutation(!expandedMutation)}
                            className="inline-flex items-center gap-0.5 text-[11px] text-accent hover:underline cursor-pointer ml-1 py-0.5 px-1.5 rounded bg-accent/10"
                            aria-expanded={expandedMutation}
                            aria-label={t('mutationBreakdownToggle')}
                          >
                            <span>{t('mutationBreakdownToggle')}</span>
                            {expandedMutation ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      {line.noteBn && (
                        <p className="text-[11px] text-ink-3 mt-0.5 leading-relaxed">
                          {lang === 'bn' ? line.noteBn : line.noteEn}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-ink-2 tabular-nums align-top">
                      {isArrears ? (
                        <span className="text-[11px] font-semibold text-warn px-1.5 py-0.5 rounded bg-warn/10">
                          {lang === 'bn' ? 'বকেয়া' : 'Arrears'}
                        </span>
                      ) : (
                        formatRate(line.basisPoints)
                      )}
                    </td>
                    <td className="py-3 pl-2 text-right font-medium text-ink tabular-nums align-top whitespace-nowrap">
                      {formatTaka(line.amountBdt, lang)}
                    </td>
                  </tr>

                  {/* Expandable Fixed Fees Sub-items */}
                  {isFixedFees && expandedFixed && line.subItems && (
                    <tr className="bg-paper/70">
                      <td colSpan={3} className="py-2.5 px-3">
                        <div className="space-y-1.5 pl-3 border-l-2 border-accent/40 text-xs">
                          {line.subItems.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex justify-between items-center text-ink-2"
                            >
                              <span>• {lang === 'bn' ? sub.labelBn : sub.labelEn}</span>
                              <span className="tabular-nums font-medium text-ink">
                                {formatTaka(sub.amountBdt, lang)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Expandable Mutation Fee Sub-items */}
                  {isMutation && expandedMutation && line.subItems && (
                    <tr className="bg-paper/70">
                      <td colSpan={3} className="py-2.5 px-3">
                        <div className="space-y-1.5 pl-3 border-l-2 border-accent/40 text-xs">
                          {line.subItems.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex justify-between items-center text-ink-2"
                            >
                              <span>• {lang === 'bn' ? sub.labelBn : sub.labelEn}</span>
                              <span className="tabular-nums font-medium text-ink">
                                {formatTaka(sub.amountBdt, lang)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Table Footer with Ledger-style Summary */}
          <tfoot className="border-t-2 border-line divide-y divide-dotted divide-line/60">
            {/* Government Fees Subtotal */}
            <tr className="font-semibold text-ink">
              <td className="py-3 pr-2">
                <div className="flex items-center gap-2">
                  <span>{t('costGovtFeesTotalRow')}</span>
                  {calculation.effectiveRatePct > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {lang === 'bn'
                        ? `${toBanglaDigits(calculation.effectiveRatePct.toFixed(1))}%`
                        : `${calculation.effectiveRatePct.toFixed(1)}%`}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 text-center text-ink-3 text-xs">—</td>
              <td className="py-3 pl-2 text-right text-accent font-bold tabular-nums whitespace-nowrap">
                {formatTaka(calculation.feesTotalBdt, lang)}
              </td>
            </tr>

            {/* Land Price */}
            <tr className="text-ink-2">
              <td className="py-2.5 pr-2">{t('costLandPriceRow')}</td>
              <td className="py-2.5 px-2 text-center text-ink-3 text-xs">—</td>
              <td className="py-2.5 pl-2 text-right font-medium text-ink tabular-nums whitespace-nowrap">
                {formatTaka(calculation.landPriceBdt, lang)}
              </td>
            </tr>

            {/* Grand Total Row in Display Style */}
            <tr className="bg-paper-3/50 font-serif">
              <td className="py-4 pr-2 pl-2">
                <div className="font-bold text-base sm:text-lg text-ink">
                  {t('costGrandTotalRow')}
                </div>
                <div className="text-[11px] font-sans text-ink-3 font-normal mt-0.5">
                  {t('costEffectiveRate', {
                    rate:
                      lang === 'bn'
                        ? toBanglaDigits(calculation.effectiveRatePct.toFixed(1))
                        : calculation.effectiveRatePct.toFixed(1),
                  })}
                </div>
              </td>
              <td className="py-4 px-2 text-center text-ink-3 text-xs">—</td>
              <td className="py-4 pl-2 pr-2 text-right align-middle">
                <span className="font-bold text-xl sm:text-2xl text-accent tabular-nums whitespace-nowrap">
                  {formatTaka(calculation.grandTotalBdt, lang)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
