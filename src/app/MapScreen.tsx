import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search,
  Globe,
  Menu,
  X,
  Download,
  Share2,
  Info,
  CheckCircle,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import { Watermark, Slider, Sheet, Badge, VerdictStamp, Segmented, Button } from '@/ui';
import { formatDecimal } from '@/lib/format';
import { useInstallPrompt } from '@/lib/pwa';

export const MapScreen: React.FC = () => {
  const { dagId } = useParams<{ dagId?: string }>();
  const { t, lang } = useT();
  const { sheetSnap, setSheetSnap, sheetOpacity, setSheetOpacity, setLang } = useAppStore();
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  const [activeTab, setActiveTab] = React.useState('summary');
  const [menuOpen, setMenuOpen] = React.useState(false);

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
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 bg-paper-2 border border-line rounded-xl text-ink shadow-paper flex items-center justify-center hover:bg-paper-3 transition-colors cursor-pointer"
            aria-label={t('menu')}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper text-ink-2 hover:border-ink/20 cursor-pointer text-sm">
            <Search className="w-4 h-4 text-ink-3" />
            <span className="font-sans text-xs sm:text-sm">{t('searchPlaceholder')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick install button if available */}
          {canInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper text-accent flex items-center gap-1.5 text-xs font-semibold hover:bg-paper-3 transition-colors cursor-pointer"
              aria-label={t('install')}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('install')}</span>
            </button>
          )}

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

      {/* Slide-out / Popover Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/20 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-50 w-80 max-w-[85vw] h-full bg-paper border-r border-line shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt={t('appName')}
                  className="w-10 h-10 rounded-lg border border-line"
                />
                <div>
                  <div className="font-serif font-bold text-lg text-ink">{t('appName')}</div>
                  <div className="text-[10px] text-ink-2 font-medium">{t('appTagline')}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-1.5 text-ink-3 hover:text-ink rounded-lg"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Install Prompt in Menu */}
            {canInstall && (
              <div className="p-3 bg-paper-2 border border-line rounded-xl space-y-2">
                <div className="text-xs font-semibold text-ink">
                  {t('appName')} {t('install')}
                </div>
                <Button size="sm" variant="primary" onClick={promptInstall} fullWidth>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {t('install')}
                </Button>
              </div>
            )}

            {isIOS && (
              <div className="p-3 bg-paper-2 border border-line rounded-xl text-xs text-ink-2 space-y-1">
                <div className="font-semibold text-ink flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-accent" />
                  <span>{t('install')}</span>
                </div>
                <p>{t('iosInstallHint')}</p>
              </div>
            )}

            {isInstalled && (
              <div className="flex items-center gap-2 px-3 py-2 bg-paper-2 border border-line rounded-xl text-xs text-ink-2">
                <CheckCircle className="w-4 h-4 text-ok" />
                <span>অ্যাপটি ইনস্টল করা হয়েছে</span>
              </div>
            )}

            {/* Navigation links */}
            <nav className="flex-1 space-y-1">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                <Globe className="w-4 h-4 text-ink-2" />
                <span>{t('home')}</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                <Info className="w-4 h-4 text-ink-2" />
                <span>{t('about')}</span>
              </Link>

              <Link
                to="/verify"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-ink-2" />
                <span>{t('verify')}</span>
              </Link>

              <Link
                to="/present"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-ink-2" />
                <span>{t('present')}</span>
              </Link>

              <Link
                to="/dev/ui"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                <Sliders className="w-4 h-4 text-ink-2" />
                <span>{t('devUi')}</span>
              </Link>
            </nav>

            {/* Watermark in Menu */}
            <div className="pt-4 border-t border-line text-center">
              <Watermark />
            </div>
          </div>
        </div>
      )}

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
