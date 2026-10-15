import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  AlertTriangle,
  FileText,
  RotateCcw,
  ExternalLink,
  X,
  Info,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatTaka, formatNumber, toBanglaDigits, parseBanglaNumber } from '@/lib/format';

import { calculateCost } from '@/engine';
import { CostTable } from './CostTable';
import type {
  DagProps,
  PriceEstimate,
  FeeRules,
  Mouza,
  LandEvent,
  LandTaxEvent,
} from '@/engine/types';

export interface CostTabProps {
  dag: DagProps;
  priceEstimate: PriceEstimate;
  feeRules: FeeRules;
  mouza: Mouza;
  events: LandEvent[];
  className?: string;
}

export const CostTab: React.FC<CostTabProps> = ({
  dag,
  priceEstimate,
  feeRules,
  mouza,
  events,
  className = '',
}) => {
  const { t, lang } = useT();

  // 1. Calculate default price from comparable sales mid estimate × area
  const defaultPriceBdt = useMemo(() => {
    if (priceEstimate.total?.mid && priceEstimate.total.mid > 0) {
      return priceEstimate.total.mid;
    }
    if (priceEstimate.perDecimal?.mid && priceEstimate.perDecimal.mid > 0) {
      return Math.round(priceEstimate.perDecimal.mid * dag.recordedAreaDecimal);
    }
    // Fallback baseline for demo: e.g. 10 lakh
    return 1_000_000;
  }, [priceEstimate, dag.recordedAreaDecimal]);

  // Input state kept as string to facilitate fluid typing and Bengali digits
  const [priceInputStr, setPriceInputStr] = useState<string>(() =>
    lang === 'bn' ? toBanglaDigits(formatNumber(defaultPriceBdt, 'bn')) : String(defaultPriceBdt),
  );
  const [buyerPaysSourceTax, setBuyerPaysSourceTax] = useState<boolean>(true);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);

  // Sync default price if dag changes
  useEffect(() => {
    setPriceInputStr(
      lang === 'bn' ? toBanglaDigits(formatNumber(defaultPriceBdt, 'bn')) : String(defaultPriceBdt),
    );
  }, [dag.id, defaultPriceBdt, lang]);

  // Parse numerical price
  const declaredPriceBdt = useMemo(() => {
    const parsed = parseBanglaNumber(priceInputStr);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [priceInputStr]);

  // Extract latest land tax event arrears for this dag (e.g. Dag 112)
  const arrearsBdt = useMemo(() => {
    const taxEvents = events.filter((e): e is LandTaxEvent => e.type === 'landTax');
    if (taxEvents.length === 0) return 0;
    const latest = taxEvents.reduce((best, curr) => {
      if (curr.date > best.date || (curr.date === best.date && curr.id > best.id)) return curr;
      return best;
    });
    return latest.arrearsBdt ?? 0;
  }, [events]);

  // Compute cost
  const calculation = useMemo(() => {
    return calculateCost({
      declaredPriceBdt,
      recordedAreaDecimal: dag.recordedAreaDecimal,
      areaClass: mouza.areaClass,
      sourceTaxClass: mouza.sourceTaxClass,
      feeRules,
      arrearsBdt,
      buyerPaysSourceTax,
      estimateMidPerDecimalBdt: priceEstimate.perDecimal?.mid,
    });
  }, [
    declaredPriceBdt,
    dag.recordedAreaDecimal,
    mouza.areaClass,
    mouza.sourceTaxClass,
    feeRules,
    arrearsBdt,
    buyerPaysSourceTax,
    priceEstimate.perDecimal?.mid,
  ]);

  const handleStepPrice = (delta: number) => {
    const newPrice = Math.max(0, declaredPriceBdt + delta);
    setPriceInputStr(
      lang === 'bn' ? toBanglaDigits(formatNumber(newPrice, 'bn')) : String(newPrice),
    );
  };

  const handleResetPrice = () => {
    setPriceInputStr(
      lang === 'bn' ? toBanglaDigits(formatNumber(defaultPriceBdt, 'bn')) : String(defaultPriceBdt),
    );
  };

  const perDecimalRateBdt =
    dag.recordedAreaDecimal > 0 ? Math.round(declaredPriceBdt / dag.recordedAreaDecimal) : 0;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Header with Title & Demo Rates Chip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-ink flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            <span>{t('costTitle')}</span>
          </h3>
          <p className="text-xs text-ink-2 mt-0.5">{t('costSubtitle')}</p>
        </div>

        {/* Demo Rates Chip with Sources Popover */}
        <button
          type="button"
          onClick={() => setShowSourcesModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper-3/70 hover:bg-paper-3 border border-line text-xs font-semibold text-ink-2 hover:text-ink transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          title={t('demoRatesLabel')}
          aria-label={t('sourcesModalTitle')}
        >
          <span className="w-2 h-2 rounded-full bg-accent/80" />
          <span>{t('demoRatesChip')}</span>
          <Info className="w-3.5 h-3.5 text-accent ml-0.5" />
        </button>
      </div>

      {/* 2. Declared Price Input Section */}
      <div className="bg-paper-2 border border-line rounded-2xl p-4 sm:p-5 shadow-paper space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <label htmlFor="declared-price-input" className="text-xs sm:text-sm font-bold text-ink">
            {t('declaredPriceLabel')}
          </label>
          <span className="text-[11px] text-ink-3">{t('declaredPriceHint')}</span>
        </div>

        {/* Input with Quick Stepper Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <input
              id="declared-price-input"
              type="text"
              value={priceInputStr}
              onChange={(e) => setPriceInputStr(e.target.value)}
              placeholder="0"
              className="w-full bg-paper border border-line focus:border-accent focus:ring-1 focus:ring-accent rounded-xl px-3.5 py-2.5 text-base sm:text-lg font-bold text-ink tabular-nums transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-3 pointer-events-none">
              {lang === 'bn' ? 'টাকা' : 'BDT'}
            </span>
          </div>

          {/* Steppers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStepPrice(-50_000)}
              className="px-2.5 py-2 text-xs font-semibold bg-paper hover:bg-paper-3 border border-line rounded-xl text-ink transition-colors cursor-pointer"
              title="-50,000"
            >
              {t('stepDown50k')}
            </button>
            <button
              type="button"
              onClick={() => handleStepPrice(50_000)}
              className="px-2.5 py-2 text-xs font-semibold bg-paper hover:bg-paper-3 border border-line rounded-xl text-ink transition-colors cursor-pointer"
              title="+50,000"
            >
              {t('stepUp50k')}
            </button>
            {declaredPriceBdt !== defaultPriceBdt && (
              <button
                type="button"
                onClick={handleResetPrice}
                className="p-2 text-xs font-semibold bg-paper hover:bg-paper-3 border border-line rounded-xl text-accent transition-colors cursor-pointer flex items-center gap-1"
                title={t('resetEstimatePrice')}
                aria-label={t('resetEstimatePrice')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Per-decimal calculation context */}
        <div className="flex items-center justify-between text-xs text-ink-2 pt-1 border-t border-line/60">
          <span>
            {t('perDecimalPrice', {
              amount: formatTaka(perDecimalRateBdt, lang),
            })}
          </span>
          <span className="text-[11px] text-ink-3">
            {lang === 'bn'
              ? `মোট আয়তন: ${toBanglaDigits(dag.recordedAreaDecimal)} শতাংশ`
              : `Area: ${dag.recordedAreaDecimal} decimal`}
          </span>
        </div>
      </div>

      {/* 3. Under-declared Warning Callout (shown if < 50% of market mid estimate) */}
      {/* Strictly NO 'savings' wording — UX_PSYCHOLOGY.md §4 */}
      {calculation.isUnderDeclared && priceEstimate.perDecimal?.mid && (
        <div
          role="alert"
          className="p-4 bg-warn-wash/40 border-2 border-warn/50 rounded-2xl flex items-start gap-3 shadow-xs animate-in fade-in duration-200"
        >
          <AlertTriangle className="w-5 h-5 text-warn shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-warn">
              {t('underDeclaredWarningTitle')}
            </h4>
            <p className="text-xs text-ink-2 leading-relaxed">
              {t('underDeclaredWarningDesc', {
                marketMid: formatTaka(priceEstimate.perDecimal.mid, lang),
                enteredMid: formatTaka(perDecimalRateBdt, lang),
              })}
            </p>
          </div>
        </div>
      )}

      {/* 4. Buyer Pays Source Tax Switch */}
      <div className="bg-paper-2 border border-line rounded-2xl p-4 shadow-paper space-y-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={buyerPaysSourceTax}
            onChange={(e) => setBuyerPaysSourceTax(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-line text-accent focus:ring-accent cursor-pointer accent-accent"
          />
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-bold text-ink">
              {t('buyerPaysSourceTaxLabel')}
            </div>
            <p className="text-xs text-ink-3 leading-relaxed">{t('buyerPaysSourceTaxNote')}</p>
          </div>
        </label>
      </div>

      {/* 5. Cost Breakdown Table (Ledger Style) */}
      <CostTable calculation={calculation} />

      {/* 6. Sources Popover / Modal Dialog */}
      {showSourcesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sources-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-paper border border-line rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 text-ink">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h4
                id="sources-modal-title"
                className="font-serif font-bold text-base text-ink flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-accent" />
                <span>{t('sourcesModalTitle')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowSourcesModal(false)}
                className="p-1 rounded-lg hover:bg-paper-3 text-ink-3 hover:text-ink cursor-pointer"
                aria-label={t('sourcesModalClose')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink-2">
              <p className="leading-relaxed">{t('sourcesVerifiedNotice')}</p>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-ink">
                  {lang === 'bn' ? 'তথ্যসূত্র ও গ্যাজেট:' : 'Official Citations:'}
                </div>
                {feeRules.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-paper-2 hover:bg-paper-3 border border-line text-accent font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed hover:underline">{source.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowSourcesModal(false)}
                className="px-4 py-2 bg-accent text-accent-ink rounded-xl text-xs font-semibold hover:bg-accent/90 transition-colors cursor-pointer"
              >
                {t('sourcesModalClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
