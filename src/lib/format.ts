const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => BANGLA_DIGITS[Number(digit)] ?? digit);
}

/**
 * Format a number using South Asian grouping (lakh, crore).
 * Example: 5200000 -> "৫২,০০,০০০" (bn) or "52,00,000" (en)
 */
export function formatNumber(n: number, lang: 'bn' | 'en' = 'bn'): string {
  const formattedEn = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(n);

  if (lang === 'bn') {
    return toBanglaDigits(formattedEn);
  }
  return formattedEn;
}

interface FormatTakaOptions {
  short?: boolean;
}

/**
 * Format currency amount in Taka.
 * Full: "৫২,০০,০০০ টাকা" (bn), "52,00,000 ৳" (en)
 * Short: "৫২ লাখ টাকা" / "১.৫ কোটি টাকা" (bn), "52 lakh ৳" / "1.5 crore ৳" (en)
 */
export function formatTaka(
  amount: number,
  lang: 'bn' | 'en' = 'bn',
  options?: FormatTakaOptions,
): string {
  const isShort = options?.short ?? false;

  if (isShort) {
    const abs = Math.abs(amount);
    if (abs >= 10_000_000) {
      const crore = amount / 10_000_000;
      const rounded = Number(crore.toFixed(2));
      const valStr = lang === 'bn' ? toBanglaDigits(rounded) : String(rounded);
      return `${valStr} ${lang === 'bn' ? 'কোটি টাকা' : 'crore ৳'}`;
    }
    if (abs >= 100_000) {
      const lakh = amount / 100_000;
      const rounded = Number(lakh.toFixed(2));
      const valStr = lang === 'bn' ? toBanglaDigits(rounded) : String(rounded);
      return `${valStr} ${lang === 'bn' ? 'লাখ টাকা' : 'lakh ৳'}`;
    }
    if (abs >= 1_000) {
      const thousand = amount / 1_000;
      const rounded = Number(thousand.toFixed(2));
      const valStr = lang === 'bn' ? toBanglaDigits(rounded) : String(rounded);
      return `${valStr} ${lang === 'bn' ? 'হাজার টাকা' : 'k ৳'}`;
    }
  }

  const formatted = formatNumber(amount, lang);
  return `${formatted} ${lang === 'bn' ? 'টাকা' : '৳'}`;
}

/**
 * Format decimal numbers (e.g. area in decimal/shatangsho).
 */
export function formatDecimal(
  n: number,
  lang: 'bn' | 'en' = 'bn',
  fractionDigits: number = 2,
): string {
  const formatted = Number(n.toFixed(fractionDigits)).toString();
  return lang === 'bn' ? toBanglaDigits(formatted) : formatted;
}

/**
 * Format ISO date string (e.g. "2026-10-01").
 */
export function formatDate(iso: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  if (lang === 'bn') {
    const day = toBanglaDigits(date.getDate());
    const year = toBanglaDigits(date.getFullYear());
    const monthsBn = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];
    const month = monthsBn[date.getMonth()] ?? '';
    return `${day} ${month} ${year}`;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
