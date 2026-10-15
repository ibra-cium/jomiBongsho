import { describe, it, expect } from 'vitest';
import {
  decimalToKatha,
  kathaToDecimal,
  decimalToBigha,
  bighaToDecimal,
  decimalToAcre,
  acreToDecimal,
  decimalToSqMeters,
  sqMetersToDecimal,
  decimalToSqFeet,
  sqFeetToDecimal,
  formatAreaWithKatha,
  roundTo,
} from './units';

describe('units', () => {
  it('converts 30 decimal to exactly 18.15 katha', () => {
    // Acceptance criterion: 30 decimal -> 18.15 katha
    const katha = decimalToKatha(30);
    expect(roundTo(katha, 2)).toBe(18.15);
  });

  it('performs round-trip conversions between decimal and katha', () => {
    const originalDecimal = 16.529;
    const katha = decimalToKatha(originalDecimal);
    const backToDecimal = kathaToDecimal(katha);
    expect(roundTo(backToDecimal, 3)).toBe(roundTo(originalDecimal, 3));
  });

  it('performs round-trip conversions between decimal and bigha', () => {
    // 1 bigha = 20 katha = 33.058 decimal
    const bigha = decimalToBigha(33.058);
    expect(roundTo(bigha, 2)).toBe(1);
    expect(roundTo(bighaToDecimal(1), 3)).toBe(33.058);
  });

  it('performs round-trip conversions between decimal and acre', () => {
    // 1 acre = 100 decimal
    expect(decimalToAcre(100)).toBe(1);
    expect(acreToDecimal(1.5)).toBe(150);
  });

  it('converts decimal to square metres and square feet accurately', () => {
    // 1 decimal = 40.4686 m² = 435.6 sq ft
    expect(roundTo(decimalToSqMeters(1), 4)).toBe(40.4686);
    expect(roundTo(sqMetersToDecimal(40.4686), 4)).toBe(1);

    expect(roundTo(decimalToSqFeet(1), 1)).toBe(435.6);
    expect(roundTo(sqFeetToDecimal(435.6), 1)).toBe(1);
  });

  it('formatAreaWithKatha formats bilingual area representations', () => {
    expect(formatAreaWithKatha(30, 'bn')).toBe('৩০ শতাংশ (১৮.১৫ কাঠা)');
    expect(formatAreaWithKatha(30, 'en')).toBe('30 decimal (18.15 katha)');
  });
});
