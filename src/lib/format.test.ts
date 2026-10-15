import { describe, expect, it } from 'vitest';
import {
  formatDecimal,
  formatNumber,
  formatTaka,
  toBanglaDigits,
  fromBanglaDigits,
  parseBanglaNumber,
} from './format';

describe('format utilities', () => {
  describe('toBanglaDigits', () => {
    it('converts English digits to Bangla digits', () => {
      expect(toBanglaDigits(1234567890)).toBe('১২৩৪৫৬৭৮৯০');
      expect(toBanglaDigits('52,00,000')).toBe('৫২,০০,০০০');
      expect(toBanglaDigits('Plot 104')).toBe('Plot ১০৪');
    });
  });

  describe('fromBanglaDigits and parseBanglaNumber', () => {
    it('converts Bangla digits to English digits', () => {
      expect(fromBanglaDigits('১২৩৪৫৬৭৮৯০')).toBe('1234567890');
      expect(fromBanglaDigits('৫২,০০,০০০')).toBe('52,00,000');
    });

    it('parses numbers entered in Bangla or English digits with commas', () => {
      expect(parseBanglaNumber('৫২,০০,০০০')).toBe(5200000);
      expect(parseBanglaNumber('10,00,000')).toBe(1000000);
      expect(parseBanglaNumber('৭৫০')).toBe(750);
      expect(parseBanglaNumber('')).toBeNaN();
      expect(parseBanglaNumber('abc')).toBeNaN();
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with South Asian grouping in Bangla', () => {
      expect(formatNumber(5200000, 'bn')).toBe('৫২,০০,০০০');
      expect(formatNumber(1000, 'bn')).toBe('১,০০০');
      expect(formatNumber(104, 'bn')).toBe('১০৪');
    });

    it('formats numbers in English', () => {
      expect(formatNumber(5200000, 'en')).toBe('52,00,000');
      expect(formatNumber(1000, 'en')).toBe('1,000');
    });
  });

  describe('formatTaka', () => {
    it('formats full taka amount with currency symbol/word', () => {
      expect(formatTaka(5200000, 'bn')).toBe('৫২,০০,০০০ টাকা');
      expect(formatTaka(5200000, 'en')).toBe('52,00,000 ৳');
    });

    it('formats short taka amount in lakh and crore', () => {
      expect(formatTaka(5200000, 'bn', { short: true })).toBe('৫২ লাখ টাকা');
      expect(formatTaka(520000, 'bn', { short: true })).toBe('৫.২ লাখ টাকা');
      expect(formatTaka(15000000, 'bn', { short: true })).toBe('১.৫ কোটি টাকা');
      expect(formatTaka(50000, 'bn', { short: true })).toBe('৫০ হাজার টাকা');
      expect(formatTaka(850, 'bn', { short: true })).toBe('৮৫০ টাকা');

      expect(formatTaka(5200000, 'en', { short: true })).toBe('52 lakh ৳');
      expect(formatTaka(520000, 'en', { short: true })).toBe('5.2 lakh ৳');
      expect(formatTaka(15000000, 'en', { short: true })).toBe('1.5 crore ৳');
    });
  });

  describe('formatDecimal', () => {
    it('formats decimal numbers with proper digits and precision', () => {
      expect(formatDecimal(10.5, 'bn')).toBe('১০.৫');
      expect(formatDecimal(10.5, 'en')).toBe('10.5');
      expect(formatDecimal(3.14159, 'bn', 2)).toBe('৩.১৪');
      expect(formatDecimal(3.14159, 'en', 2)).toBe('3.14');
    });
  });
});
