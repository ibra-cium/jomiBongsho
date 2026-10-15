import React from 'react';
import { useT } from '@/i18n/useT';

export interface WatermarkProps {
  className?: string;
}

export const Watermark: React.FC<WatermarkProps> = ({ className = '' }) => {
  const { t } = useT();

  return (
    <div
      aria-label={t('watermark')}
      className={`inline-flex items-center px-3 py-1 bg-paper-2/95 backdrop-blur-xs border border-line rounded-full text-xs font-medium text-ink-2 shadow-sm select-none pointer-events-none ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-warn mr-1.5" aria-hidden="true" />
      <span>{t('watermark')}</span>
    </div>
  );
};
