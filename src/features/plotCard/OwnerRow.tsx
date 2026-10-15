import React from 'react';
import { User, AlertCircle, ShieldAlert } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatDecimal, toBanglaDigits } from '@/lib/format';
import { decimalToKatha } from '@/engine/units';
import type { OwnerRow as OwnerRowType } from '@/engine/verdict';

export interface OwnerSectionProps {
  owners: OwnerRowType[];
  className?: string;
}

export const OwnerRow: React.FC<{ owner: OwnerRowType }> = ({ owner }) => {
  const { t, lang } = useT();

  const displayName = lang === 'bn' ? owner.nameBn : owner.nameEn;
  const displayShare = lang === 'bn' ? toBanglaDigits(owner.share) : owner.share;
  const displayAreaDecimal = formatDecimal(owner.areaDecimal, lang);
  const displayKatha = formatDecimal(decimalToKatha(owner.areaDecimal), lang);

  const acquisitionBadge = {
    record: { label: t('acquiredRecord'), class: 'bg-paper-3 text-ink-2 border-line' },
    deed: { label: t('acquiredDeed'), class: 'bg-accent/10 text-accent border-accent/20' },
    inheritance: { label: t('acquiredInheritance'), class: 'bg-paper-3 text-sepia border-line' },
  }[owner.acquiredBy];

  return (
    <div className="p-3 bg-paper rounded-xl border border-line flex items-center justify-between gap-3 text-xs hover:border-ink/20 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-paper-3 border border-line flex items-center justify-center shrink-0 text-ink-2">
          <User className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="font-serif font-bold text-ink text-sm truncate" title={displayName}>
            {displayName}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acquisitionBadge.class}`}
            >
              {acquisitionBadge.label}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-sans font-bold text-sm text-ink tabular-nums">
          {displayShare}{' '}
          <span className="text-xs font-normal text-ink-2">{t('ownershipShare')}</span>
        </div>
        <div className="text-[11px] text-ink-2 tabular-nums">
          {displayAreaDecimal} {t('decimalUnit')} · {displayKatha} {t('kathaUnit')}
        </div>
      </div>
    </div>
  );
};

export const OwnersList: React.FC<OwnerSectionProps> = ({ owners, className = '' }) => {
  const { t, lang } = useT();

  const validOwners = owners.filter((o) => !o.isClaim && !o.isEstate);
  const disputedClaims = owners.filter((o) => o.isClaim);
  const estatesInReview = owners.filter((o) => o.isEstate);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Legal Owners */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-ink px-1">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-ok" />
            <span>{t('currentOwners')}</span>
          </div>
          <span className="text-[11px] font-medium text-ink-3">
            ({lang === 'bn' ? toBanglaDigits(validOwners.length) : validOwners.length} জন)
          </span>
        </div>

        <div className="space-y-2">
          {validOwners.map((owner, idx) => (
            <OwnerRow key={`${owner.personId}-${idx}`} owner={owner} />
          ))}
        </div>
      </div>

      {/* 2. Disputed Claims (Banned/Double-sale Buyers) */}
      {disputedClaims.length > 0 && (
        <div className="p-3.5 bg-bad-wash/40 border-2 border-dashed border-bad/40 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-bad">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="font-serif font-bold text-xs sm:text-sm">
              {t('disputedClaims')} (
              {lang === 'bn' ? toBanglaDigits(disputedClaims.length) : disputedClaims.length})
            </span>
          </div>
          <p className="text-[11px] text-ink-2 leading-relaxed">{t('disputedClaimNotice')}</p>

          <div className="space-y-2 pt-1">
            {disputedClaims.map((claim, idx) => {
              const name = lang === 'bn' ? claim.nameBn : claim.nameEn;
              const shareStr = lang === 'bn' ? toBanglaDigits(claim.share) : claim.share;
              const area = formatDecimal(claim.areaDecimal, lang);

              return (
                <div
                  key={`${claim.personId}-${idx}`}
                  className="p-2.5 bg-paper rounded-xl border border-bad/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-bad/10 text-bad flex items-center justify-center font-bold text-xs shrink-0">
                      !
                    </div>
                    <div>
                      <div className="font-serif font-bold text-ink text-xs">{name}</div>
                      <div className="text-[10px] text-bad font-medium">
                        {t('disputedClaims')} (দলিল নং {claim.deedId || 'অকার্যকর'})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-bad tabular-nums">
                      {shareStr} {t('ownershipShare')}
                    </div>
                    <div className="text-[11px] text-ink-2 tabular-nums">
                      {area} {t('decimalUnit')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Estates Awaiting Legal Review */}
      {estatesInReview.length > 0 && (
        <div className="p-3.5 bg-warn-wash/40 border border-warn/40 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-warn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-serif font-bold text-xs sm:text-sm">
              {t('estatesInReview')} (
              {lang === 'bn' ? toBanglaDigits(estatesInReview.length) : estatesInReview.length})
            </span>
          </div>
          <p className="text-[11px] text-ink-2 leading-relaxed">{t('estatesInReviewNotice')}</p>

          <div className="space-y-2 pt-1">
            {estatesInReview.map((estate, idx) => {
              const name = lang === 'bn' ? estate.nameBn : estate.nameEn;
              const shareStr = lang === 'bn' ? toBanglaDigits(estate.share) : estate.share;
              const area = formatDecimal(estate.areaDecimal, lang);

              return (
                <div
                  key={`${estate.personId}-${idx}`}
                  className="p-2.5 bg-paper rounded-xl border border-warn/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-warn/10 text-warn flex items-center justify-center font-bold text-xs shrink-0">
                      §
                    </div>
                    <div>
                      <div className="font-serif font-bold text-ink text-xs">
                        {name} ({t('deceased')})
                      </div>
                      <div className="text-[10px] text-warn font-medium">
                        {estate.estateReason || t('estateReason')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-warn tabular-nums">
                      {shareStr} {t('ownershipShare')}
                    </div>
                    <div className="text-[11px] text-ink-2 tabular-nums">
                      {area} {t('decimalUnit')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
