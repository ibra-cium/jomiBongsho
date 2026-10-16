import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle2,
  ShieldAlert,
  Database,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Watermark, Button, Badge } from '@/ui';
import { useInstallPrompt } from '@/lib/pwa';

export const AboutScreen: React.FC = () => {
  const { t } = useT();
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink transition-colors cursor-pointer"
            aria-label={t('backToMap')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToMap')}</span>
          </Link>
          <Watermark />
        </div>

        {/* Hero Card */}
        <div className="bg-paper-2 border border-line rounded-2xl p-6 sm:p-8 shadow-paper space-y-6">
          <div className="flex items-start gap-4">
            <img
              src="/logo.svg"
              alt={t('appName')}
              className="w-16 h-16 rounded-xl border border-line shadow-xs shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                  {t('appName')}
                </h1>
                <Badge variant="neutral" size="sm">
                  {t('aboutVersion')}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-accent">{t('aboutSubtitle')}</p>
            </div>
          </div>

          {/* 1. What this is */}
          <section className="space-y-2 border-t border-line/60 pt-4">
            <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{t('aboutWhatIsTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{t('aboutWhatIsDesc')}</p>
          </section>

          {/* 2. Demo data disclaimer */}
          <section className="p-4 bg-warn-wash/60 border border-warn/30 rounded-xl space-y-2">
            <h2 className="font-serif text-sm font-bold text-ink flex items-center gap-2 text-warn">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('aboutDisclaimerTitle')}</span>
            </h2>
            <p className="text-xs text-ink-2 leading-relaxed">{t('aboutDisclaimerDesc')}</p>
          </section>

          {/* 3. Data sources */}
          <section className="space-y-3 border-t border-line/60 pt-4">
            <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
              <Database className="w-4 h-4 text-ink-2" />
              <span>{t('aboutSourcesTitle')}</span>
            </h2>
            <ul className="text-xs sm:text-sm text-ink-2 space-y-2 list-disc list-inside">
              <li>{t('aboutSourcesMouza')}</li>
              <li>{t('aboutSourcesMap')}</li>
              <li>{t('aboutSourcesFees')}</li>
            </ul>
          </section>

          {/* 4. AI disclosure */}
          <section className="space-y-2 border-t border-line/60 pt-4">
            <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" />
              <span>{t('aboutAiTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{t('aboutAiDesc')}</p>
          </section>

          {/* 5. Open-source credits */}
          <section className="space-y-2 border-t border-line/60 pt-4">
            <h2 className="font-serif text-base font-bold text-ink flex items-center gap-2">
              <Layers className="w-4 h-4 text-ink-2" />
              <span>{t('aboutCreditsTitle')}</span>
            </h2>
            <p className="text-xs text-ink-2 leading-relaxed">{t('aboutCreditsDesc')}</p>
          </section>

          {/* 6. PWA Install action */}
          <div className="p-4 bg-paper rounded-xl border border-line space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{t('install')}</span>
              {isInstalled && (
                <Badge variant="ok" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t('installedApp')}
                </Badge>
              )}
            </div>

            {canInstall && (
              <Button size="sm" variant="primary" onClick={promptInstall} fullWidth>
                <Download className="w-4 h-4 mr-2" />
                {t('install')}
              </Button>
            )}

            {isIOS && (
              <div className="flex items-start gap-2 text-xs text-ink-2 bg-paper-2 p-3 rounded-lg border border-line">
                <Share2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{t('iosInstallHint')}</span>
              </div>
            )}

            {!canInstall && !isIOS && !isInstalled && (
              <p className="text-xs text-ink-3">
                ব্রাউজার মেনু থেকে &quot;Install App&quot; বা &quot;Add to Home Screen&quot;
                নির্বাচন করে অ্যাপটি ইনস্টল করতে পারেন।
              </p>
            )}
          </div>

          <div className="border-t border-line pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-ink-3">
            <div>ওপেন সোর্স লাইসেন্স: MIT License</div>
            <div>LandTech 2026 (DIU) · Track: Digital Land Records</div>
          </div>
        </div>
      </div>
    </div>
  );
};
