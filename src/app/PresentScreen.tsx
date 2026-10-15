import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useT } from '@/i18n/useT';

export const PresentScreen: React.FC = () => {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="font-serif text-3xl font-bold text-ink">{t('present')}</h1>
        <p className="text-sm text-ink-2">চূড়ান্ত রাউন্ড পিচের জন্য প্রেজেন্টেশন মোড (ফেজ ৭)।</p>
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-accent underline">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
