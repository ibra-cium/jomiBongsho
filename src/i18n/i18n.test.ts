import { describe, expect, it } from 'vitest';
import { bn } from './bn';
import { en } from './en';
import { translate } from './useT';

describe('i18n dictionaries and translation', () => {
  it('ensures bn and en have exactly identical keys', () => {
    const bnKeys = Object.keys(bn).sort();
    const enKeys = Object.keys(en).sort();

    expect(bnKeys).toEqual(enKeys);
  });

  it('no translation value is empty', () => {
    for (const [key, value] of Object.entries(bn)) {
      expect(value.trim().length, `bn.${key} is empty`).toBeGreaterThan(0);
    }
    for (const [key, value] of Object.entries(en)) {
      expect(value.trim().length, `en.${key} is empty`).toBeGreaterThan(0);
    }
  });

  it('interpolates parameters correctly with Bangla and English digits', () => {
    expect(translate('seeIssues', 'bn', { n: 3 })).toBe('৩টি বিষয় দেখুন');
    expect(translate('seeIssues', 'en', { n: 3 })).toBe('View 3 issues');
  });
});
