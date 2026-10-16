import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Button, Watermark } from '@/ui';

export const NotFoundScreen: React.FC = () => {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToMap')}</span>
          </Link>
          <Watermark />
        </div>

        <div className="bg-paper-2 border border-line rounded-2xl p-6 sm:p-8 shadow-paper text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent mx-auto flex items-center justify-center">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-ink">{t('pageNotFound')}</h1>
            <p className="text-sm text-ink-2 leading-relaxed">{t('pageNotFoundDesc')}</p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link to="/">
              <Button variant="primary">
                <Home className="w-4 h-4 mr-1.5" />
                {t('backToMap')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
