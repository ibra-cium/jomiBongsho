import type { TranslationKey } from './bn';

export const en: Record<TranslationKey, string> = {
  // App brand & header
  appName: 'Jomi Bongsho',
  appTagline: 'Land khatian, ownership and risk analysis',
  watermark: 'Demo Data – Not an Official Record',
  demoNotice: 'For demonstration only',

  // Navigation & Menu
  menu: 'Menu',
  home: 'Map',
  about: 'About',
  verify: 'Verify',
  present: 'Presentation',
  devUi: 'UI Preview',
  demo: 'Demo',
  install: 'Install App',
  iosInstallHint: 'To install, tap Share in Safari and select "Add to Home Screen".',
  updateReady: 'New update available',
  updateAction: 'Refresh',
  offlineReady: 'App is ready for offline use',
  language: 'Language',
  theme: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeSystem: 'System',

  // Common actions
  search: 'Search',
  searchPlaceholder: 'Enter plot number...',
  close: 'Close',
  back: 'Back',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  actionShare: 'Share',
  loading: 'Loading...',
  details: 'Details',
  calculate: 'Calculate',
  refresh: 'Refresh',
  seeIssues: 'View {n} issues',

  // Verdicts
  verdictOk: 'No Risk Found',
  verdictWarn: 'Caution',
  verdictBad: 'High Risk',

  // Sheet & Tabs
  tabSummary: 'Summary',
  tabHistory: 'History',
  tabPrice: 'Price',
  tabCost: 'Cost',

  // Land concepts
  dag: 'Plot',
  dagNo: 'Plot No.',
  area: 'Area',
  decimalUnit: 'decimals',
  kathaUnit: 'katha',
  takaUnit: 'Taka',
  owners: 'Owners',
  ownershipShare: 'Share',

  // Map overlay
  oldMap: 'Old Mouza Map',
  digitalMap: 'Digital Map',

  // Feedback & Toasts
  copied: 'Copied to clipboard',
  locationOutside: 'You are outside the demo mouza. Simulate location from the demo menu.',
  searchNotFound: 'Plot not found in this mouza. Try numbers from 101 to 148.',

  // Issue texts — title, body, next — for every IssueCode (DOMAIN_RULES §8)

  // DOUBLE_SALE
  issue_DOUBLE_SALE_title: 'Same land sold twice',
  issue_DOUBLE_SALE_body:
    '{seller} sold {share} decimals of this plot to {firstBuyer} on {firstDate}. On {secondDate} the same share was sold again to {secondBuyer}. The seller has no remaining balance.',
  issue_DOUBLE_SALE_next:
    'Do not pay any advance. Obtain certified copies of both deeds from the Sub-Registry office.',

  // HEIR_OVER_SALE
  issue_HEIR_OVER_SALE_title: 'Heir is selling more than their share',
  issue_HEIR_OVER_SALE_body:
    '{seller} inherited {owned} decimals, but is selling {selling} decimals. See the faraiz calculation below.',
  issue_HEIR_OVER_SALE_next:
    'Verify the correct share with a faraiz specialist. Do not pay advance without consent from all heirs.',

  // OVER_SALE
  issue_OVER_SALE_title: 'Seller is selling more than they own',
  issue_OVER_SALE_body:
    '{seller} owns {owned} decimals of this plot but is selling {selling} decimals. The excess portion will not be included in the deed.',
  issue_OVER_SALE_next: 'Obtain a deed copy from the Sub-Registry office and consult a lawyer.',

  // CHAIN_BREAK
  issue_CHAIN_BREAK_title: 'Seller was never an owner',
  issue_CHAIN_BREAK_body:
    '{seller} has no valid khatian record, deed, or inheritance history for this plot. There is no evidence of ownership.',
  issue_CHAIN_BREAK_next:
    'Do not register a deed if the seller is not in the khatian. Find the true owner.',

  // MUTATION_WITHOUT_DEED
  issue_MUTATION_WITHOUT_DEED_title: 'Mutation without a deed',
  issue_MUTATION_WITHOUT_DEED_body:
    "The deed number referenced in the mutation record was not found in this plot's records. If the deed is invalid, the mutation is also questionable.",
  issue_MUTATION_WITHOUT_DEED_next:
    'Obtain the mutation certificate from the AC Land office and compare it with a copy of the deed from the Sub-Registry.',

  // RECORD_SUM_ERROR
  issue_RECORD_SUM_ERROR_title: 'Record shares do not add up',
  issue_RECORD_SUM_ERROR_body:
    "The ownership shares in this plot's khatian do not sum to 1 (whole). This indicates a data error.",
  issue_RECORD_SUM_ERROR_next:
    'Obtain a certified copy of the khatian from the AC Land office and verify.',

  // KHAS_LAND
  issue_KHAS_LAND_title: 'This is government khas land',
  issue_KHAS_LAND_body:
    'This plot belongs to the Government of Bangladesh Khas Khatian No. 1. Private sale is illegal.',
  issue_KHAS_LAND_next:
    'Khas land cannot be purchased. Confirm at the local land office and do not proceed.',

  // ACQUISITION
  issue_ACQUISITION_title: 'Under government acquisition',
  issue_ACQUISITION_body:
    'This plot is under a government acquisition notice. The owner will receive compensation, but the buyer may not.',
  issue_ACQUISITION_next:
    "Confirm the current status of the acquisition at the District Commissioner's office.",

  // PENDING_CASE
  issue_PENDING_CASE_title: 'There is a pending court case',
  issue_PENDING_CASE_body:
    'Case {caseNo} regarding ownership of this plot is pending in {courtBn}. Title is uncertain until the case is resolved.',
  issue_PENDING_CASE_next:
    'Do not proceed until the case is decided. Find out the current status from the court.',

  // MUTATION_MISMATCH
  issue_MUTATION_MISMATCH_title: 'Mutation does not match the deeds',
  issue_MUTATION_MISMATCH_body:
    'The ownership shares in the mutation record do not match the registered deed. One of them may contain an error.',
  issue_MUTATION_MISMATCH_next:
    'Collect both documents from the AC Land office and Sub-Registry and ask a lawyer to compare them.',

  // ESTATE_LEGAL_REVIEW
  issue_ESTATE_LEGAL_REVIEW_title: "Inheritance needs a lawyer's review",
  issue_ESTATE_LEGAL_REVIEW_body:
    'The inheritance distribution for this plot is complex (e.g. no son, brother or other relatives). Automatic calculation was not possible.',
  issue_ESTATE_LEGAL_REVIEW_next:
    'Determine the shares through a specialist lawyer or a qazi following faraiz rules.',

  // REG_WITHOUT_MUTATION
  issue_REG_WITHOUT_MUTATION_title: 'Deed registered but not mutated',
  issue_REG_WITHOUT_MUTATION_body:
    '{days} days have passed since the deed on {date}, but mutation has not been done. Without mutation, the ownership is not updated in government records.',
  issue_REG_WITHOUT_MUTATION_next:
    'Request to see the mutation papers. Contact the AC Land office.',

  // RAPID_RESALE
  issue_RAPID_RESALE_title: 'Sold again and again in a short time',
  issue_RAPID_RESALE_body:
    'This plot has changed hands {count} times rapidly. This may indicate artificial price inflation or other complications.',
  issue_RAPID_RESALE_next:
    'Collect copies of each deed and verify the purpose of each transaction.',

  // UNDER_DECLARED
  issue_UNDER_DECLARED_title: 'Deed price unusually low',
  issue_UNDER_DECLARED_body:
    'The estimated market value is Tk {marketPrice} per decimal, but the deed declared Tk {declaredPrice} — less than {pct}% of the market value.',
  issue_UNDER_DECLARED_next:
    "Under-declaring increases the buyer's own risk (higher tax on future sale). Declare the correct price.",

  // AREA_MISMATCH
  issue_AREA_MISMATCH_title: 'Recorded area and map area differ',
  issue_AREA_MISMATCH_body:
    'The khatian records {recorded} decimals, but the map measures {measured} decimals ({diff}% difference).',
  issue_AREA_MISMATCH_next:
    'Commission a physical survey and apply to the AC Land office for a correction.',

  // TAX_ARREARS
  issue_TAX_ARREARS_title: 'Land tax is unpaid',
  issue_TAX_ARREARS_body:
    'Land development tax has been paid up to {paidUpToYear}. Outstanding amount: Tk {arrearsBdt}.',
  issue_TAX_ARREARS_next:
    'Pay the outstanding tax at the Union Land Office or online, or have the seller pay it before transfer.',
};
