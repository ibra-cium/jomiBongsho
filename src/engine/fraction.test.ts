import { describe, it, expect } from 'vitest';
import Fraction from 'fraction.js';
import {
  parseShare,
  sumShares,
  shareToDecimal,
  formatShare,
  isOne,
  toFraction,
  compareShares,
  multiplyShares,
} from './fraction';

describe('fraction', () => {
  it('parses valid fraction strings into Fraction instances', () => {
    const f1 = parseShare('7/20');
    expect(f1).toBeInstanceOf(Fraction);
    expect(f1.toFraction()).toBe('7/20');
    expect(Number(f1.n)).toBe(7);
    expect(Number(f1.d)).toBe(20);

    const f2 = parseShare('1/1');
    expect(f2.toFraction()).toBe('1');
    expect(Number(f2.n)).toBe(1);
    expect(Number(f2.d)).toBe(1);

    const f3 = parseShare('1/3');
    expect(f3.toFraction()).toBe('1/3');
    expect(Number(f3.n)).toBe(1);
    expect(Number(f3.d)).toBe(3);
  });

  it('toFraction handles both string and Fraction instance inputs', () => {
    const f1 = toFraction('1/2');
    expect(f1.toFraction()).toBe('1/2');

    const f2 = toFraction(f1);
    expect(f2).toBe(f1);
  });

  it('1/3 + 1/3 + 1/3 equals exactly 1 (exact rational arithmetic)', () => {
    const s1 = parseShare('1/3');
    const s2 = parseShare('1/3');
    const s3 = parseShare('1/3');

    const sum = sumShares([s1, s2, s3]);
    expect(sum.equals(1)).toBe(true);
    expect(isOne(sum)).toBe(true);
    expect(sum.toFraction()).toBe('1');
  });

  it('sumShares correctly adds mixed string and Fraction inputs', () => {
    // dag 103 example: wife 1/8 + son 7/20 + son 7/20 + daughter 7/40 = 1
    const total = sumShares(['1/8', parseShare('7/20'), '7/20', '7/40']);
    expect(isOne(total)).toBe(true);
    expect(total.equals(1)).toBe(true);
  });

  it('shareToDecimal calculates area in decimal correctly', () => {
    // 30 decimal plot, 7/20 share -> 10.5 decimal
    expect(shareToDecimal('7/20', 30)).toBe(10.5);
    // 30 decimal plot, 1/8 share -> 3.75 decimal
    expect(shareToDecimal('1/8', 30)).toBe(3.75);
    // 30 decimal plot, 7/40 share -> 5.25 decimal
    expect(shareToDecimal('7/40', 30)).toBe(5.25);
    // 30 decimal plot, 1/3 share -> 10 decimal
    expect(shareToDecimal('1/3', 30)).toBe(10);
  });

  it('formatShare formats share in Bangla and English', () => {
    expect(formatShare('7/20', 'bn')).toBe('৭/২০');
    expect(formatShare('7/20', 'en')).toBe('7/20');
    expect(formatShare('1/1', 'bn')).toBe('১/১');
    expect(formatShare('1/1', 'en')).toBe('1/1');
  });

  it('compareShares accurately compares shares without float inaccuracies', () => {
    expect(compareShares('1/3', '1/4')).toBe(1);
    expect(compareShares('1/4', '1/3')).toBe(-1);
    expect(compareShares('2/6', '1/3')).toBe(0);
  });

  it('multiplyShares computes exact fraction multiplication', () => {
    // 1/2 of 7/20 = 7/40
    const result = multiplyShares('1/2', '7/20');
    expect(result.toFraction()).toBe('7/40');
  });
});
