import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Skeleton } from '@/ui/Skeleton';

export const PriceTabSkeleton: React.FC = () => {
  const { t } = useT();

  return (
    <div className="space-y-4 p-4 bg-paper rounded-2xl border border-line shadow-xs">
      <div className="flex items-center gap-2 text-ink">
        <TrendingUp className="w-5 h-5 text-accent" />
        <span className="font-serif font-bold text-sm sm:text-base">{t('priceComingSoon')}</span>
      </div>

      <p className="text-xs text-ink-2 leading-relaxed">{t('priceComingSoonDesc')}</p>

      {/* Shimmer skeleton placeholders */}
      <div className="space-y-3 pt-2">
        <div className="p-3 bg-paper-2 rounded-xl border border-line space-y-2">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-48 h-8 rounded-lg" />
          <Skeleton className="w-full h-3 rounded" />
        </div>

        <div className="space-y-2">
          <Skeleton className="w-32 h-4 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <Skeleton className="w-40 h-4 rounded" />
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
