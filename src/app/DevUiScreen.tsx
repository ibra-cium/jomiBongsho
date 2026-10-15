import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Laptop, Globe, ArrowLeft, Sparkles, Share2, Trash2, Plus } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';
import {
  Button,
  IconButton,
  Card,
  Badge,
  Chip,
  Segmented,
  Slider,
  Skeleton,
  Watermark,
  VerdictStamp,
  Sheet,
  useToast,
} from '@/ui';
import { formatTaka, formatDecimal, formatNumber, formatDate } from '@/lib/format';

export const DevUiScreen: React.FC = () => {
  const { t, lang } = useT();
  const { theme, setTheme, setLang, sheetSnap, setSheetSnap } = useAppStore();
  const { addToast } = useToast();

  const [sliderValue, setSliderValue] = useState(0.4);
  const [selectedChip, setSelectedChip] = useState('cs');
  const [segmentedTab, setSegmentedTab] = useState('summary');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showDemoSheet, setShowDemoSheet] = useState(false);

  const tabs = [
    { value: 'summary', label: t('tabSummary') },
    { value: 'history', label: t('tabHistory') },
    { value: 'price', label: t('tabPrice') },
    { value: 'cost', label: t('tabCost') },
  ];

  const triggerToast = () => {
    addToast(t('copied'), {
      label: t('refresh'),
      onClick: () => addToast('রিফ্রেশ সম্পন্ন হয়েছে'),
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink p-4 sm:p-8 max-w-5xl mx-auto space-y-10 pb-32">
      {/* Top Header & Dev Controls */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 bg-paper-2 border border-line rounded-lg text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors"
              aria-label={t('back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {t('devUi')} — Khatian & Ink
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-2">
            Design tokens, typography, colors, and interactive UI primitives.
          </p>
        </div>

        {/* Theme and Language Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-3 py-2 bg-paper-2 border border-line rounded-xl text-xs font-semibold hover:bg-paper-3 transition-colors cursor-pointer shadow-paper"
            aria-label={t('language')}
          >
            <Globe className="w-4 h-4 text-accent" />
            <span>{lang === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
          </button>

          {/* Theme Switcher */}
          <div
            role="group"
            aria-label={t('theme')}
            className="flex items-center bg-paper-2 border border-line rounded-xl p-1 shadow-paper"
          >
            <button
              type="button"
              aria-label={t('themeLight')}
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-paper-3 text-ink font-bold shadow-xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={t('themeDark')}
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-paper-3 text-ink font-bold shadow-xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={t('themeSystem')}
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-paper-3 text-ink font-bold shadow-xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Laptop className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. Verdict Stamps (The Peak Moment) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          1. Verdict Stamps (রাবার স্ট্যাম্প)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="md" className="flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs text-ink-3 mb-3">Green (ঝুঁকি পাওয়া যায়নি)</span>
            <VerdictStamp verdict="ok" issueCount={0} />
          </Card>
          <Card padding="md" className="flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs text-ink-3 mb-3">Warn (সতর্কতা)</span>
            <VerdictStamp verdict="warn" issueCount={2} />
          </Card>
          <Card padding="md" className="flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs text-ink-3 mb-3">Bad (ঝুঁকিপূর্ণ)</span>
            <VerdictStamp verdict="bad" issueCount={5} />
          </Card>
        </div>
      </section>

      {/* 2. Badges and Watermark */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          2. Badges & Watermark
        </h2>
        <Card padding="md" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="ok">{t('verdictOk')}</Badge>
            <Badge variant="warn">{t('verdictWarn')}</Badge>
            <Badge variant="bad">{t('verdictBad')}</Badge>
            <Badge variant="neutral">খতিয়ান রেকর্ড</Badge>
          </div>
          <div className="border-t border-ledger-dotted pt-4 flex items-center justify-between">
            <span className="text-xs text-ink-3">Watermark primitive:</span>
            <Watermark />
          </div>
        </Card>
      </section>

      {/* 3. Currency & Number Formatting (Pure Functions) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          3. Numbers & Currency (format.ts)
        </h2>
        <Card padding="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-paper rounded-xl border border-line">
              <div className="text-xs text-ink-3 mb-1">Full Taka</div>
              <div className="font-serif font-bold text-lg text-ink">
                {formatTaka(5200000, lang)}
              </div>
            </div>
            <div className="p-3 bg-paper rounded-xl border border-line">
              <div className="text-xs text-ink-3 mb-1">Short Taka (Lakh)</div>
              <div className="font-serif font-bold text-lg text-ink">
                {formatTaka(5200000, lang, { short: true })}
              </div>
            </div>
            <div className="p-3 bg-paper rounded-xl border border-line">
              <div className="text-xs text-ink-3 mb-1">Short Taka (Crore)</div>
              <div className="font-serif font-bold text-lg text-ink">
                {formatTaka(15000000, lang, { short: true })}
              </div>
            </div>
            <div className="p-3 bg-paper rounded-xl border border-line">
              <div className="text-xs text-ink-3 mb-1">Area Decimal</div>
              <div className="font-serif font-bold text-lg text-ink">
                {formatDecimal(10.5, lang)} {t('decimalUnit')}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-ledger-dotted text-xs text-ink-2 flex justify-between">
            <span>Date: {formatDate('2026-10-01', lang)}</span>
            <span>Formatted: {formatNumber(1234567, lang)}</span>
          </div>
        </Card>
      </section>

      {/* 4. Buttons & Icon Buttons */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          4. Buttons & Icon Buttons
        </h2>
        <Card padding="md" className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">
              {t('confirm')}
            </Button>
            <Button variant="secondary" size="md">
              {t('details')}
            </Button>
            <Button variant="ghost" size="md">
              {t('cancel')}
            </Button>
            <Button variant="danger" size="md">
              বাতিল
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={buttonLoading}
              onClick={() => {
                setButtonLoading(true);
                setTimeout(() => setButtonLoading(false), 1500);
              }}
            >
              {buttonLoading ? t('loading') : 'স্পিনার টেস্ট'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-ledger-dotted">
            <IconButton aria-label="Add" icon={<Plus className="w-5 h-5" />} variant="primary" />
            <IconButton
              aria-label="Share"
              icon={<Share2 className="w-5 h-5" />}
              variant="secondary"
            />
            <IconButton aria-label="Delete" icon={<Trash2 className="w-5 h-5" />} variant="ghost" />
            <Button variant="secondary" size="sm">
              ছোট (sm)
            </Button>
            <Button variant="secondary" size="md">
              মাঝারি (md)
            </Button>
            <Button variant="secondary" size="lg">
              বড় (lg)
            </Button>
          </div>
        </Card>
      </section>

      {/* 5. Chips & Segmented Controls */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          5. Chips & Segmented Controls
        </h2>
        <Card padding="md" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {['CS (১৯৪০)', 'SA (১৯৬২)', 'RS (১৯৮৮)', 'BS (২০১০)'].map((surv, idx) => {
              const id = ['cs', 'sa', 'rs', 'bs'][idx]!;
              return (
                <Chip key={id} selected={selectedChip === id} onClick={() => setSelectedChip(id)}>
                  {surv}
                </Chip>
              );
            })}
          </div>

          <div className="pt-2 border-t border-ledger-dotted">
            <Segmented options={tabs} value={segmentedTab} onChange={setSegmentedTab} />
          </div>
        </Card>
      </section>

      {/* 6. Slider, Skeletons, and Toast */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          6. Slider, Skeleton & Toast
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md" className="space-y-4 flex flex-col justify-center">
            <span className="text-xs text-ink-3">Slider (নকশা অপাসিটি)</span>
            <div>
              <Slider
                value={sliderValue}
                onChange={setSliderValue}
                leftLabel={t('oldMap')}
                rightLabel={t('digitalMap')}
                aria-label="Map opacity slider"
              />
            </div>
            <div className="text-xs text-ink-2">বর্তমান মান: {Math.round(sliderValue * 100)}%</div>
          </Card>

          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-3">Skeleton Loader</span>
              <Button size="sm" variant="secondary" onClick={triggerToast}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                টোস্ট দেখান
              </Button>
            </div>
            <div className="space-y-2">
              <Skeleton width="60%" height={20} />
              <Skeleton width="100%" height={14} />
              <Skeleton width="80%" height={14} />
            </div>
          </Card>
        </div>
      </section>

      {/* 7. Sheet Shell Component */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-3">
          7. Sheet Shell (Peek / Half / Full / Desktop Side Panel)
        </h2>
        <Card padding="md" className="space-y-3">
          <p className="text-xs sm:text-sm text-ink-2">
            ফোনে নিচের শিট ড্র্যাগ করুন অথবা নিচের বাটন দিয়ে স্ন্যাপ পয়েন্ট পরীক্ষা করুন। ডেস্কটপে
            (&ge; 1024px) এটি স্ক্রিনের বামে একটি পূর্ণ প্যানেল হিসেবে দৃশ্যমান থাকে।
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={sheetSnap === 'peek' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSheetSnap('peek');
                setShowDemoSheet(true);
              }}
            >
              Peek (১১২ px)
            </Button>
            <Button
              variant={sheetSnap === 'half' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSheetSnap('half');
                setShowDemoSheet(true);
              }}
            >
              Half (৫৫%)
            </Button>
            <Button
              variant={sheetSnap === 'full' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSheetSnap('full');
                setShowDemoSheet(true);
              }}
            >
              Full (৯২%)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDemoSheet(!showDemoSheet)}>
              {showDemoSheet ? 'শিট লুকান' : 'শিট সক্রিয় করুন'}
            </Button>
          </div>
        </Card>
      </section>

      {/* Interactive Sheet (if toggled on or on desktop) */}
      {showDemoSheet && (
        <Sheet
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          peekContent={
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-lg font-bold text-ink">দাগ ১০৪ · ১০.৫ শতাংশ</span>
                <div className="text-xs text-warn flex items-center gap-1 mt-0.5">
                  <Badge variant="warn" size="sm">
                    সতর্কতা
                  </Badge>
                </div>
              </div>
              <VerdictStamp verdict="warn" issueCount={1} className="scale-75 origin-right" />
            </div>
          }
        >
          <div className="space-y-4 pt-2">
            <Segmented options={tabs} value={segmentedTab} onChange={setSegmentedTab} />
            <div className="p-4 bg-paper rounded-xl border border-line space-y-2">
              <div className="text-sm font-semibold text-ink">মালিকানা তথ্য</div>
              <p className="text-xs text-ink-2">
                মালিক: রহিম উদ্দিন (৭/২০ অংশ)। ওয়ারিশ সূত্রে প্রাপ্ত।
              </p>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
};
