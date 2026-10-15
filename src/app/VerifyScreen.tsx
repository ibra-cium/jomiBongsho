import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Watermark, Button } from '@/ui';

export const VerifyScreen: React.FC = () => {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
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

        <div className="bg-paper-2 border border-line rounded-2xl p-6 sm:p-8 shadow-paper text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">{t('verify')}</h1>
          <p className="text-sm text-ink-2">
            কিউআর কোড স্ক্যান করে ভূমির রিপোর্টের ডিজিটাল স্বাক্ষর ও হ্যাশ চেইন যাচাই করুন। (ফেজ ৩)
          </p>
          <div className="pt-2">
            <Button variant="secondary">{t('confirm')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
