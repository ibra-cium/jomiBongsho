import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatTaka, formatDate, toBanglaDigits } from '@/lib/format';
import type { PriceEstimate, Comp, DagProps } from '@/engine/types';
import type { TranslationKey } from '@/i18n/bn';

export interface PriceCardProps {
  estimate: PriceEstimate;
  dag: DagProps;
  className?: string;
}

export const PriceCard: React.FC<PriceCardProps> = ({ estimate, dag, className = '' }) => {
  const { t, lang } = useT();
  const [viewMode, setViewMode] = useState<'perDecimal' | 'total'>('perDecimal');
  const [showComps, setShowComps] = useState(false);
  const [compsFilter, setCompsFilter] = useState<'all' | 'used' | 'excluded'>('all');

  // Insufficient data path
  if (estimate.status === 'insufficient' || !estimate.perDecimal || !estimate.total) {
    return (
      <div
        className={`bg-paper-2 border border-line rounded-lg p-5 text-center space-y-3 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-warn/10 text-warn flex items-center justify-center mx-auto">
          <Info className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-lg font-bold text-ink">{t('priceInsufficientTitle')}</h3>
        <p className="text-sm text-ink-2 max-w-md mx-auto leading-relaxed">
          {t('priceInsufficientDesc')}
        </p>
        <div className="text-xs text-ink-3 pt-2 border-t border-line/60">
          {t('priceDisclaimer')}
        </div>
      </div>
    );
  }

  const { perDecimal, total, comps, radiusM, adjustments } = estimate;
  const isRoadFacingAdjusted = adjustments.some((a) => a.key === 'roadFacing');

  const currentValues = viewMode === 'perDecimal' ? perDecimal : total;
  const usedComps = comps.filter((c) => c.used);
  const excludedComps = comps.filter((c) => !c.used);

  const filteredComps = comps.filter((c) => {
    if (compsFilter === 'used') return c.used;
    if (compsFilter === 'excluded') return !c.used;
    return true;
  });

  const getExcludeReasonText = (reason?: Comp['excludeReason']): string => {
    if (!reason) return '';
    const key = `compExclude_${reason}` as TranslationKey;
    return t(key);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Card: Estimate & Ruler */}
      <div className="bg-paper-2 border border-line rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/10 text-accent flex items-center justify-center">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink text-base sm:text-lg flex items-center gap-1.5">
                <span>{t('priceTitle')}</span>
                <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-paper border border-line text-ink-2">
                  আনুমানিক
                </span>
              </h3>
            </div>
          </div>

          {/* Unit Toggle: Per Decimal vs Whole Plot */}
          <div
            role="group"
            aria-label="Price unit toggle"
            className="flex p-0.5 rounded-lg bg-paper border border-line text-xs font-medium"
          >
            <button
              type="button"
              onClick={() => setViewMode('perDecimal')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'perDecimal'
                  ? 'bg-ink text-paper shadow-xs font-semibold'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {t('pricePerDecimal')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'total'
                  ? 'bg-ink text-paper shadow-xs font-semibold'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {t('priceTotalPlot', {
                area:
                  lang === 'bn' ? toBanglaDigits(dag.recordedAreaDecimal) : dag.recordedAreaDecimal,
              })}
            </button>
          </div>
        </div>

        {/* Primary Average Figure */}
        <div className="text-center py-2 space-y-1">
          <div className="text-xs uppercase tracking-wider text-ink-3 font-semibold">
            {t('priceRulerMid')}
          </div>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-accent tracking-tight">
            {formatTaka(currentValues.mid, lang, { short: false })}
          </div>
          <div className="text-xs text-ink-2 flex items-center justify-center gap-2">
            <span>
              {viewMode === 'perDecimal'
                ? t('pricePerDecimal')
                : t('priceTotalPlot', {
                    area:
                      lang === 'bn'
                        ? toBanglaDigits(dag.recordedAreaDecimal)
                        : dag.recordedAreaDecimal,
                  })}
            </span>
            {isRoadFacingAdjusted && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                🛣️ {t('priceRoadAdjustment')}
              </span>
            )}
          </div>
        </div>

        {/* Ruler Range Visualization */}
        <div className="bg-paper border border-line rounded-lg p-3 sm:p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-medium text-ink-2">
            <span>{t('priceRulerRange')}</span>
            <span className="text-[11px] text-ink-3">
              {radiusM === 500 ? '৫০০ মি. ব্যাসার্ধ' : '১,০০০ মি. ব্যাসার্ধ'}
            </span>
          </div>

          {/* Graphical Ruler */}
          <div className="relative pt-6 pb-2">
            {/* The ruler track */}
            <div className="h-2.5 bg-paper-2 border border-line/80 rounded-full relative overflow-hidden flex items-center justify-between px-1">
              {/* Subtle architectural ruler tick marks */}
              <div className="w-full flex justify-between px-1 opacity-40">
                {Array.from({ length: 17 }).map((_, i) => (
                  <div key={i} className={`w-px bg-ink ${i % 4 === 0 ? 'h-2' : 'h-1'}`} />
                ))}
              </div>
            </div>

            {/* Range highlight bar between 0% and 100% */}
            <div className="absolute top-6 left-0 right-0 h-2.5 bg-accent/15 rounded-full pointer-events-none" />

            {/* Mid value pin on ruler */}
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center"
              aria-hidden="true"
            >
              <div className="w-2.5 h-2.5 rotate-45 bg-accent shadow-xs" />
              <div className="w-0.5 h-3.5 bg-accent" />
            </div>
          </div>

          {/* Three Range Figures: Low - Mid - High */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            {/* Low */}
            <div className="text-left">
              <div className="text-[11px] text-ink-3">{t('priceRulerLow')}</div>
              <div className="text-xs sm:text-sm font-semibold text-ink">
                {formatTaka(currentValues.low, lang, { short: true })}
              </div>
            </div>

            {/* Mid */}
            <div className="text-center">
              <div className="text-[11px] text-accent font-medium">{t('priceRulerMid')}</div>
              <div className="text-xs sm:text-sm font-bold text-accent">
                {formatTaka(currentValues.mid, lang, { short: true })}
              </div>
            </div>

            {/* High */}
            <div className="text-right">
              <div className="text-[11px] text-ink-3">{t('priceRulerHigh')}</div>
              <div className="text-xs sm:text-sm font-semibold text-ink">
                {formatTaka(currentValues.high, lang, { short: true })}
              </div>
            </div>
          </div>
        </div>

        {/* Method Note */}
        <div className="flex items-start gap-2 text-xs text-ink-3 pt-1">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{t('priceDisclaimer')}</span>
        </div>
      </div>

      {/* Comps Accordion Button */}
      <div className="bg-paper-2 border border-line rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowComps(!showComps)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-paper transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={showComps}
          aria-controls="comps-panel"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" aria-hidden="true" />
            <div>
              <div className="font-semibold text-ink text-sm sm:text-base">
                {t('priceCompsCount', {
                  n: lang === 'bn' ? toBanglaDigits(comps.length) : comps.length,
                })}
              </div>
              <div className="text-xs text-ink-2">
                {lang === 'bn'
                  ? `${toBanglaDigits(usedComps.length)}টি ব্যবহৃত · ${toBanglaDigits(excludedComps.length)}টি বাদ`
                  : `${usedComps.length} used · ${excludedComps.length} excluded`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
            <span>{showComps ? t('priceCompsToggleHide') : t('priceCompsToggleShow')}</span>
            {showComps ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
        </button>

        {/* Collapsible Comps Panel */}
        {showComps && (
          <div id="comps-panel" className="border-t border-line/60 p-4 space-y-3 bg-paper">
            {/* Filter Tabs: All / Used / Excluded */}
            <div className="flex gap-1.5 text-xs pb-1">
              <button
                type="button"
                onClick={() => setCompsFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  compsFilter === 'all'
                    ? 'bg-ink text-paper font-semibold'
                    : 'bg-paper-2 text-ink-2 hover:text-ink border border-line'
                }`}
              >
                সব ({lang === 'bn' ? toBanglaDigits(comps.length) : comps.length})
              </button>
              <button
                type="button"
                onClick={() => setCompsFilter('used')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  compsFilter === 'used'
                    ? 'bg-good text-paper font-semibold'
                    : 'bg-paper-2 text-ink-2 hover:text-ink border border-line'
                }`}
              >
                ব্যবহৃত ({lang === 'bn' ? toBanglaDigits(usedComps.length) : usedComps.length})
              </button>
              <button
                type="button"
                onClick={() => setCompsFilter('excluded')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  compsFilter === 'excluded'
                    ? 'bg-warn text-paper font-semibold'
                    : 'bg-paper-2 text-ink-2 hover:text-ink border border-line'
                }`}
              >
                বাদ দেওয়া (
                {lang === 'bn' ? toBanglaDigits(excludedComps.length) : excludedComps.length})
              </button>
            </div>

            {/* Comps List */}
            <div className="space-y-2">
              {filteredComps.map((comp) => {
                return (
                  <div
                    key={comp.eventId}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      comp.used
                        ? 'bg-paper-2 border-line hover:border-accent/40'
                        : 'bg-paper-2/60 border-line/60 opacity-80'
                    }`}
                  >
                    {/* Header Row: Dag, Deed, Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-ink text-sm">
                          দাগ {lang === 'bn' ? toBanglaDigits(comp.dagId) : comp.dagId}
                        </span>
                        <span className="text-ink-3 text-[11px] font-mono">{comp.deedNo}</span>
                        {comp.isRoadFacing && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-accent/10 text-accent font-medium">
                            রাস্তার পাশে
                          </span>
                        )}
                      </div>

                      {/* Used / Excluded Badge */}
                      {comp.used ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-good/10 text-good border border-good/20 font-medium">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          <span>{t('compStatusUsed')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-warn/10 text-warn border border-warn/20 font-medium">
                          <XCircle className="w-3 h-3" aria-hidden="true" />
                          <span>{t('compStatusExcluded')}</span>
                        </span>
                      )}
                    </div>

                    {/* Meta Row: Date, Distance, Price */}
                    <div className="flex flex-wrap items-center justify-between gap-y-1 text-ink-2 pt-0.5 border-t border-line/40">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-ink-3" aria-hidden="true" />
                          <span>{formatDate(comp.date, lang)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-ink-3" aria-hidden="true" />
                          <span>
                            {t('metersUnit', {
                              n: lang === 'bn' ? toBanglaDigits(comp.distanceM) : comp.distanceM,
                            })}
                          </span>
                        </span>
                      </div>

                      {/* Price per decimal */}
                      <div className="text-right font-medium">
                        <span className="text-ink font-semibold">
                          {formatTaka(Math.round(comp.rawPricePerDecimalBdt), lang, {
                            short: false,
                          })}
                        </span>
                        <span className="text-ink-3 text-[11px]"> / শতাংশ</span>
                      </div>
                    </div>

                    {/* Exclude Reason Banner */}
                    {!comp.used && comp.excludeReason && (
                      <div className="text-[11px] text-warn bg-warn/5 border border-warn/20 px-2 py-1 rounded-sm mt-1">
                        <span className="font-semibold">কারণ: </span>
                        <span>{getExcludeReasonText(comp.excludeReason)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
