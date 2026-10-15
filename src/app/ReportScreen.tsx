import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Watermark, Button } from '@/ui';

export const ReportScreen: React.FC = () => {
  const { dagId } = useParams<{ dagId?: string }>();
  const { t } = useT();

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </Link>
          <Watermark />
        </div>

        <div className="bg-paper-2 border border-line rounded-2xl p-6 sm:p-8 shadow-paper space-y-4">
          <h1 className="font-serif text-2xl font-bold text-ink">
            ক্রেতার জমি যাচাই রিপোর্ট (দাগ #{dagId ?? '104'})
          </h1>
          <p className="text-sm text-ink-2">
            ফেজ ৩-এ এই রিপোর্টটিতে কিউআর কোডসহ সম্পূর্ণ খতিয়ান বিশ্লেষণ ও যাচাইকৃত তথ্য সংযুক্ত
            হবে।
          </p>
          <div className="pt-4 flex gap-3">
            <Button variant="primary">{t('actionShare')}</Button>
            <Button variant="secondary" onClick={() => window.print()}>
              প্রিন্ট করুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
