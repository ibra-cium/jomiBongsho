/**
 * cost.ts — Total cost calculator engine module
 * Pure TypeScript, no React/DOM/fetch — AGENTS.md rule 4
 * DOMAIN_RULES.md §7
 *
 * Exact integer paisa arithmetic and half-up basis-point rounding:
 * Math.floor((pricePaisa * bp + 5000) / 10000)
 */

import type { CostCalculation, CostInput, CostLineItem } from './types';

/**
 * Calculates government registration fees, taxes, mutation fees,
 * and total acquisition cost for land purchase.
 */
export function calculateCost(input: CostInput): CostCalculation {
  const {
    recordedAreaDecimal,
    areaClass,
    sourceTaxClass,
    feeRules,
    arrearsBdt = 0,
    buyerPaysSourceTax = true,
    estimateMidPerDecimalBdt,
  } = input;

  const declaredPriceBdt = Math.max(0, input.declaredPriceBdt);
  const pricePaisa = Math.round(declaredPriceBdt * 100);

  const lines: CostLineItem[] = [];

  // Helper for percentage-based lines in exact integer paisa (half-up rounding)
  const calcBpPaisa = (bp: number): { paisa: number; bdt: number } => {
    const paisa = Math.floor((pricePaisa * bp + 5000) / 10000);
    return { paisa, bdt: paisa / 100 };
  };

  // ── 1. Stamp Duty (স্ট্যাম্প শুল্ক) ──────────────────────────────────────────
  const stampDutyBp = feeRules.bp.stampDuty; // e.g. 150 bp (1.5%)
  const stampDuty = calcBpPaisa(stampDutyBp);
  lines.push({
    id: 'stampDuty',
    labelBn: 'স্ট্যাম্প শুল্ক',
    labelEn: 'Stamp Duty',
    basisPoints: stampDutyBp,
    amountPaisa: stampDuty.paisa,
    amountBdt: stampDuty.bdt,
  });

  // ── 2. Registration Fee (রেজিস্ট্রেশন ফি) ───────────────────────────────────
  const regFeeBp = feeRules.bp.registrationFee; // e.g. 100 bp (1.0%)
  const regFee = calcBpPaisa(regFeeBp);
  lines.push({
    id: 'registrationFee',
    labelBn: 'রেজিস্ট্রেশন ফি',
    labelEn: 'Registration Fee',
    basisPoints: regFeeBp,
    amountPaisa: regFee.paisa,
    amountBdt: regFee.bdt,
  });

  // ── 3. Local Government Tax (স্থানীয় সরকার কর) ───────────────────────────
  const localGovtBp = feeRules.bp.localGovtTax[areaClass] ?? feeRules.bp.localGovtTax.union;
  const localGovt = calcBpPaisa(localGovtBp);
  lines.push({
    id: 'localGovtTax',
    labelBn: 'স্থানীয় সরকার কর',
    labelEn: 'Local Government Tax',
    basisPoints: localGovtBp,
    amountPaisa: localGovt.paisa,
    amountBdt: localGovt.bdt,
  });

  // ── 4. Source Tax / Gain Tax (উৎস কর / মূলধনী লাভ কর) ─────────────────────
  // Included only if buyer agreed to pay (buyerPaysSourceTax)
  if (buyerPaysSourceTax) {
    const sourceTaxBp = feeRules.bp.sourceTax[sourceTaxClass] ?? feeRules.bp.sourceTax.C;
    const sourceTax = calcBpPaisa(sourceTaxBp);
    lines.push({
      id: 'sourceTax',
      labelBn: 'উৎসে কর (মূলধনী লাভ কর)',
      labelEn: 'Source Tax (Capital Gains Tax)',
      basisPoints: sourceTaxBp,
      amountPaisa: sourceTax.paisa,
      amountBdt: sourceTax.bdt,
      noteBn:
        'আইন অনুযায়ী এটি বিক্রেতার কর, তবে বাস্তবে অনেক সময় ক্রেতাকে দিতে হয়; লিখিতভাবে আগেই ঠিক করে নিন (টিবিএস, মে ২০২৫)।',
      noteEn:
        "By law this is the seller's tax, but in practice buyers often pay it; agree in writing beforehand (TBS, May 2025).",
    });
  }

  // ── 5. Fixed Sub-Registry Fees (নির্দিষ্ট সরকারি ফি) ──────────────────────
  const fixed = feeRules.fixedFeesBdt;
  const fixedTotalBdt = fixed.eFee + fixed.nFee + fixed.courtFee + fixed.affidavitStamp;
  const fixedTotalPaisa = Math.round(fixedTotalBdt * 100);
  lines.push({
    id: 'fixedFees',
    labelBn: 'নির্দিষ্ট সরকারি ফি (ই-ফি, এন-ফি, স্ট্যাম্প)',
    labelEn: 'Fixed Government Fees (E-fee, N-fee, Stamp)',
    amountPaisa: fixedTotalPaisa,
    amountBdt: fixedTotalBdt,
    subItems: [
      { id: 'eFee', labelBn: 'ই-ফি (E-Fee)', labelEn: 'E-Fee', amountBdt: fixed.eFee },
      { id: 'nFee', labelBn: 'এন-ফি (N-Fee)', labelEn: 'N-Fee', amountBdt: fixed.nFee },
      {
        id: 'courtFee',
        labelBn: 'কোর্ট ফি (Court Fee)',
        labelEn: 'Court Fee',
        amountBdt: fixed.courtFee,
      },
      {
        id: 'affidavitStamp',
        labelBn: 'হলফনামা স্ট্যাম্প (Affidavit Stamp)',
        labelEn: 'Affidavit Stamp',
        amountBdt: fixed.affidavitStamp,
      },
    ],
  });

  // ── 6. E-Mutation Fee (ই-নামজারি ফি) ───────────────────────────────────────
  const mut = feeRules.mutationFeesBdt;
  const mutTotalBdt = mut.courtFee + mut.noticeFee + mut.recordCorrection + mut.ledgerCopy;
  const mutTotalPaisa = Math.round(mutTotalBdt * 100);
  lines.push({
    id: 'mutationFee',
    labelBn: 'ই-নামজারি ফি',
    labelEn: 'E-Mutation Fee',
    amountPaisa: mutTotalPaisa,
    amountBdt: mutTotalBdt,
    subItems: [
      {
        id: 'courtFee',
        labelBn: 'আবেদন কোর্ট ফি',
        labelEn: 'Application Court Fee',
        amountBdt: mut.courtFee,
      },
      {
        id: 'noticeFee',
        labelBn: 'নোটিশ জারি ফি',
        labelEn: 'Notice Issue Fee',
        amountBdt: mut.noticeFee,
      },
      {
        id: 'recordCorrection',
        labelBn: 'রেকর্ড সংশোধন ফি',
        labelEn: 'Record Correction Fee',
        amountBdt: mut.recordCorrection,
      },
      {
        id: 'ledgerCopy',
        labelBn: 'খতিয়ান সরবরাহ ফি',
        labelEn: 'Khatian Copy Fee',
        amountBdt: mut.ledgerCopy,
      },
    ],
  });

  // ── 7. Land Tax Arrears (বকেয়া ভূমি উন্নয়ন কর) ──────────────────────────
  if (arrearsBdt > 0) {
    const arrearsPaisa = Math.round(arrearsBdt * 100);
    lines.push({
      id: 'landTaxArrears',
      labelBn: 'বকেয়া ভূমি উন্নয়ন কর',
      labelEn: 'Unpaid Land Development Tax',
      amountPaisa: arrearsPaisa,
      amountBdt: arrearsBdt,
      noteBn: 'জমির পূর্বের বকেয়া খাজনা — দলিল রেজিস্ট্রির পূর্বে এটি পরিশোধ করতে হবে।',
      noteEn: 'Past unpaid land tax arrears — must be cleared before deed registration.',
    });
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const feesTotalPaisa = lines.reduce((acc, curr) => acc + curr.amountPaisa, 0);
  const feesTotalBdt = feesTotalPaisa / 100;

  const grandTotalPaisa = pricePaisa + feesTotalPaisa;
  const grandTotalBdt = grandTotalPaisa / 100;

  const effectiveRatePct = pricePaisa > 0 ? (feesTotalPaisa / pricePaisa) * 100 : 0;

  // ── Under-declared Check ──────────────────────────────────────────────────
  const area = Math.max(0, recordedAreaDecimal);
  const pricePerDecimalBdt = area > 0 ? declaredPriceBdt / area : 0;

  let isUnderDeclared = false;
  let underDeclaredThresholdBdt: number | undefined;

  if (estimateMidPerDecimalBdt && estimateMidPerDecimalBdt > 0) {
    underDeclaredThresholdBdt = 0.5 * estimateMidPerDecimalBdt;
    isUnderDeclared = pricePerDecimalBdt < underDeclaredThresholdBdt;
  }

  return {
    landPriceBdt: declaredPriceBdt,
    landPricePaisa: pricePaisa,
    areaDecimal: area,
    pricePerDecimalBdt,
    buyerPaysSourceTax,
    lines,
    feesTotalBdt,
    feesTotalPaisa,
    grandTotalBdt,
    grandTotalPaisa,
    effectiveRatePct,
    isUnderDeclared,
    underDeclaredThresholdBdt,
    feeRulesStatus: feeRules.status,
    sources: feeRules.sources,
  };
}
