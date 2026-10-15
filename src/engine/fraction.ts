import Fraction from 'fraction.js';
import type { Share } from './types';
import { toBanglaDigits } from '@/lib/format';

export { Fraction };

/**
 * Parses a fractional share string (e.g. "7/20", "1/1") into a Fraction object.
 */
export function parseShare(share: Share): Fraction {
  return new Fraction(share);
}

/**
 * Converts a share string or existing Fraction object to a Fraction instance.
 */
export function toFraction(val: Share | Fraction): Fraction {
  if (val instanceof Fraction) {
    return val;
  }
  return new Fraction(val);
}

/**
 * Sums an array of shares with exact rational arithmetic.
 */
export function sumShares(shares: readonly (Share | Fraction)[]): Fraction {
  let sum = new Fraction(0);
  for (const s of shares) {
    sum = sum.add(toFraction(s));
  }
  return sum;
}

/**
 * Checks if a share equals exactly 1.
 */
export function isOne(share: Share | Fraction): boolean {
  return toFraction(share).equals(1);
}

/**
 * Computes the area represented by a share in decimals.
 * Share × recordedAreaDecimal rounded to 2 decimal places.
 */
export function shareToDecimal(share: Share | Fraction, recordedAreaDecimal: number): number {
  const f = toFraction(share);
  const raw = Number(f.mul(recordedAreaDecimal));
  return Math.round(raw * 100) / 100;
}

/**
 * Formats a share as "a/b" in English or "ক/খ" in Bangla digits.
 */
export function formatShare(share: Share | Fraction, lang: 'bn' | 'en' = 'bn'): string {
  const f = toFraction(share);
  const fracStr = `${f.n}/${f.d}`;
  if (lang === 'bn') {
    return toBanglaDigits(fracStr);
  }
  return fracStr;
}

/**
 * Compares two shares: returns 1 if a > b, -1 if a < b, 0 if equal.
 */
export function compareShares(a: Share | Fraction, b: Share | Fraction): number {
  return toFraction(a).compare(toFraction(b));
}

/**
 * Multiplies two shares with exact rational arithmetic.
 */
export function multiplyShares(a: Share | Fraction, b: Share | Fraction): Fraction {
  return toFraction(a).mul(toFraction(b));
}
