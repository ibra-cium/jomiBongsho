import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Globe, Menu } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import { Watermark, Slider, Sheet, Badge, VerdictStamp, Segmented, Button } from '@/ui';
import { formatDecimal } from '@/lib/format';

export const MapScreen: React.FC = () => {
  const { dagId } = useParams<{ dagId?: string }>();
  const { t, lang } = useT();
  const { sheetSnap, setSheetSnap, sheetOpacity, setSheetOpacity, setLang } = useAppStore();

  const [activeTab, setActiveTab] = React.useState('summary');

  const currentDag = dagId ?? '104';

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const tabs = [
    { value: 'summary', label: t('tabSummary') },
    { value: 'history', label: t('tabHistory') },
    { value: 'price', label: t('tabPrice') },
    { value: 'cost', label: t('tabCost') },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-paper flex flex-col lg:flex-row">
      {/* Top bar on phone, overlaid on map */}
      <header className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            to="/about"
            className="p-2.5 bg-paper-2 border border-line rounded-xl text-ink shadow-paper flex items-center justify-center hover:bg-paper-3 transition-colors"
            aria-label={t('menu')}
          >
            <Menu className="w-5 h-5" />
          </Link>

          {/* Search pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper text-ink-2 hover:border-ink/20 cursor-pointer text-sm">
            <Search className="w-4 h-4 text-ink-3" />
            <span className="font-sans text-xs sm:text-sm">{t('searchPlaceholder')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper text-ink flex items-center gap-1.5 text-xs font-semibold hover:bg-paper-3 transition-colors cursor-pointer"
            aria-label={t('language')}
          >
            <Globe className="w-3.5 h-3.5 text-ink-3" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </header>

      {/* Main Map Canvas Area */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center bg-paper-3/40">
        <div className="absolute top-16 left-4 z-10">
          <Watermark />
        </div>

        {/* Placeholder Map Grid Graphics */}
        <div className="text-center p-6 space-y-3">
          <div className="font-serif text-2xl font-bold text-ink">{t('appName')}</div>
          <p className="text-sm text-ink-2 max-w-xs mx-auto">{t('appTagline')}</p>
          <div className="inline-block px-3 py-1 bg-paper-2 border border-dashed border-sepia rounded-lg text-xs font-mono text-sepia">
            দাগ নং: {currentDag} (MOUZA MAP PLACEHOLDER)
          </div>
          <div className="pt-2">
            <Link to="/dev/ui" className="text-xs text-accent underline hover:opacity-80">
              {t('devUi')} ➔
            </Link>
          </div>
        </div>

        {/* Floating Sheet Opacity Slider */}
        <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <Slider
            value={sheetOpacity}
            onChange={setSheetOpacity}
            leftLabel={t('oldMap')}
            rightLabel={t('digitalMap')}
            aria-label="Mouza sheet opacity"
          />
        </div>
      </main>

      {/* Sheet Primitive (Phone Bottom Sheet / Desktop Left Panel) */}
      <Sheet
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
        peekContent={
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold text-ink">
                  {t('dag')} {currentDag}
                </span>
                <Badge variant="warn" size="sm">
                  {t('verdictWarn')}
                </Badge>
              </div>
              <div className="text-xs text-ink-2">
                {t('area')}: {formatDecimal(10.5, lang)} {t('decimalUnit')}
              </div>
            </div>
            <VerdictStamp verdict="warn" issueCount={1} className="scale-75 origin-right" />
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <Segmented options={tabs} value={activeTab} onChange={setActiveTab} className="w-full" />

          <div className="p-4 bg-paper rounded-xl border border-line space-y-2">
            <div className="text-sm font-semibold text-ink">{t('tabSummary')}</div>
            <p className="text-xs text-ink-2 leading-relaxed">
              দাগ নম্বর {currentDag}-এর খতিয়ান এবং ওয়ারিশ ইতিহাস যাচাই করা হয়েছে। ডেমো ফেজ ০১-এ
              বিশদ হিসাব প্রদর্শিত হবে।
            </p>
            <div className="pt-2">
              <Button size="sm" variant="secondary" fullWidth>
                {t('details')}
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
};
