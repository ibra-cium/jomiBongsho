import { useAppStore, type SupportedLang } from '@/state/useAppStore';
import { bn, type TranslationKey } from './bn';
import { en } from './en';
import { toBanglaDigits } from '@/lib/format';

const dictionaries = {
  bn,
  en,
};

export function translate(
  key: TranslationKey,
  lang: SupportedLang,
  params?: Record<string, string | number>,
): string {
  const dict = dictionaries[lang] ?? dictionaries.bn;
  let text = dict[key] ?? dictionaries.bn[key] ?? String(key);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      const formattedVal = typeof v === 'number' && lang === 'bn' ? toBanglaDigits(v) : String(v);
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), formattedVal);
    }
  }

  return text;
}

export function useT() {
  const lang = useAppStore((state) => state.lang);

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(key, lang, params);
  };

  return { t, lang };
}
