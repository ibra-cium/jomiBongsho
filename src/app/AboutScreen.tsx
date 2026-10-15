import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, CheckCircle2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Watermark, Button, Badge } from '@/ui';
import { useInstallPrompt } from '@/lib/pwa';

export const AboutScreen: React.FC = () => {
  const { t } = useT();
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  return (
    <div className="min-h-screen bg-paper p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </Link>
          <Watermark />
        </div>

        <div className="bg-paper-2 border border-line rounded-2xl p-6 sm:p-8 shadow-paper space-y-6">
          <div className="flex items-start gap-4">
            <img
              src="/logo.svg"
              alt={t('appName')}
              className="w-16 h-16 rounded-xl border border-line shadow-sm"
            />
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink">{t('appName')}</h1>
              <p className="text-sm font-medium text-accent">{t('appTagline')}</p>
            </div>
          </div>

          <p className="text-xs text-ink-2 leading-relaxed">
            জমি বংশ — ল্যান্ডটেক ২০২৬ (DIU) হ্যাকাথনের জন্য নির্মিত একটি মানচিত্র-ভিত্তিক
            প্রোটোটাইপ। এটি কোনো সরকারি রেকর্ড নয়, সম্পূর্ণভাবে পরীক্ষামূলক সিন্থেটিক ডেটা দিয়ে
            চালিত।
          </p>

          {/* PWA Install Action */}
          <div className="p-4 bg-paper rounded-xl border border-line space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{t('install')}</span>
              {isInstalled && (
                <Badge variant="ok" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  সংযুক্ত
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

          <div className="border-t border-line pt-4 text-xs text-ink-3 space-y-1">
            <div>ওপেন সোর্স লাইসেন্স: MIT</div>
            <div>ম্যাপ ডেটা: OpenFreeMap © OpenMapTiles · OpenStreetMap contributors</div>
          </div>
        </div>
      </div>
    </div>
  );
};
