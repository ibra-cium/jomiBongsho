import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom';
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
  ShieldAlert,
  RotateCw,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import { useDataStore } from '@/data/useDataStore';
import { Watermark, Sheet, Badge, VerdictStamp, Segmented, Button, Skeleton } from '@/ui';
import { formatDecimal, toBanglaDigits } from '@/lib/format';
import { useInstallPrompt } from '@/lib/pwa';
import { MapView } from '@/map/MapView';
import { SheetOpacitySlider } from '@/features/map/SheetOpacitySlider';
import { analyseDag } from '@/engine';

export const MapScreen: React.FC = () => {
  const { dagId: routeDagId } = useParams<{ dagId?: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();

  const {
    sheetSnap,
    setSheetSnap,
    sheetOpacity,
    setLang,
    selectedDagId,
    setSelectedDagId,
    showRiskColors,
    setShowRiskColors,
  } = useAppStore();

  const { data, isLoading, error, loadData } = useDataStore();
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  const [activeTab, setActiveTab] = React.useState('summary');
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Load data on initial mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize route with store
  useEffect(() => {
    if (routeDagId && routeDagId !== selectedDagId) {
      setSelectedDagId(routeDagId);
      setSheetSnap('half');
    }
  }, [routeDagId, selectedDagId, setSelectedDagId, setSheetSnap]);

  const handleSelectDag = useCallback(
    (id: string | null) => {
      setSelectedDagId(id);
      if (id) {
        setSheetSnap('half');
        navigate(`/dag/${id}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
    [setSelectedDagId, setSheetSnap, navigate],
  );

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const tabs = [
    { value: 'summary', label: t('tabSummary') },
    { value: 'history', label: t('tabHistory') },
    { value: 'price', label: t('tabPrice') },
    { value: 'cost', label: t('tabCost') },
  ];

  // Selected dag metadata and analysis
  const activeDagId = selectedDagId ?? (data?.dags.features[0]?.properties.id || '101');
  const activeFeature = data?.dags.features.find(
    (f) => String(f.properties.id || f.id) === activeDagId,
  );
  const activeAnalysis = data ? analyseDag(activeDagId, data) : null;

  const displayDagNo = lang === 'bn' ? toBanglaDigits(activeDagId) : activeDagId;
  const displayArea = activeFeature
    ? formatDecimal(activeFeature.properties.recordedAreaDecimal, lang)
    : '0';

  const verdictVariant =
    activeAnalysis?.verdict === 'red'
      ? 'bad'
      : activeAnalysis?.verdict === 'yellow'
        ? 'warn'
        : 'ok';

  const verdictLabel =
    activeAnalysis?.verdict === 'red'
      ? t('verdictBad')
      : activeAnalysis?.verdict === 'yellow'
        ? t('verdictWarn')
        : t('verdictOk');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-paper flex flex-col lg:flex-row">
      {/* Top bar overlaid on map */}
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
          {/* Risk colors toggle */}
          <button
            type="button"
            onClick={() => setShowRiskColors(!showRiskColors)}
            className={`px-3 py-2 border rounded-full shadow-paper flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              showRiskColors
                ? 'bg-accent text-white border-accent'
                : 'bg-paper-2 text-ink border-line hover:bg-paper-3'
            }`}
            aria-label={t('riskColors')}
            title={t('riskColors')}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('riskColors')}</span>
          </button>

          {/* Quick install button if available */}
          {canInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper text-accent flex items-center gap-1.5 text-xs font-semibold hover:bg-paper-3 transition-colors cursor-pointer"
              aria-label={t('install')}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('install')}</span>
            </button>
          )}

          {/* Language toggle */}
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
          <div
            className="fixed inset-0 bg-ink/20 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

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

            <div className="pt-4 border-t border-line text-center">
              <Watermark />
            </div>
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center bg-paper-3/40">
        {/* Persistent Demo Watermark */}
        <div className="absolute top-16 left-3 z-20 pointer-events-none">
          <Watermark />
        </div>

        {/* Loading state */}
        {isLoading && !data && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center z-10">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded" />
            <div className="text-xs text-ink-2 font-medium animate-pulse">{t('loadingData')}</div>
          </div>
        )}

        {/* Error state */}
        {error && !data && (
          <div className="p-6 max-w-sm bg-paper-2 border border-alert/30 rounded-2xl shadow-paper text-center space-y-3 z-10">
            <ShieldAlert className="w-8 h-8 text-alert mx-auto" />
            <div className="font-serif font-bold text-ink text-base">{t('dataLoadError')}</div>
            <p className="text-xs text-ink-2">{error}</p>
            <Button size="sm" variant="primary" onClick={loadData}>
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              {t('retry')}
            </Button>
          </div>
        )}

        {/* Loaded Map */}
        {data && (
          <MapView
            data={data}
            selectedDagId={selectedDagId}
            onSelectDag={handleSelectDag}
            lang={lang}
            showRiskColors={showRiskColors}
            sheetOpacity={sheetOpacity}
            className="w-full h-full"
          />
        )}

        {/* Floating Sheet Opacity Slider */}
        <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <SheetOpacitySlider />
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
                  {t('dag')} {displayDagNo}
                </span>
                <Badge variant={verdictVariant} size="sm">
                  {verdictLabel}
                </Badge>
              </div>
              <div className="text-xs text-ink-2">
                {t('area')}: {displayArea} {t('decimalUnit')}
              </div>
            </div>
            <VerdictStamp
              verdict={verdictVariant}
              issueCount={activeAnalysis?.issues.length ?? 0}
              className="scale-75 origin-right"
            />
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <Segmented options={tabs} value={activeTab} onChange={setActiveTab} className="w-full" />

          <div className="p-4 bg-paper rounded-xl border border-line space-y-2">
            <div className="text-sm font-semibold text-ink">{t('tabSummary')}</div>
            <p className="text-xs text-ink-2 leading-relaxed">
              দাগ নম্বর {displayDagNo}-এর খতিয়ান এবং ওয়ারিশ ইতিহাস যাচাই করা হয়েছে।
              {activeAnalysis && activeAnalysis.issues.length > 0
                ? ` ${lang === 'bn' ? toBanglaDigits(activeAnalysis.issues.length) : activeAnalysis.issues.length}টি ঝুঁকি বা সতর্কতামূলক বিষয় পাওয়া গেছে।`
                : ' কোনো দৃশ্যমান ঝুঁকি পাওয়া যায়নি।'}
            </p>
            <div className="pt-2">
              <Button size="sm" variant="secondary" fullWidth>
                {t('details')}
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Outlet />
    </div>
  );
};
