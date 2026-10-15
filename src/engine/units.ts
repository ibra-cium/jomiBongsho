import { toBanglaDigits } from '@/lib/format';

/**
 * Bangladesh Land Measurement Units Constants
 * Reference: DOMAIN_RULES.md §1
 */
export const SQFT_PER_DECIMAL = 435.6;
export const SQMETERS_PER_DECIMAL = 40.4686;
export const SQFT_PER_KATHA = 720.0;
export const KATHA_PER_BIGHA = 20.0;
export const DECIMAL_PER_ACRE = 100.0;

/**
 * Decimal per katha standard ratio (720 / 435.6 = 1.65289256...)
 */
export const DECIMAL_PER_KATHA = SQFT_PER_KATHA / SQFT_PER_DECIMAL; // ~1.6529

/**
 * Katha per decimal standard ratio (435.6 / 720 = 0.605)
 */
export const KATHA_PER_DECIMAL = SQFT_PER_DECIMAL / SQFT_PER_KATHA; // 0.605

/**
 * Standard decimal per bigha (20 katha = ~33.058 decimal)
 */
export const DECIMAL_PER_BIGHA = KATHA_PER_BIGHA * DECIMAL_PER_KATHA;

/**
 * Utility rounding function to N decimal places.
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Converts area in decimal to katha (30 decimal -> 18.15 katha).
 */
export function decimalToKatha(decimal: number): number {
  return decimal * KATHA_PER_DECIMAL;
}

/**
 * Converts area in katha to decimal.
 */
export function kathaToDecimal(katha: number): number {
  return katha * DECIMAL_PER_KATHA;
}

/**
 * Converts area in decimal to standard bigha (20 katha).
 */
export function decimalToBigha(decimal: number): number {
  return decimalToKatha(decimal) / KATHA_PER_BIGHA;
}

/**
 * Converts area in bigha to decimal.
 */
export function bighaToDecimal(bigha: number): number {
  return kathaToDecimal(bigha * KATHA_PER_BIGHA);
}

/**
 * Converts area in decimal to acre (100 decimal = 1 acre).
 */
export function decimalToAcre(decimal: number): number {
  return decimal / DECIMAL_PER_ACRE;
}

/**
 * Converts area in acre to decimal.
 */
export function acreToDecimal(acre: number): number {
  return acre * DECIMAL_PER_ACRE;
}

/**
 * Converts area in decimal to square metres (1 decimal = 40.4686 m²).
 */
export function decimalToSqMeters(decimal: number): number {
  return decimal * SQMETERS_PER_DECIMAL;
}

/**
 * Converts square metres to area in decimal.
 */
export function sqMetersToDecimal(sqMeters: number): number {
  return sqMeters / SQMETERS_PER_DECIMAL;
}

/**
 * Converts area in decimal to square feet (1 decimal = 435.6 sq ft).
 */
export function decimalToSqFeet(decimal: number): number {
  return decimal * SQFT_PER_DECIMAL;
}

/**
 * Converts square feet to area in decimal.
 */
export function sqFeetToDecimal(sqFeet: number): number {
  return sqFeet / SQFT_PER_DECIMAL;
}

/**
 * Formats area with both decimal and katha values.
 * Example (bn): "৩০ শতাংশ (১৮.১৫ কাঠা)"
 * Example (en): "30 decimal (18.15 katha)"
 */
export function formatAreaWithKatha(decimal: number, lang: 'bn' | 'en' = 'bn'): string {
  const katha = roundTo(decimalToKatha(decimal), 2);
  const decFormatted = Number(decimal.toFixed(2)).toString();
  const kathaFormatted = Number(katha.toFixed(2)).toString();

  if (lang === 'bn') {
    return `${toBanglaDigits(decFormatted)} শতাংশ (${toBanglaDigits(kathaFormatted)} কাঠা)`;
  }
  return `${decFormatted} decimal (${kathaFormatted} katha)`;
}
