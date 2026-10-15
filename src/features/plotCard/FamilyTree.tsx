import React from 'react';
import { AlertCircle, User, Users } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatDecimal, toBanglaDigits } from '@/lib/format';
import type { Relation } from '@/engine/types';

export interface FamilyTreeHeir {
  personId: string;
  name: string;
  relation: Relation | string;
  share: string; // e.g. "7/20"
  areaDecimal?: number;
  isOverSelling?: boolean;
}

export interface FamilyTreeProps {
  deceasedName: string;
  deceasedId?: string;
  heirs: FamilyTreeHeir[];
  highlightPersonId?: string;
  unsupportedReason?: string;
  totalAreaDecimal?: number;
  className?: string;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({
  deceasedName,
  heirs,
  highlightPersonId,
  unsupportedReason,
  totalAreaDecimal,
  className = '',
}) => {
  const { t, lang } = useT();

  const getRelationLabel = (relation: string) => {
    switch (relation) {
      case 'wife':
        return t('relation_wife');
      case 'husband':
        return t('relation_husband');
      case 'father':
        return t('relation_father');
      case 'mother':
        return t('relation_mother');
      case 'son':
        return t('relation_son');
      case 'daughter':
        return t('relation_daughter');
      default:
        return relation;
    }
  };

  // If unsupported inheritance case
  if (unsupportedReason) {
    return (
      <div className={`p-4 bg-paper-2 border border-line rounded-xl space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-warn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-xs sm:text-sm">{t('faraizLegalReviewRequired')}</span>
        </div>
        <p className="text-xs text-ink-2 leading-relaxed">
          {deceasedName} ({t('deceased')}): {unsupportedReason}
        </p>
        <div className="text-[11px] text-ink-3 italic">{t('faraizDisclaimer')}</div>
      </div>
    );
  }

  // Calculate layout geometry for SVG connecting lines
  const heirCount = heirs.length;
  // Node width & spacing
  const cardWidth = 140;
  const cardGap = 16;
  const totalWidth = Math.max(340, heirCount * (cardWidth + cardGap) - cardGap + 32);
  const svgHeight = 60;
  const parentX = totalWidth / 2;
  const parentY = 10;

  return (
    <div
      className={`p-4 bg-paper-2/60 border border-line rounded-xl space-y-4 overflow-hidden ${className}`}
    >
      {/* Header & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <span className="font-serif font-bold text-sm text-ink">{t('viewFamilyTree')}</span>
        </div>
        <span className="text-[11px] text-ink-3 italic">{t('faraizDisclaimer')}</span>
      </div>

      {/* Visual Tree */}
      <div className="overflow-x-auto py-2">
        <div style={{ minWidth: `${totalWidth}px` }} className="flex flex-col items-center">
          {/* Deceased Node */}
          <div className="flex flex-col items-center z-10">
            <div className="px-4 py-2 bg-paper-3 border border-line rounded-xl shadow-xs text-center">
              <div className="flex items-center justify-center gap-1.5 text-ink-2 text-xs font-medium">
                <User className="w-3.5 h-3.5" />
                <span>{t('deceased')}</span>
              </div>
              <div className="font-serif font-bold text-sm text-ink">{deceasedName}</div>
              {totalAreaDecimal !== undefined && (
                <div className="text-[11px] text-ink-3 mt-0.5">
                  {t('area')}: {formatDecimal(totalAreaDecimal, lang)} {t('decimalUnit')}
                </div>
              )}
            </div>
          </div>

          {/* SVG Connector Lines */}
          {heirCount > 0 && (
            <svg
              width={totalWidth}
              height={svgHeight}
              className="pointer-events-none -my-1"
              aria-hidden="true"
            >
              {/* Vertical trunk from parent */}
              <line
                x1={parentX}
                y1={parentY}
                x2={parentX}
                y2={parentY + 20}
                stroke="var(--line)"
                strokeWidth="2"
              />
              {/* Horizontal crossbar */}
              {heirCount > 1 && (
                <line
                  x1={16 + cardWidth / 2}
                  y1={parentY + 20}
                  x2={totalWidth - 16 - cardWidth / 2}
                  y2={parentY + 20}
                  stroke="var(--line)"
                  strokeWidth="2"
                />
              )}
              {/* Vertical drop lines to each heir */}
              {heirs.map((_, index) => {
                const childX = 16 + index * (cardWidth + cardGap) + cardWidth / 2;
                return (
                  <g key={index}>
                    <line
                      x1={childX}
                      y1={parentY + 20}
                      x2={childX}
                      y2={svgHeight}
                      stroke="var(--line)"
                      strokeWidth="2"
                    />
                    <circle cx={childX} cy={svgHeight} r="3" fill="var(--sepia)" />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Heirs Row */}
          <div className="flex items-start gap-4 px-4 z-10">
            {heirs.map((heir) => {
              const isHighlighted = heir.isOverSelling || heir.personId === highlightPersonId;
              const displayShare = lang === 'bn' ? toBanglaDigits(heir.share) : heir.share;

              return (
                <div
                  key={heir.personId}
                  style={{ width: `${cardWidth}px` }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isHighlighted
                      ? 'bg-bad-wash border-bad text-bad shadow-sm ring-1 ring-bad/30'
                      : 'bg-paper border-line text-ink'
                  }`}
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                      isHighlighted ? 'bg-bad/10 text-bad' : 'bg-paper-3 text-ink-2'
                    }`}
                  >
                    {getRelationLabel(heir.relation)}
                  </span>
                  <div className="font-serif font-bold text-xs truncate" title={heir.name}>
                    {heir.name}
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    {displayShare} {t('ownershipShare')}
                  </div>
                  {heir.areaDecimal !== undefined && (
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {formatDecimal(heir.areaDecimal, lang)} {t('decimalUnit')}
                    </div>
                  )}
                  {isHighlighted && (
                    <div className="text-[10px] font-bold text-bad mt-1 px-1 py-0.5 bg-bad/10 rounded">
                      {t('excessSold')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
