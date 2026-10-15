import { describe, expect, it } from 'vitest';
import { bn } from './bn';
import { en } from './en';
import { translate } from './useT';
import type { IssueCode } from '@/engine/types';

// All issue codes from DOMAIN_RULES §4 — the completeness test iterates these.
const ALL_ISSUE_CODES: IssueCode[] = [
  'DOUBLE_SALE',
  'HEIR_OVER_SALE',
  'OVER_SALE',
  'CHAIN_BREAK',
  'MUTATION_WITHOUT_DEED',
  'RECORD_SUM_ERROR',
  'KHAS_LAND',
  'ACQUISITION',
  'PENDING_CASE',
  'MUTATION_MISMATCH',
  'ESTATE_LEGAL_REVIEW',
  'REG_WITHOUT_MUTATION',
  'RAPID_RESALE',
  'UNDER_DECLARED',
  'AREA_MISMATCH',
  'TAX_ARREARS',
];

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

describe('i18n issue code completeness', () => {
  it('every IssueCode has title, body and next in bn', () => {
    for (const code of ALL_ISSUE_CODES) {
      const titleKey = `issue_${code}_title` as keyof typeof bn;
      const bodyKey = `issue_${code}_body` as keyof typeof bn;
      const nextKey = `issue_${code}_next` as keyof typeof bn;
      expect(bn[titleKey], `bn.${titleKey} missing`).toBeTruthy();
      expect(bn[bodyKey], `bn.${bodyKey} missing`).toBeTruthy();
      expect(bn[nextKey], `bn.${nextKey} missing`).toBeTruthy();
    }
  });

  it('every IssueCode has title, body and next in en', () => {
    for (const code of ALL_ISSUE_CODES) {
      const titleKey = `issue_${code}_title` as keyof typeof en;
      const bodyKey = `issue_${code}_body` as keyof typeof en;
      const nextKey = `issue_${code}_next` as keyof typeof en;
      expect(en[titleKey], `en.${titleKey} missing`).toBeTruthy();
      expect(en[bodyKey], `en.${bodyKey} missing`).toBeTruthy();
      expect(en[nextKey], `en.${nextKey} missing`).toBeTruthy();
    }
  });
});
