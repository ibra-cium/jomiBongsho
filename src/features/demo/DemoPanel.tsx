import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Navigation,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import { useDataStore } from '@/data/useDataStore';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { toBanglaDigits } from '@/lib/format';
import type { Scenario } from '@/engine/types';

interface DemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDag: (dagId: string) => void;
}

export const DemoPanel: React.FC<DemoPanelProps> = ({ isOpen, onClose, onSelectDag }) => {
  const { t, lang } = useT();
  const { demo, setDemoFlags, setSheetOpacity, setShowRiskColors, setGpsLocation } = useAppStore();
  const data = useDataStore((state) => state.data);
  const scenarios: Scenario[] = data?.scenarios ?? [];

  const [simDagId, setSimDagId] = useState<string>(demo.simulatedDagId ?? '105');

  if (!isOpen) return null;

  const handleStartSimulation = (targetDag: string) => {
    setDemoFlags({
      simulatedLocation: true,
      simulatedDagId: targetDag,
      simulatedCoords: null, // useGeolocation will calculate centroid
    });
  };

  const handleStopSimulation = () => {
    setDemoFlags({
      simulatedLocation: false,
      simulatedDagId: null,
      simulatedCoords: null,
    });
    setGpsLocation({
      state: 'idle',
      coords: null,
      accuracy: null,
      dagId: null,
    });
  };

  const handleResetDemo = () => {
    handleStopSimulation();
    setShowRiskColors(false);
    setSheetOpacity(0.85);
    onSelectDag('101');
    onClose();
  };

  const handleSelectScenario = (dagId: string) => {
    onSelectDag(dagId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('demo')}
    >
      <div
        className="relative w-full max-w-2xl bg-paper border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base text-ink">
                  {lang === 'bn' ? 'ডেমো কন্ট্রোল প্যানেল' : 'Demo Control Panel'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-warn-wash text-warn border border-warn/30">
                  {t('demoNotice')}
                </span>
              </div>
              <p className="text-xs text-ink-2">
                {lang === 'bn'
                  ? 'হ্যাকাথন উপস্থাপনা ও বিশেষ কেস সরাসরি পরীক্ষা করার টুল'
                  : 'Tools to showcase hackathon scenarios and test GPS simulations'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-3 hover:text-ink rounded-lg cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Simulated Location */}
          <div className="p-4 bg-paper-2 border border-line rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-accent" />
                <h3 className="font-serif font-semibold text-sm text-ink">
                  {lang === 'bn' ? 'অবস্থান (GPS) অনুকরণ' : 'Simulate GPS Location'}
                </h3>
              </div>
              {demo.simulatedLocation && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-ok-wash text-ok border border-ok/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
                  {lang === 'bn' ? 'অনুকরণ সক্রিয়' : 'Simulation Active'}
                </span>
              )}
            </div>

            <p className="text-xs text-ink-2 leading-relaxed">
              {lang === 'bn'
                ? 'ল্যাপটপে বা প্রদর্শনীতে নির্দিষ্ট কোনো দাগে উপস্থিত থাকার অনুভূতি তৈরির জন্য অবস্থান অনুকরণ করুন। বিশেষ করে বিক্রেতার ভুল দাগ দেখানো পরীক্ষা করতে ১০৫ দাগে অবস্থান অনুকরণ করে ১০১ দাগ পরীক্ষা করুন।'
                : 'Simulate standing on a specific plot to demonstrate field checks and plot mismatch warnings.'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <label htmlFor="sim-dag-select" className="text-xs font-semibold text-ink shrink-0">
                  {lang === 'bn' ? 'দাগ নির্বাচন:' : 'Select Dag:'}
                </label>
                <select
                  id="sim-dag-select"
                  value={simDagId}
                  onChange={(e) => setSimDagId(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-paper border border-line rounded-lg text-xs font-medium text-ink outline-hidden focus:border-accent"
                >
                  <option value="105">
                    দাগ ১০৫ (অল্প সময়ে বারবার হাতবদল - মিসম্যাচ পরীক্ষার জন্য প্রস্তাবিত)
                  </option>
                  <option value="101">দাগ ১০১ (ঝুঁকিহীন পরিষ্কার জমি)</option>
                  <option value="102">দাগ ১০২ (একই জমি দুইবার বিক্রি)</option>
                  <option value="103">দাগ ১০৩ (ফারুক ওয়ারিশ ওভার-সেল)</option>
                  <option value="107">দাগ ১০৭ (মালিকানার শিকলহীন)</option>
                  <option value="108">দাগ ১০৮ (সরকারি খাস জমি)</option>
                  <option value="112">দাগ ১১২ (বকেয়া খাজনা)</option>
                  {data?.dags.features.slice(12, 24).map((f) => (
                    <option key={f.properties.id} value={f.properties.id}>
                      দাগ {lang === 'bn' ? toBanglaDigits(f.properties.id) : f.properties.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Navigation className="w-3.5 h-3.5" />}
                  onClick={() => handleStartSimulation(simDagId)}
                >
                  {lang === 'bn' ? 'অনুকরণ করুন' : 'Simulate'}
                </Button>
                {demo.simulatedLocation && (
                  <Button size="sm" variant="secondary" onClick={handleStopSimulation}>
                    {lang === 'bn' ? 'বন্ধ করুন' : 'Stop'}
                  </Button>
                )}
              </div>
            </div>

            {demo.simulatedLocation && (
              <div className="p-2.5 bg-paper rounded-lg border border-line text-xs flex items-center justify-between text-ink-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-ok" />
                  <span>
                    {lang === 'bn'
                      ? `আপনি বর্তমানে দাগ ${toBanglaDigits(demo.simulatedDagId ?? '')}-এ আছেন হিসেবে অনুকরণ করা হচ্ছে`
                      : `Currently simulated standing on Dag ${demo.simulatedDagId}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Scenarios list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-semibold text-sm text-ink">
                {lang === 'bn' ? '১২টি বিশেষ জমি সিনারিও' : '12 Special Demo Scenarios'}
              </h3>
              <span className="text-xs text-ink-3">
                {lang === 'bn' ? 'সরাসরি দাগে যেতে ট্যাপ করুন' : 'Tap to navigate to plot'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenarios.map((sc) => {
                const isSelected = sc.dagId === simDagId;
                const badgeVariant =
                  sc.expected === 'red' ? 'bad' : sc.expected === 'yellow' ? 'warn' : 'ok';
                const verdictIcon =
                  sc.expected === 'red' ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : sc.expected === 'yellow' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  );

                return (
                  <div
                    key={sc.dagId}
                    onClick={() => handleSelectScenario(sc.dagId)}
                    className={`p-3 bg-paper-2 border rounded-xl hover:border-accent/40 hover:bg-paper-3 transition-colors cursor-pointer space-y-2 flex flex-col justify-between ${
                      isSelected ? 'border-accent shadow-xs ring-1 ring-accent/30' : 'border-line'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-ink">
                          {t('dag')} {lang === 'bn' ? toBanglaDigits(sc.dagId) : sc.dagId}
                        </span>
                        <Badge variant={badgeVariant} size="sm">
                          <span className="mr-1">{verdictIcon}</span>
                          {sc.expected === 'red'
                            ? t('verdictBad')
                            : sc.expected === 'yellow'
                              ? t('verdictWarn')
                              : t('verdictOk')}
                        </Badge>
                      </div>
                      <div className="font-semibold text-xs text-ink">
                        {lang === 'bn' ? sc.titleBn : sc.titleEn}
                      </div>
                      <p className="text-[11px] text-ink-2 line-clamp-2 leading-relaxed">
                        {lang === 'bn' ? sc.storyBn : sc.storyEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px] text-accent font-medium">
                      <span>{lang === 'bn' ? 'রেকর্ড ও খতিয়ান দেখুন' : 'View records'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-line bg-paper-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDemo}
          >
            {lang === 'bn' ? 'রিসেট' : 'Reset'}
          </Button>

          <Button size="sm" variant="primary" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
