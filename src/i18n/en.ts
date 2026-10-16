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

  // Map overlay & controls
  oldMap: 'Old Mouza Map',
  digitalMap: 'Digital Map',
  riskColors: 'Risk colours',
  loadingData: 'Loading mouza and land records...',
  dataLoadError: 'Failed to load land data',
  retry: 'Retry',

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

  // Plot Sheet & Summary Tab
  verdictDisclaimer: 'A decision aid, not a title certificate',
  landClass_bastu: 'Homestead',
  landClass_nal: 'Agricultural land',
  landClass_vita: 'Highland',
  landClass_pukur: 'Pond',
  landClass_doba: 'Ditch',
  landClass_karkhana: 'Factory',
  landClass_commercial: 'Commercial',

  // Owners & Claims
  currentOwners: 'Current Legal Owners',
  disputedClaims: 'Disputed Claims',
  disputedClaimNotice:
    'Transfers claimed by these individuals were invalid or unauthorized under land law.',
  estatesInReview: 'Estates Under Legal Review',
  estatesInReviewNotice:
    'Special inheritance laws or heir structures apply, requiring formal legal review.',
  acquiredRecord: 'By Survey Record',
  acquiredDeed: 'By Purchase Deed',
  acquiredInheritance: 'By Inheritance',
  claimDeedRef: 'Deed Reference',
  estateReason: 'Review Reason',

  // Evidence & Actions
  evidence: 'Evidence & Records',
  whatToDo: 'What to do next',
  viewInTimeline: 'View in Timeline',
  noIssuesFound: 'No visible errors or risks were found in this plot’s records.',
  summaryClosingClean:
    'If records and mutation are up to date, you may proceed by inspecting original deeds at the Sub-Registry.',
  summaryClosingWarning:
    'Do not pay any advance or proceed with financial transactions until the above cautions are resolved.',
  summaryClosingCritical:
    'Critical title defects exist for this plot. Halt all transactions and advance payments immediately.',

  // Timeline & History
  filterAll: 'All',
  filterRecord: 'Record',
  filterDeed: 'Deed',
  filterMutation: 'Mutation',
  filterInheritance: 'Inheritance',
  filterCase: 'Case',
  invalidEventBadge: 'Invalid or Void Transaction',
  surveyCS: 'CS (1932)',
  surveySA: 'SA (1962)',
  surveyRS: 'RS (1987)',
  surveyBS: 'BS (2011)',
  viewFamilyTree: 'View Faraiz Family Tree',
  closeFamilyTree: 'Close Family Tree',
  khatian: 'Khatian',
  khatianNo: 'Khatian No.',
  deedNo: 'Deed No.',
  caseNo: 'Case No.',
  sale: 'Sale',
  gift: 'Gift',
  landTaxPayment: 'Land Development Tax Payment',
  paidUpTo: 'Paid up to year',
  arrears: 'Arrears',
  heirCount: '{n} heirs',
  muslimLaw: 'Muslim Law',
  hinduLaw: 'Hindu Law',
  courtStatusPending: 'Pending',
  courtStatusDisposed: 'Disposed',
  statusLabel: 'Status',
  inheritanceDistribution: 'Inheritance Distribution',

  // Family Tree & Inheritance
  deceased: 'Deceased',
  heir: 'Heir',
  relation: 'Relation',
  faraizShare: 'Faraiz Share',
  entitledArea: 'Entitled Area',
  soldArea: 'Sold Area',
  excessSold: 'Excess Sold',
  faraizLegalReviewRequired: 'Complex inheritance — Legal review required',
  faraizDisclaimer: 'Common cases calculation — Not formal legal advice',
  relation_wife: 'Wife',
  relation_husband: 'Husband',
  relation_father: 'Father',
  relation_mother: 'Mother',
  relation_son: 'Son',
  relation_daughter: 'Daughter',

  // Skeletons / Upcoming tabs
  priceComingSoon: 'Market Price Estimate & Comps',
  priceComingSoonDesc:
    'Estimated market valuation and comparative sales analysis based on nearby deeds coming in next release.',
  costComingSoon: 'Registration Fees & Total Cost',
  costComingSoonDesc:
    'Complete government fee breakdown including stamp duty, source tax, and mutation fee coming in next release.',

  // Price Tab & Comparable Sales
  priceTitle: 'Estimated Market Value',
  priceDisclaimer: 'Estimated based on recent registered deeds of the same land class nearby',
  pricePerDecimal: 'Per decimal',
  priceTotalPlot: 'Entire plot ({area} dec)',
  priceRulerLow: 'Low',
  priceRulerMid: 'Average',
  priceRulerHigh: 'High',
  priceRulerRange: 'Market price range',
  priceRoadAdjustment: 'Road-facing +15% price adjustment applied',
  priceCompsCount: 'Based on {n} comparable sales',
  priceCompsToggleShow: 'View comparable sales',
  priceCompsToggleHide: 'Hide comparable sales',
  priceCompsTitle: 'Nearby Recent Registered Deeds',
  priceInsufficientTitle: 'Insufficient Recent Sales Data',
  priceInsufficientDesc:
    'Not enough recent sales of the same land class were found within 500–1000m of this plot.',
  compHeaderDag: 'Dag',
  compHeaderDeed: 'Deed No.',
  compHeaderDate: 'Date',
  compHeaderDistance: 'Distance',
  compHeaderPrice: 'Price / dec',
  compHeaderStatus: 'Status',
  compStatusUsed: 'Used',
  compStatusExcluded: 'Excluded',
  compExclude_underDeclared: 'Unusually low (suspected tax evasion)',
  compExclude_outlier: 'Statistical outlier',
  compExclude_distance: 'Too far away',
  compExclude_otherLandClass: 'Different land class',
  compExclude_old: 'Older than 24 months',
  compExclude_self: 'Same plot',
  metersUnit: '{n} m',

  // Cost Calculator (P1-T10)
  costTitle: 'Total Land Acquisition Cost',
  costSubtitle: 'Transparent breakdown of official fees, taxes and total expenses',
  declaredPriceLabel: 'Declared Land Deed Price',
  declaredPriceHint: 'Suggested based on estimated market rate (editable)',
  perDecimalPrice: '{amount} per decimal',
  buyerPaysSourceTaxLabel: 'Source Tax Paid by Buyer',
  buyerPaysSourceTaxNote:
    "By law this is the seller's tax, but in practice buyers often pay it; agree in writing beforehand (TBS, May 2025).",
  demoRatesChip: 'Demo Official Rates',
  demoRatesLabel: 'Demo rates — verify with official calculation before actual use',
  sourcesModalTitle: 'Official Sources & Gazettes for Fees',
  sourcesModalClose: 'Close',
  sourcesVerifiedNotice:
    'Rates shown are demo references. Please verify with latest National Board of Revenue (NBR) and Ministry of Land circulars before registration.',
  underDeclaredWarningTitle: 'Under-declaring Deed Price is Illegal & Risky',
  underDeclaredWarningDesc:
    'The average market price is {marketMid} per decimal. You entered {enteredMid} per decimal (below 50% of market value). Under-reporting creates severe capital gains tax exposure upon subsequent resales and risks legal investigation.',
  costTableItem: 'Fee / Tax Item',
  costTableRate: 'Rate',
  costTableAmount: 'Amount',
  costLandPriceRow: 'Land Price',
  costGovtFeesTotalRow: 'Total Government Fees & Taxes',
  costGrandTotalRow: 'Grand Total (Price + Fees)',
  costEffectiveRate: 'Approx {rate}% government expenses over land price',
  mutationBreakdownToggle: 'Mutation fee breakdown',
  fixedFeesBreakdownToggle: 'Fixed fees breakdown',
  summaryCostLine: 'Total cost approx {total} (Land price + {fees} fees & taxes)',
  viewCostDetails: 'View Cost Details',
  stepDown50k: '-50,000',
  stepUp50k: '+50,000',
  resetEstimatePrice: 'Reset to market rate',
  costLine_stampDuty: 'Stamp Duty',
  costLine_registrationFee: 'Registration Fee',
  costLine_localGovtTax: 'Local Government Tax',
  costLine_sourceTax: 'Source Tax (Capital Gains Tax)',
  costLine_fixedFees: 'Fixed Government Fees (E-fee, N-fee, Court fee, Stamp)',
  costLine_mutationFee: 'E-Mutation Fee',
  costLine_landTaxArrears: 'Unpaid Land Development Tax',

  // Search, GPS & Demo Panel (P1-T11)
  plotMismatchWarning: 'Plot Mismatch Warning',
  plotMismatchBody: 'You are standing on Dag {gps}, but viewing Dag {selected}.',
  plotMismatchAdvice:
    'Verify deed boundaries to confirm whether the seller is presenting an incorrect plot.',
  gpsCurrentLocation: 'You are on Dag {n}',
  gpsFindLocation: 'Find my location',
  gpsLocating: 'Locating...',
  gpsLocationFound: 'Location found',
  gpsPermissionHelp: 'Location Permission Help',
  gpsPermissionTitle: 'Allow Location (GPS)',
  gpsPermissionDesc: 'GPS is needed to detect which plot you are on',
  demoPanelTitle: 'Demo Control Panel',
  demoPanelSubtitle: 'Tools to showcase hackathon scenarios and test GPS simulations',
  simulateLocationTitle: 'Simulate GPS Location',
  simulateLocationDesc:
    'Simulate standing on a specific plot to demonstrate field checks and plot mismatch warnings.',
  simulateLocationSelectDag: 'Select Dag:',
  simulateLocationBtn: 'Simulate Location',
  simulateLocationStop: 'Stop Simulation',
  simulateLocationActive: 'Simulation Active',
  simulateLocationActiveMsg: 'Currently simulated standing on Dag {n}',
  demoScenariosTitle: '12 Special Demo Scenarios',
  demoScenariosSubtitle: 'Tap to navigate to plot',
  resetDemoBtn: 'Reset Demo',
  resetDemoSuccess: 'Demo reset successfully',
  viewDeedRecords: 'View records',
  matchedSurvey: 'Matched {survey} {n}',
  searchHint: 'Search by modern BS or historical survey dag numbers',
  searchExamples: 'E.g.: 101, 103, CS 1, SA 12, RS 201',

  // Polish & Demo Pass (P1-T12)
  firstOpenHint: 'Tap any plot on the map',
  somethingWentWrong: 'Something went wrong',
  somethingWentWrongDesc:
    'An unexpected issue occurred. Please tap below to reload or reset the view.',
  tryAgain: 'Try Again',
  pageNotFound: 'Page Not Found (404)',
  pageNotFoundDesc: 'The page you are looking for does not exist or has been moved.',
  backToMap: 'Back to Map',
  plotNotFound: 'Plot #{n} not found',
  plotNotFoundDesc: 'This mouza contains plots from 101 to 148.',
  goToFirstDag: 'Go to Plot 101',
  aboutSubtitle: 'Know your land family tree before buying',
  aboutWhatIsTitle: 'What is this and why?',
  aboutWhatIsDesc:
    'Jomi Bongsho is a map-first PWA where land buyers tap any plot to inspect ownership history, check faraiz inheritance limits, discover authentic market values, and calculate total government registration costs. Built for LandTech 2026 (DIU) Hackathon.',
  aboutDisclaimerTitle: 'Demo Data Notice (Not Real Records)',
  aboutDisclaimerDesc:
    'Every name, plot number, khatian, and deed in this app is synthetic demo data. No government portal (land.gov.bd or eporcha) was scraped or queried. This is a pre-purchase decision support prototype, not an official certificate of title.',
  aboutSourcesTitle: 'Data Sources',
  aboutSourcesMouza:
    'Synthetic demo mouza: "Notun Char", Manikganj Sadar (seed: jomi-bongsho-2026)',
  aboutSourcesMap: 'Basemap: OpenFreeMap © OpenMapTiles, data © OpenStreetMap contributors',
  aboutSourcesFees:
    'Statutory fee rates: Ministry of Finance & Sub-Registry gazette reports (FY2025-26 Budget)',
  aboutAiTitle: 'AI Tools Disclosure',
  aboutAiDesc:
    'Google Antigravity IDE with Gemini models was used for code generation and refactoring. All land domain rules (share ledger, faraiz, fraud checks) were strictly designed by our team and verified with 100% automated tests.',
  aboutCreditsTitle: 'Open-Source Credits',
  aboutCreditsDesc:
    'MapLibre GL JS, Turf.js, fraction.js, Zustand, React Router, Tailwind CSS, Motion, Lucide Icons, Vite, Vitest, and @fontsource font packages.',
  aboutVersion: 'Version: 0.1.0 (Round 1 Prototype)',
  installedApp: 'App is installed',
};
