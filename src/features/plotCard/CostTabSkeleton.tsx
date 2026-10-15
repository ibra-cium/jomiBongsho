import React from 'react';
import { Coins } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Skeleton } from '@/ui/Skeleton';

export const CostTabSkeleton: React.FC = () => {
  const { t } = useT();

  return (
    <div className="space-y-4 p-4 bg-paper rounded-2xl border border-line shadow-xs">
      <div className="flex items-center gap-2 text-ink">
        <Coins className="w-5 h-5 text-accent" />
        <span className="font-serif font-bold text-sm sm:text-base">{t('costComingSoon')}</span>
      </div>

      <p className="text-xs text-ink-2 leading-relaxed">{t('costComingSoonDesc')}</p>

      {/* Shimmer skeleton ledger lines */}
      <div className="space-y-3 pt-2">
        <div className="p-3 bg-paper-2 rounded-xl border border-line space-y-2">
          <Skeleton className="w-36 h-4 rounded" />
          <Skeleton className="w-full h-10 rounded-lg" />
        </div>

        <div className="space-y-2 border-t border-line/60 pt-3">
          <div className="flex justify-between items-center">
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="w-32 h-4 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-line/40">
            <Skeleton className="w-36 h-6 rounded" />
            <Skeleton className="w-28 h-6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
