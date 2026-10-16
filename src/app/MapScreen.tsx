import React, { useEffect, useCallback, useState } from 'react';
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
  MousePointerClick,
  MapPinOff,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import { useDataStore } from '@/data/useDataStore';
import { Watermark, Sheet, Badge, Button, Skeleton, useToast } from '@/ui';
import { toBanglaDigits } from '@/lib/format';
import { storage } from '@/lib/storage';
import { useInstallPrompt } from '@/lib/pwa';
import { MapView } from '@/map/MapView';
import { useGeolocation } from '@/map/useGeolocation';
import { GPSFab } from '@/map/GPSFab';
import { SheetOpacitySlider } from '@/features/map/SheetOpacitySlider';
import { PlotCard, PlotCardPeek } from '@/features/plotCard';
import { SearchModal } from '@/features/search';
import { DemoPanel, PermissionHelpModal } from '@/features/demo';
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

  const [activeTab, setActiveTab] = useState('summary');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [permissionHelpOpen, setPermissionHelpOpen] = useState(false);

  // First-open coach chip state (persists until first plot selection)
  const [hasSeenHint, setHasSeenHint] = useState<boolean>(() => {
    return storage.get<boolean>('jb.hint.firstTapDone', false);
  });

  const { addToast } = useToast();
  const { state: gpsState, dagId: gpsDagId, startLocating } = useGeolocation();

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
        setHasSeenHint(true);
        storage.set('jb.hint.firstTapDone', true);
        setSheetSnap('half');
        navigate(`/dag/${id}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
    [setSelectedDagId, setSheetSnap, navigate],
  );

  const handleDismissHint = () => {
    setHasSeenHint(true);
    storage.set('jb.hint.firstTapDone', true);
  };

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const handleGpsPress = () => {
    if (gpsState === 'idle') {
      startLocating();
    } else if (gpsState === 'found' && gpsDagId) {
      handleSelectDag(gpsDagId);
      addToast(
        t('gpsCurrentLocation', {
          n: lang === 'bn' ? toBanglaDigits(gpsDagId) : gpsDagId,
        }),
      );
    } else if (gpsState === 'outside') {
      addToast(t('locationOutside'));
    } else if (gpsState === 'denied' || gpsState === 'unsupported') {
      setPermissionHelpOpen(true);
    } else {
      startLocating();
    }
  };

  // Selected dag metadata and analysis (safe lookups prevent throwing on invalid IDs)
  const activeDagId = selectedDagId ?? (data?.dags.features[0]?.properties.id || '101');
  const activeFeature = data?.dags.features.find(
    (f) => String(f.properties.id || f.id) === activeDagId,
  );
  const activeAnalysis = data && activeFeature ? analyseDag(activeDagId, data) : null;

  const displayDagNo = lang === 'bn' ? toBanglaDigits(activeDagId) : activeDagId;

  const verdictLabel =
    activeAnalysis?.verdict === 'red'
      ? t('verdictBad')
      : activeAnalysis?.verdict === 'yellow'
        ? t('verdictWarn')
        : t('verdictOk');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-paper flex flex-col lg:flex-row">
      {/* Slide-out / Popover Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-ink/20 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative z-50 w-80 max-w-[85vw] h-full bg-paper border-r border-line shadow-2xl flex flex-col p-6 space-y-5 overflow-y-auto">
            {/* Header */}
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
                className="p-1.5 text-ink-3 hover:text-ink rounded-lg cursor-pointer"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Install PWA Section (when available / iOS hint / installed badge) */}
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
                <span>{t('installedApp')}</span>
              </div>
            )}

            {/* Primary Menu Actions: ডেমো, সম্পর্কে, ভাষা */}
            <nav className="space-y-1">
              {/* 1. ডেমো */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDemoOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{t('demo')}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-warn-wash text-warn border border-warn/30">
                  {t('demoNotice')}
                </span>
              </button>

              {/* 2. সম্পর্কে */}
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                <Info className="w-4 h-4 text-ink-2" />
                <span>{t('about')}</span>
              </Link>

              {/* 3. ভাষা */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-paper-2 transition-colors cursor-pointer text-left"
                aria-label={t('language')}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-ink-2" />
                  <span>{t('language')}</span>
                </div>
                <Badge variant="neutral" size="sm">
                  {lang === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}
                </Badge>
              </button>
            </nav>

            {/* Secondary Navigation & Developer tools */}
            <div className="pt-2 border-t border-line space-y-1">
              <div className="text-[10px] font-semibold text-ink-3 uppercase px-3 pb-1 tracking-wider">
                অতিরিক্ত টুলস
              </div>

              <Link
                to="/verify"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t('verify')}</span>
              </Link>

              <Link
                to="/present"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('present')}</span>
              </Link>

              <Link
                to="/dev/ui"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t('devUi')}</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-line text-center mt-auto">
              <Watermark />
            </div>
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center bg-paper-3/40">
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
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper text-ink-2 hover:border-ink/20 cursor-pointer text-sm"
              aria-label={t('search')}
            >
              <Search className="w-4 h-4 text-ink-3" />
              <span className="font-sans text-xs sm:text-sm">{t('searchPlaceholder')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Protection mode / Risk colors toggle */}
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
              <span className="inline">{t('riskColors')}</span>
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

        {/* First-Open Hint Chip (Disappears permanently upon first plot selection) */}
        {!hasSeenHint && !selectedDagId && data && (
          <div className="absolute bottom-48 sm:bottom-52 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={handleDismissHint}
              className="px-4 py-2 bg-paper-2 border border-accent/40 rounded-full shadow-paper text-ink flex items-center gap-2 text-xs sm:text-sm font-semibold hover:bg-paper-3 transition-colors cursor-pointer animate-bounce"
              aria-label={t('firstOpenHint')}
            >
              <MousePointerClick className="w-4 h-4 text-accent" />
              <span>{t('firstOpenHint')}</span>
            </button>
          </div>
        )}

        {/* GPS FAB */}
        <div className="absolute right-4 bottom-44 sm:bottom-48 z-20 pointer-events-auto">
          <GPSFab state={gpsState} dagId={gpsDagId} onPress={handleGpsPress} />
        </div>

        {/* Floating Sheet Opacity Slider */}
        <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <SheetOpacitySlider />
        </div>
      </main>

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeAnalysis
          ? `${t('dag')} ${displayDagNo}: ${verdictLabel}. ${
              activeAnalysis.issues.length > 0
                ? t('seeIssues', { n: activeAnalysis.issues.length })
                : t('noIssuesFound')
            }`
          : ''}
      </div>

      {/* Sheet Primitive (Phone Bottom Sheet / Desktop Left Panel) */}
      <Sheet
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
        peekContent={
          activeFeature && activeAnalysis ? (
            <PlotCardPeek dag={activeFeature.properties} verdict={activeAnalysis.verdict} />
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg font-bold text-ink">
                {t('dag')} {displayDagNo}
              </span>
              <Badge variant="warn" size="sm">
                {t('plotNotFound', { n: displayDagNo })}
              </Badge>
            </div>
          )
        }
      >
        {activeAnalysis && activeFeature && data ? (
          <PlotCard
            analysis={activeAnalysis}
            events={data.events.filter((e) => e.dagId === activeDagId)}
            people={data.people}
            feeRules={data.feeRules}
            mouza={data.mouza}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-warn-wash border border-warn/30 text-warn mx-auto flex items-center justify-center">
              <MapPinOff className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-bold text-ink">
                {t('plotNotFound', { n: displayDagNo })}
              </h2>
              <p className="text-xs text-ink-2">{t('plotNotFoundDesc')}</p>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="primary" onClick={() => handleSelectDag('101')}>
                {t('goToFirstDag')}
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Search Modal */}
      {data && (
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          features={data.dags.features}
          onSelectDag={handleSelectDag}
        />
      )}

      {/* Demo Panel */}
      <DemoPanel
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onSelectDag={handleSelectDag}
      />

      {/* Permission Help Modal */}
      <PermissionHelpModal
        isOpen={permissionHelpOpen}
        onClose={() => setPermissionHelpOpen(false)}
        onOpenDemo={() => setDemoOpen(true)}
      />

      <Outlet />
    </div>
  );
};
