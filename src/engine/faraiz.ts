/**
 * Faraiz (Islamic Inheritance) Engine Module
 * Pure TypeScript implementation adhering strictly to DOMAIN_RULES.md §3
 *
 * Supported cases:
 * - Muslim law with at least one son
 * - Heirs restricted to: wife (1-4), husband (max 1), father, mother, son, daughter
 * - Valid spouse matching deceased sex
 *
 * All other cases return { supported: false, reason } for legal review.
 */

import Fraction from 'fraction.js';
import type { FaraizInput, FaraizResult, FaraizRow, Relation } from './types';

export const FARAIZ_DISCLAIMER_BN = 'সাধারণ ক্ষেত্রের হিসাব — আইনি পরামর্শ নয়';
export const FARAIZ_DISCLAIMER_EN = 'Common cases only — not legal advice';

const SUPPORTED_RELATIONS = new Set<string>([
  'wife',
  'husband',
  'father',
  'mother',
  'son',
  'daughter',
]);

/**
 * Calculates exact rational inheritance shares for supported Islamic inheritance cases.
 */
export function faraiz(input: FaraizInput): FaraizResult {
  const { deceasedSex, law, heirs } = input;

  // 1. Law check: only Muslim law is handled by Faraiz
  if (law !== undefined && law !== 'muslim') {
    return { supported: false, reason: 'HINDU_LAW' };
  }

  // 2. Empty heirs check
  if (!heirs || heirs.length === 0) {
    return { supported: false, reason: 'NO_HEIRS' };
  }

  // 3. Supported relations check
  for (const h of heirs) {
    if (!SUPPORTED_RELATIONS.has(h.relation)) {
      return { supported: false, reason: 'UNSUPPORTED_RELATION' };
    }
  }

  // Count relations
  let wifeCount = 0;
  let husbandCount = 0;
  let fatherCount = 0;
  let motherCount = 0;
  let sonCount = 0;
  let daughterCount = 0;

  for (const h of heirs) {
    switch (h.relation) {
      case 'wife':
        wifeCount++;
        break;
      case 'husband':
        husbandCount++;
        break;
      case 'father':
        fatherCount++;
        break;
      case 'mother':
        motherCount++;
        break;
      case 'son':
        sonCount++;
        break;
      case 'daughter':
        daughterCount++;
        break;
    }
  }

  // Cannot have multiple fathers or mothers
  if (fatherCount > 1 || motherCount > 1) {
    return { supported: false, reason: 'UNSUPPORTED_RELATION' };
  }

  // 4. Spouse validity check based on deceased sex
  if (deceasedSex === 'M') {
    if (husbandCount > 0 || wifeCount > 4) {
      return { supported: false, reason: 'INVALID_SPOUSE' };
    }
  } else if (deceasedSex === 'F') {
    if (wifeCount > 0 || husbandCount > 1) {
      return { supported: false, reason: 'INVALID_SPOUSE' };
    }
  } else {
    return { supported: false, reason: 'INVALID_SPOUSE' };
  }

  // 5. At least one son is required for the supported residue formula
  if (sonCount < 1) {
    return { supported: false, reason: 'NO_SON' };
  }

  // 6. Compute fixed Quranic shares
  let fixedSum = new Fraction(0);

  // Husband: 1/4 (with children)
  let husbandShare: Fraction | null = null;
  if (husbandCount > 0) {
    husbandShare = new Fraction(1, 4);
    fixedSum = fixedSum.add(husbandShare);
  }

  // Wife / wives: 1/8 total, divided equally among wives
  let eachWifeShare: Fraction | null = null;
  if (wifeCount > 0) {
    const totalWivesShare = new Fraction(1, 8);
    eachWifeShare = totalWivesShare.div(wifeCount);
    fixedSum = fixedSum.add(totalWivesShare);
  }

  // Father: 1/6 (with son)
  let fatherShare: Fraction | null = null;
  if (fatherCount > 0) {
    fatherShare = new Fraction(1, 6);
    fixedSum = fixedSum.add(fatherShare);
  }

  // Mother: 1/6 (with children)
  let motherShare: Fraction | null = null;
  if (motherCount > 0) {
    motherShare = new Fraction(1, 6);
    fixedSum = fixedSum.add(motherShare);
  }

  // 7. Residue for sons and daughters (Asaba)
  // Residue = 1 - fixedSum.
  // Each son receives 2 parts, each daughter receives 1 part.
  const residue = new Fraction(1).sub(fixedSum);
  const totalParts = sonCount * 2 + daughterCount * 1;
  const partShare = residue.div(totalParts);

  const sonShare = partShare.mul(2);
  const daughterShare = partShare.mul(1);

  // 8. Build shares rows preserving the original input order
  const shares: FaraizRow[] = heirs.map((h) => {
    let f: Fraction;
    let ruleKey: string;

    switch (h.relation) {
      case 'husband':
        f = husbandShare!;
        ruleKey = 'HUSBAND_WITH_CHILD';
        break;
      case 'wife':
        f = eachWifeShare!;
        ruleKey = 'WIFE_WITH_CHILD';
        break;
      case 'father':
        f = fatherShare!;
        ruleKey = 'FATHER_WITH_SON';
        break;
      case 'mother':
        f = motherShare!;
        ruleKey = 'MOTHER_WITH_CHILD';
        break;
      case 'son':
        f = sonShare;
        ruleKey = 'CHILDREN_RESIDUE';
        break;
      case 'daughter':
        f = daughterShare;
        ruleKey = 'CHILDREN_RESIDUE';
        break;
      default:
        // Defensive fallback for TypeScript narrowing
        f = new Fraction(0);
        ruleKey = 'UNKNOWN';
        break;
    }

    return {
      personId: h.personId,
      relation: h.relation as Relation,
      share: `${f.n}/${f.d}`,
      ruleKey,
    };
  });

  return {
    supported: true,
    shares,
  };
}
