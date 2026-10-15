import React from 'react';
import { Badge } from '@/ui/Badge';
import { useT } from '@/i18n/useT';
import type { TranslationKey } from '@/i18n/bn';
import { formatDecimal, toBanglaDigits } from '@/lib/format';
import { decimalToKatha } from '@/engine/units';
import type { DagProps, Verdict } from '@/engine/types';

export interface PlotCardPeekProps {
  dag: DagProps;
  verdict: Verdict;
  className?: string;
}

export const PlotCardPeek: React.FC<PlotCardPeekProps> = ({ dag, verdict, className = '' }) => {
  const { t, lang } = useT();

  const displayDagNo = lang === 'bn' ? toBanglaDigits(dag.id) : dag.id;
  const areaDecimal = dag.recordedAreaDecimal;
  const areaKatha = decimalToKatha(areaDecimal);

  const displayDecimalStr = formatDecimal(areaDecimal, lang);
  const displayKathaStr = formatDecimal(areaKatha, lang);

  const verdictVariant = verdict === 'red' ? 'bad' : verdict === 'yellow' ? 'warn' : 'ok';

  const verdictLabel =
    verdict === 'red' ? t('verdictBad') : verdict === 'yellow' ? t('verdictWarn') : t('verdictOk');

  // Localized land class label
  const landClassKey = `landClass_${dag.landClass}` as TranslationKey;
  const landClassLabel = t(landClassKey) || dag.landClass;

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg sm:text-xl font-bold text-ink">
            {t('dag')} {displayDagNo}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-paper-3 text-ink-2 border border-line">
            {landClassLabel}
          </span>
        </div>

        <div className="text-xs text-ink-2 tabular-nums">
          {displayDecimalStr} {t('decimalUnit')} · {displayKathaStr} {t('kathaUnit')}
        </div>
      </div>

      <div className="shrink-0">
        <Badge variant={verdictVariant} size="md">
          {verdictLabel}
        </Badge>
      </div>
    </div>
  );
};
