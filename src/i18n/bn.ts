export const bn = {
  // App brand & header
  appName: 'জমি বংশ',
  appTagline: 'জমির খতিয়ান, মালিকানা ও ঝুঁকি যাচাই',
  watermark: 'ডেমো ডেটা – বাস্তব রেকর্ড নয়',
  demoNotice: 'শুধু প্রদর্শনের জন্য',

  // Navigation & Menu
  menu: 'মেনু',
  home: 'মানচিত্র',
  about: 'সম্পর্কে',
  verify: 'যাচাই',
  present: 'উপস্থাপনা',
  devUi: 'ইউআই প্রিভিউ',
  demo: 'ডেমো',
  install: 'ইনস্টল করুন',
  iosInstallHint:
    'অ্যাপটি ইনস্টল করতে Safari-র নিচে শেয়ার বোতাম চেপে "হোম স্ক্রিনে যোগ করুন" চাপুন।',
  updateReady: 'নতুন সংস্করণ প্রস্তুত আছে',
  updateAction: 'রিফ্রেশ',
  offlineReady: 'অ্যাপটি অফলাইনে ব্যবহারের জন্য প্রস্তুত',
  language: 'ভাষা',
  theme: 'থিম',
  themeLight: 'লাইট',
  themeDark: 'ডার্ক',
  themeSystem: 'স্বয়ংক্রিয়',

  // Common actions
  search: 'অনুসন্ধান',
  searchPlaceholder: 'দাগ নম্বর লিখুন...',
  close: 'বন্ধ করুন',
  back: 'পেছনে',
  cancel: 'বাতিল',
  confirm: 'নিশ্চিত করুন',
  save: 'সংরক্ষণ',
  actionShare: 'শেয়ার',
  loading: 'লোড হচ্ছে...',
  details: 'বিস্তারিত',
  calculate: 'হিসাব করুন',
  refresh: 'রিফ্রেশ',
  seeIssues: '{n}টি বিষয় দেখুন',

  // Verdicts
  verdictOk: 'ঝুঁকি পাওয়া যায়নি',
  verdictWarn: 'সতর্কতা',
  verdictBad: 'ঝুঁকিপূর্ণ',

  // Sheet & Tabs
  tabSummary: 'সারসংক্ষেপ',
  tabHistory: 'ইতিহাস',
  tabPrice: 'দাম',
  tabCost: 'খরচ',

  // Land concepts
  dag: 'দাগ',
  dagNo: 'দাগ নম্বর',
  area: 'জমির পরিমাণ',
  decimalUnit: 'শতাংশ',
  kathaUnit: 'কাঠা',
  takaUnit: 'টাকা',
  owners: 'মালিকগণ',
  ownershipShare: 'অংশ',

  // Map overlay & controls
  oldMap: 'পুরনো নকশা',
  digitalMap: 'মানচিত্র',
  riskColors: 'ঝুঁকির রঙ',
  loadingData: 'মৌজা ও খতিয়ান ডেটা লোড হচ্ছে...',
  dataLoadError: 'ডেটা লোড করতে সমস্যা হয়েছে',
  retry: 'আবার চেষ্টা করুন',

  // Feedback & Toasts
  copied: 'কপি করা হয়েছে',
  locationOutside: 'আপনি ডেমো মৌজার বাইরে আছেন। ডেমো মেনু থেকে অবস্থান অনুকরণ করুন।',
  searchNotFound: 'এই দাগ নম্বরটি এই মৌজায় নেই। ১০১ থেকে ১৪৮ পর্যন্ত চেষ্টা করুন।',

  // Issue texts — title, body, next — for every IssueCode (DOMAIN_RULES §8)
  // Body params are in {curly} and are interpolated at display time.

  // DOUBLE_SALE
  issue_DOUBLE_SALE_title: 'একই জমি দুইবার বিক্রি',
  issue_DOUBLE_SALE_body:
    '{seller} এই দাগের {share} শতাংশ {firstDate} তারিখে {firstBuyer}-এর কাছে বিক্রি করেছেন। {secondDate} তারিখে আবার একই অংশ {secondBuyer}-এর কাছে বিক্রি দেখানো হয়েছে। তাঁর হাতে এখন বিক্রির মতো জমি নেই।',
  issue_DOUBLE_SALE_next:
    'আগাম টাকা দেবেন না। সাব-রেজিস্ট্রি অফিসে দুই দলিলের সার্টিফায়েড কপি তুলুন।',

  // HEIR_OVER_SALE
  issue_HEIR_OVER_SALE_title: 'ওয়ারিশ তার অংশের বেশি বিক্রি করছেন',
  issue_HEIR_OVER_SALE_body:
    '{seller} উত্তরাধিকার সূত্রে {owned} শতাংশ পেয়েছেন, কিন্তু বিক্রি করছেন {selling} শতাংশ। নিচের ফারায়েজ হিসাব দেখুন।',
  issue_HEIR_OVER_SALE_next:
    'ফারায়েজ বিশেষজ্ঞের মাধ্যমে আসল অংশ নিশ্চিত করুন। সব ওয়ারিশের সম্মতি ছাড়া বায়না করবেন না।',

  // OVER_SALE
  issue_OVER_SALE_title: 'বিক্রেতার যতটুকু আছে তার বেশি বিক্রি',
  issue_OVER_SALE_body:
    '{seller} এই দাগে {owned} শতাংশের মালিক, কিন্তু {selling} শতাংশ বিক্রি করছেন। অতিরিক্ত অংশ দলিলে অন্তর্ভুক্ত হবে না।',
  issue_OVER_SALE_next: 'সাব-রেজিস্ট্রি অফিস থেকে দলিলের কপি নিয়ে আইনজীবীর সাথে পরামর্শ করুন।',

  // CHAIN_BREAK
  issue_CHAIN_BREAK_title: 'বিক্রেতা কখনো মালিক ছিলেন না',
  issue_CHAIN_BREAK_body:
    '{seller} এই দাগের কোনো বৈধ রেকর্ড, দলিল বা উত্তরাধিকার সূত্রে মালিক হননি। মালিকানার কোনো প্রমাণ নেই।',
  issue_CHAIN_BREAK_next:
    'খতিয়ানে নাম না থাকলে দলিল রেজিস্ট্রি করবেন না। প্রকৃত মালিককে খুঁজে বের করুন।',

  // MUTATION_WITHOUT_DEED
  issue_MUTATION_WITHOUT_DEED_title: 'দলিল ছাড়া নামজারি',
  issue_MUTATION_WITHOUT_DEED_body:
    'নামজারিতে উল্লিখিত দলিল নম্বর এই দাগের নথিতে পাওয়া যায়নি। দলিলটি বৈধ না হলে নামজারিও প্রশ্নবিদ্ধ।',
  issue_MUTATION_WITHOUT_DEED_next:
    'AC Land অফিস থেকে নামজারির সনদ ও সাব-রেজিস্ট্রি থেকে দলিলের কপি নিয়ে মিলিয়ে দেখুন।',

  // RECORD_SUM_ERROR
  issue_RECORD_SUM_ERROR_title: 'খতিয়ানের অংশ মিলছে না',
  issue_RECORD_SUM_ERROR_body:
    'এই দাগের খতিয়ানে মালিকদের অংশের সমষ্টি ১ (সম্পূর্ণ) হচ্ছে না। এটি ডেটার ত্রুটি নির্দেশ করে।',
  issue_RECORD_SUM_ERROR_next: 'AC Land অফিস থেকে সার্টিফায়েড খতিয়ান কপি তুলে যাচাই করুন।',

  // KHAS_LAND
  issue_KHAS_LAND_title: 'এটি সরকারি খাস জমি',
  issue_KHAS_LAND_body:
    'এই দাগটি বাংলাদেশ সরকারের ১ নং খাস খতিয়ানের আওতাভুক্ত। ব্যক্তিগত বিক্রি বেআইনি।',
  issue_KHAS_LAND_next:
    'খাস জমি কেনা যায় না। স্থানীয় ভূমি অফিসে নিশ্চিত করুন এবং ক্রয় থেকে বিরত থাকুন।',

  // ACQUISITION
  issue_ACQUISITION_title: 'সরকারি অধিগ্রহণের আওতায়',
  issue_ACQUISITION_body:
    'এই দাগটি সরকারি অধিগ্রহণের নোটিশের আওতায় রয়েছে। মালিক ক্ষতিপূরণ পাবেন কিন্তু ক্রেতা নাও পেতে পারেন।',
  issue_ACQUISITION_next: 'জেলা প্রশাসকের কার্যালয় থেকে অধিগ্রহণের বর্তমান অবস্থা নিশ্চিত করুন।',

  // PENDING_CASE
  issue_PENDING_CASE_title: 'চলমান মামলা আছে',
  issue_PENDING_CASE_body:
    'এই দাগের মালিকানা নিয়ে {courtBn}-এ {caseNo} মামলা চলমান রয়েছে। মামলা শেষ না হওয়া পর্যন্ত স্বত্ব অনিশ্চিত।',
  issue_PENDING_CASE_next:
    'মামলার রায় না হওয়া পর্যন্ত ক্রয় থেকে বিরত থাকুন। আদালত থেকে মামলার বর্তমান অবস্থা জেনে নিন।',

  // MUTATION_MISMATCH
  issue_MUTATION_MISMATCH_title: 'নামজারি ও দলিলের তথ্য মেলে না',
  issue_MUTATION_MISMATCH_body:
    'নামজারিতে মালিকানার ভাগ দলিলের সাথে মিলছে না। কোনো একটি ভুল থাকতে পারে।',
  issue_MUTATION_MISMATCH_next:
    'AC Land অফিস ও সাব-রেজিস্ট্রি থেকে উভয় নথি সংগ্রহ করে আইনজীবীকে দিয়ে মিলিয়ে দেখান।',

  // ESTATE_LEGAL_REVIEW
  issue_ESTATE_LEGAL_REVIEW_title: 'ওয়ারিশ বণ্টন আইনজীবীকে দিয়ে যাচাই করুন',
  issue_ESTATE_LEGAL_REVIEW_body:
    'এই দাগের উত্তরাধিকার বণ্টন জটিল (যেমন: পুত্র নেই, ভাই বা অন্য আত্মীয়)। স্বয়ংক্রিয় হিসাব সম্ভব হয়নি।',
  issue_ESTATE_LEGAL_REVIEW_next:
    'একজন বিশেষজ্ঞ আইনজীবী বা কাজির মাধ্যমে ফারায়েজ অনুযায়ী অংশ নির্ধারণ করুন।',

  // REG_WITHOUT_MUTATION
  issue_REG_WITHOUT_MUTATION_title: 'দলিল হয়েছে কিন্তু নামজারি হয়নি',
  issue_REG_WITHOUT_MUTATION_body:
    '{date} তারিখের দলিলের পর {days} দিন পার হলেও নামজারি হয়নি। নামজারি না হলে সরকারি রেকর্ডে মালিকানা আপডেট হয় না।',
  issue_REG_WITHOUT_MUTATION_next: 'নামজারির কাগজ দেখতে চান। AC Land অফিসে যোগাযোগ করুন।',

  // RAPID_RESALE
  issue_RAPID_RESALE_title: 'অল্প সময়ে বারবার হাতবদল',
  issue_RAPID_RESALE_body:
    'এই দাগটি {count} বার দ্রুত হাতবদল হয়েছে। এটি কৃত্রিম মূল্যবৃদ্ধি বা অন্য জটিলতার ইঙ্গিত হতে পারে।',
  issue_RAPID_RESALE_next: 'প্রতিটি দলিলের কপি সংগ্রহ করুন ও ক্রয়ের উদ্দেশ্য যাচাই করুন।',

  // UNDER_DECLARED
  issue_UNDER_DECLARED_title: 'দলিলে দাম অস্বাভাবিক কম',
  issue_UNDER_DECLARED_body:
    'এই দাগের আনুমানিক বাজারমূল্য প্রতি শতাংশ {marketPrice} টাকা, কিন্তু দলিলে দেখানো হয়েছে {declaredPrice} টাকা — যা বাজারমূল্যের {pct}% এরও কম।',
  issue_UNDER_DECLARED_next:
    'কম দামে দলিল করলে ক্রেতার নিজের ঝুঁকি বাড়ে (পরবর্তী বিক্রিতে বেশি কর)। সঠিক দাম লিখুন।',

  // AREA_MISMATCH
  issue_AREA_MISMATCH_title: 'রেকর্ডের পরিমাণ ও নকশার মাপ মেলে না',
  issue_AREA_MISMATCH_body:
    'খতিয়ানে জমির পরিমাণ {recorded} শতাংশ, কিন্তু নকশায় মাপা হয়েছে {measured} শতাংশ ({diff}% পার্থক্য)।',
  issue_AREA_MISMATCH_next:
    'সরেজমিনে জরিপকারী দিয়ে মাপ নিন এবং AC Land থেকে সংশোধনের জন্য আবেদন করুন।',

  // TAX_ARREARS
  issue_TAX_ARREARS_title: 'ভূমি উন্নয়ন কর বকেয়া',
  issue_TAX_ARREARS_body:
    '{paidUpToYear} সাল পর্যন্ত কর দেওয়া হয়েছে। বকেয়া পরিমাণ {arrearsBdt} টাকা।',
  issue_TAX_ARREARS_next:
    'ইউনিয়ন ভূমি অফিস বা অনলাইনে বকেয়া কর পরিশোধ করুন অথবা বিক্রেতাকে দিয়ে পরিশোধ করিয়ে নিন।',

  // Plot Sheet & Summary Tab
  verdictDisclaimer: 'এটি সিদ্ধান্তে সহায়তা, মালিকানার সনদ নয়',
  landClass_bastu: 'বাস্তু (ভিটা/বাড়ি)',
  landClass_nal: 'নাল (কৃষি জমি)',
  landClass_vita: 'ভিটা (উঁচু জমি)',
  landClass_pukur: 'পুকুর',
  landClass_doba: 'ডোবা/নালা',
  landClass_karkhana: 'কারখানা',
  landClass_commercial: 'বাণিজ্যিক',

  // Owners & Claims
  currentOwners: 'বর্তমান বৈধ মালিকগণ',
  disputedClaims: 'বিরোধপূর্ণ দাবি',
  disputedClaimNotice:
    'এই ব্যক্তিদের কাছে পূর্বে বা অননুমোদিতভাবে জমি হস্তান্তরের দাবি রয়েছে, যা আইনত সিদ্ধ হয়নি।',
  estatesInReview: 'আইনি পর্যালোচনাধীন এস্টেট',
  estatesInReviewNotice:
    'উত্তরাধিকার বণ্টনে বিশেষ আইন প্রযোজ্য হওয়ায় বা ওয়ারিশ জটিলতায় আইনি পর্যালোচনা প্রয়োজন।',
  acquiredRecord: 'রেকর্ড সূত্রে',
  acquiredDeed: 'দলিল সূত্রে',
  acquiredInheritance: 'ওয়ারিশ সূত্রে',
  claimDeedRef: 'দলিল রেফারেন্স',
  estateReason: 'পর্যালোচনার কারণ',

  // Evidence & Actions
  evidence: 'নথি ও সংশ্লিষ্ট প্রমাণ',
  whatToDo: 'কী করবেন',
  viewInTimeline: 'ইতিহাসে দেখুন',
  noIssuesFound: 'এই দাগের নথিপত্রে কোনো দৃশ্যমান ত্রুটি বা ঝুঁকি পাওয়া যায়নি।',
  summaryClosingClean:
    'রেকর্ড ও নামজারি হালনাগাদ থাকলে সাব-রেজিস্ট্রি অফিসে মূল দলিল দেখে ক্রয় প্রক্রিয়া এগিয়ে নিতে পারেন।',
  summaryClosingWarning:
    'উপরে উল্লেখিত সতর্কতাগুলো সমাধানের পূর্বে কোনো প্রকার বায়না বা আর্থিক লেনদেন করা থেকে বিরত থাকুন।',
  summaryClosingCritical:
    'এই জমি ক্রয়ে গুরুতর আইনি ঝুঁকি বিদ্যমান। দলিল রেজিস্ট্রি বা বায়না সম্পূর্ণ স্থগিত রাখুন।',

  // Timeline & History
  filterAll: 'সব',
  filterRecord: 'রেকর্ড',
  filterDeed: 'দলিল',
  filterMutation: 'নামজারি',
  filterInheritance: 'ওয়ারিশ',
  filterCase: 'মামলা',
  invalidEventBadge: 'অবৈধ বা বাতিল লেনদেন',
  surveyCS: 'সিএস (১৯৩২)',
  surveySA: 'এসএ (১৯৬২)',
  surveyRS: 'আরএস (১৯৮৭)',
  surveyBS: 'বিএস (২০১১)',
  viewFamilyTree: 'ফারায়েজ বণ্টন চিত্র',
  closeFamilyTree: 'বংশলতিকা বন্ধ করুন',
  khatian: 'খতিয়ান',
  khatianNo: 'খতিয়ান নং',
  deedNo: 'দলিল নং',
  caseNo: 'কেস নং',
  sale: 'বিক্রয়',
  gift: 'দান',
  landTaxPayment: 'ভূমি উন্নয়ন কর পরিশোধ',
  paidUpTo: 'সাল পর্যন্ত পরিশোধিত',
  arrears: 'বকেয়া',
  heirCount: '{n} জন ওয়ারিশ',
  muslimLaw: 'মুসলিম আইন',
  hinduLaw: 'হিন্দু আইন',
  courtStatusPending: 'চলমান',
  courtStatusDisposed: 'নিষ্পত্তি',
  statusLabel: 'অবস্থা',
  inheritanceDistribution: 'উত্তরাধিকার বণ্টন',

  // Family Tree & Inheritance
  deceased: 'মরহুম',
  heir: 'ওয়ারিশ',
  relation: 'সম্পর্ক',
  faraizShare: 'ফারায়েজ অংশ',
  entitledArea: 'প্রাপ্য জমি',
  soldArea: 'বিক্রিকৃত জমি',
  excessSold: 'অতিরিক্ত বিক্রয়',
  faraizLegalReviewRequired: 'ওয়ারিশ বণ্টনে জটিলতা — আইনি পর্যালোচনা প্রয়োজন',
  faraizDisclaimer: 'সাধারণ ক্ষেত্রের হিসাব — আইনি পরামর্শ নয়',
  relation_wife: 'স্ত্রী',
  relation_husband: 'স্বামী',
  relation_father: 'পিতা',
  relation_mother: 'মাতা',
  relation_son: 'পুত্র',
  relation_daughter: 'কন্যা',

  // Skeletons / Upcoming tabs
  priceComingSoon: 'বাজারমূল্য ও তুলনামূলক বিক্রির হিসাব',
  priceComingSoonDesc:
    'কাছাকাছি একই শ্রেণির জমির সাম্প্রতিক রেজিস্ট্রি দলিলের ভিত্তিতে আনুমানিক মূল্য ও তুলনামূলক বিশ্লেষণ পরবর্তী ধাপে আসছে।',
  costComingSoon: 'রেজিস্ট্রেশন ফি ও মোট খরচের হিসাব',
  costComingSoonDesc:
    'স্ট্যাম্প শুল্ক, উৎসে কর, স্থানীয় কর ও নামজারি ফিসহ জমি কেনার সম্পূর্ণ ও নির্ভুল সরকারি খরচ ক্যালকুলেটর পরবর্তী ধাপে আসছে।',

  // Price Tab & Comparable Sales
  priceTitle: 'আনুমানিক বাজারমূল্য',
  priceDisclaimer: 'কাছাকাছি একই শ্রেণির জমির সাম্প্রতিক রেজিস্ট্রি দলিলের ভিত্তিতে আনুমানিক হিসাব',
  pricePerDecimal: 'প্রতি শতাংশ',
  priceTotalPlot: 'পুরো দাগ ({area} শতাংশ)',
  priceRulerLow: 'সর্বনিম্ন',
  priceRulerMid: 'গড় দর',
  priceRulerHigh: 'সর্বোচ্চ',
  priceRulerRange: 'বাজারমূল্য সীমা',
  priceRoadAdjustment: 'রাস্তার পাশে হওয়ায় +১৫% মূল্য সমন্বয়',
  priceCompsCount: '{n}টি বিক্রির তথ্যের ভিত্তিতে',
  priceCompsToggleShow: 'বিক্রির তুলনামূলক তালিকা দেখুন',
  priceCompsToggleHide: 'তালিকা বন্ধ করুন',
  priceCompsTitle: 'কাছাকাছি সাম্প্রতিক রেজিস্ট্রি দলিল',
  priceInsufficientTitle: 'পর্যাপ্ত সাম্প্রতিক বিক্রির তথ্য নেই',
  priceInsufficientDesc:
    'এই দাগের ৫০০–১০০০ মিটারের মধ্যে একই শ্রেণির জমির প্রয়োজনীয় সংখ্যক সাম্প্রতিক বিক্রয় দলিল পাওয়া যায়নি।',
  compHeaderDag: 'দাগ',
  compHeaderDeed: 'দলিল নং',
  compHeaderDate: 'তারিখ',
  compHeaderDistance: 'দূরত্ব',
  compHeaderPrice: 'দর (প্রতি শতাংশ)',
  compHeaderStatus: 'অবস্থা',
  compStatusUsed: 'ব্যবহৃত',
  compStatusExcluded: 'বাদ দেওয়া',
  compExclude_underDeclared: 'অস্বাভাবিক কম দাম (কর ফাঁকির সন্দেহ)',
  compExclude_outlier: 'গড় থেকে বেশি বিচ্যুত (আউটলায়ার)',
  compExclude_distance: 'দূরত্ব বেশি',
  compExclude_otherLandClass: 'ভিন্ন শ্রেণি',
  compExclude_old: '২৪ মাসের পুরনো',
  compExclude_self: 'একই দাগ',
  metersUnit: '{n} মিটার',

  // Cost Calculator (P1-T10)
  costTitle: 'জমি ক্রয়ের মোট খরচের হিসাব',
  costSubtitle: 'সরকারি ফি, কর এবং মোট ব্যয়ের স্বচ্ছ হিসাব',
  declaredPriceLabel: 'দলিলে ঘোষিত জমির দাম',
  declaredPriceHint: 'আনুমানিক বাজারদরের ভিত্তিতে প্রস্তাবিত (সম্পাদনাযোগ্য)',
  perDecimalPrice: 'প্রতি শতাংশে {amount}',
  buyerPaysSourceTaxLabel: 'ক্রেতা কর্তৃক উৎসে কর পরিশোধ',
  buyerPaysSourceTaxNote:
    'আইন অনুযায়ী এটি বিক্রেতার কর, তবে বাস্তবে অনেক সময় ক্রেতা পরিশোধ করেন; বায়নার পূর্বে লিখিতভাবে স্পষ্ট করে নিন (টিবিএস, মে ২০২৫)।',
  demoRatesChip: 'ডেমো সরকারি হার',
  demoRatesLabel: 'ডেমো হার — ব্যবহারের আগে সরকারি হিসাবের সাথে মিলিয়ে নিন',
  sourcesModalTitle: 'ফি ও করের সরকারি সূত্র ও গ্যাজেট',
  sourcesModalClose: 'বন্ধ করুন',
  sourcesVerifiedNotice:
    'প্রদর্শিত হারগুলো ডেমো হিসেবে ব্যবহৃত হয়েছে। জমি রেজিস্ট্রির পূর্বে জাতীয় রাজস্ব বোর্ড (NBR) ও ভূমি মন্ত্রণালয়ের হালনাগাদ সার্কুলার দেখে নিন।',
  underDeclaredWarningTitle: 'দলিলে কম দাম দেখানো বেআইনি এবং ঝুঁকিপূর্ণ',
  underDeclaredWarningDesc:
    'এই দাগের গড় বাজারমূল্য প্রতি শতাংশে {marketMid} টাকা। আপনি দেখাচ্ছেন প্রতি শতাংশে {enteredMid} টাকা (বাজারদরের ৫০% এর কম)। দলিলের দাম কম দেখালে ভবিষ্যতে জমি বিক্রিতে অস্বাভাবিক বেশি মূলধনী কর দিতে হবে এবং আইনি জটিলতার ঝুঁকি তৈরি হয়।',
  costTableItem: 'ফি ও করের খাত',
  costTableRate: 'হার',
  costTableAmount: 'টাকার পরিমাণ',
  costLandPriceRow: 'জমির মূল দাম',
  costGovtFeesTotalRow: 'মোট সরকারি ফি ও কর',
  costGrandTotalRow: 'সর্বমোট খরচ (জমির দাম + ফি)',
  costEffectiveRate: 'জমির মূল্যের ওপর প্রায় {rate}% সরকারি ব্যয়',
  mutationBreakdownToggle: 'নামজারি ফি বিবরণ',
  fixedFeesBreakdownToggle: 'নির্দিষ্ট ফি বিবরণ',
  summaryCostLine: 'মোট খরচ প্রায় {total} (জমির দাম + {fees} ফি ও কর)',
  viewCostDetails: 'খরচের বিস্তারিত',
  stepDown50k: '-৫০,০০০',
  stepUp50k: '+৫০,০০০',
  resetEstimatePrice: 'বাজারদরে রিসেট',
  costLine_stampDuty: 'স্ট্যাম্প শুল্ক',
  costLine_registrationFee: 'রেজিস্ট্রেশন ফি',
  costLine_localGovtTax: 'স্থানীয় সরকার কর',
  costLine_sourceTax: 'উৎসে কর (মূলধনী লাভ কর)',
  costLine_fixedFees: 'নির্দিষ্ট সরকারি ফি (ই-ফি, এন-ফি, কোর্ট ফি, স্ট্যাম্প)',
  costLine_mutationFee: 'ই-নামজারি ফি',
  costLine_landTaxArrears: 'বকেয়া ভূমি উন্নয়ন কর',

  // Search, GPS & Demo Panel (P1-T11)
  plotMismatchWarning: 'জমির দাগ অমিল সতর্কবার্তা',
  plotMismatchBody: 'আপনি দাগ {gps}-এ দাঁড়িয়ে আছেন, কিন্তু দেখছেন দাগ {selected}।',
  plotMismatchAdvice:
    'বিক্রেতা আপনাকে অন্য বা ভুল দাগ দেখাচ্ছেন কি না সাব-রেজিস্ট্রি দলিলের চৌহদ্দি দেখে নিশ্চিত হোন।',
  gpsCurrentLocation: 'আপনি দাগ {n}-এ আছেন',
  gpsFindLocation: 'আমার অবস্থান খুঁজুন',
  gpsLocating: 'অবস্থান খোঁজা হচ্ছে...',
  gpsLocationFound: 'অবস্থান পাওয়া গেছে',
  gpsPermissionHelp: 'অবস্থান অনুমতি সহায়তা',
  gpsPermissionTitle: 'অবস্থান (GPS) অনুমতি দিন',
  gpsPermissionDesc: 'জমির দাগ শনাক্ত করার জন্য জিপিএস প্রয়োজন',
  demoPanelTitle: 'ডেমো কন্ট্রোল প্যানেল',
  demoPanelSubtitle: 'হ্যাকাথন উপস্থাপনা ও বিশেষ কেস সরাসরি পরীক্ষা করার টুল',
  simulateLocationTitle: 'অবস্থান (GPS) অনুকরণ',
  simulateLocationDesc:
    'ল্যাপটপে বা প্রদর্শনীতে নির্দিষ্ট কোনো দাগে উপস্থিত থাকার অনুভূতি তৈরির জন্য অবস্থান অনুকরণ করুন।',
  simulateLocationSelectDag: 'দাগ নির্বাচন:',
  simulateLocationBtn: 'অবস্থান অনুকরণ করুন',
  simulateLocationStop: 'অনুকরণ বন্ধ করুন',
  simulateLocationActive: 'অনুকরণ সক্রিয়',
  simulateLocationActiveMsg: 'আপনি বর্তমানে দাগ {n}-এ আছেন হিসেবে অনুকরণ করা হচ্ছে',
  demoScenariosTitle: '১২টি বিশেষ জমি সিনারিও',
  demoScenariosSubtitle: 'সরাসরি দাগে যেতে ট্যাপ করুন',
  resetDemoBtn: 'ডেমো রিসেট',
  resetDemoSuccess: 'ডেমো রিসেট করা হয়েছে',
  viewDeedRecords: 'রেকর্ড ও খতিয়ান দেখুন',
  matchedSurvey: '{survey} {n} মিলেছে',
  searchHint: 'বর্তমান বা পুরনো খতিয়ানের দাগ নম্বর দিয়ে খুঁজুন',
  searchExamples: 'উদা: ১০১, 103, CS 1, SA 12, RS 201',

  // Polish & Demo Pass (P1-T12)
  firstOpenHint: 'যেকোনো দাগে চাপ দিন',
  somethingWentWrong: 'কিছু ভুল হয়েছে',
  somethingWentWrongDesc:
    'অ্যাপটিতে একটি সাময়িক সমস্যা দেখা দিয়েছে। অনুগ্রহ করে নিচের বোতাম চেপে পুনরায় চেষ্টা করুন।',
  tryAgain: 'আবার চেষ্টা করুন',
  pageNotFound: 'পৃষ্ঠাটি পাওয়া যায়নি (৪০৪)',
  pageNotFoundDesc: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।',
  backToMap: 'মানচিত্রে ফিরে যান',
  plotNotFound: 'দাগ #{n} পাওয়া যায়নি',
  plotNotFoundDesc: 'এই মৌজায় ১০১ থেকে ১৪৮ নম্বর দাগ রয়েছে।',
  goToFirstDag: 'প্রথম দাগে যান (১০১)',
  aboutSubtitle: 'জমির বংশ জানুন, নিরাপদে কিনুন',
  aboutWhatIsTitle: 'এটি কী এবং কেন?',
  aboutWhatIsDesc:
    'জমি বংশ একটি মানচিত্র-কেন্দ্রিক ওয়েব অ্যাপ (PWA), যা জমি কেনার আগে যেকোনো দাগে (প্লটে) ট্যাপ করে মালিকানা যাচাই, ফারায়েজ অনুযায়ী অংশের বৈধতা, বাজারের প্রকৃত মূল্য ও দলিলের পূর্ণ সরকারি রেজিস্ট্রেশন খরচ এক নজরে জানতে সাহায্য করে। ল্যান্ডটেক ২০২৬ (DIU) হ্যাকাথনের জন্য তৈরি।',
  aboutDisclaimerTitle: 'ডেমো ডেটা ঘোষণা (বাস্তব রেকর্ড নয়)',
  aboutDisclaimerDesc:
    'এই অ্যাপের প্রতিটি নাম, দাগ নম্বর, খতিয়ান ও দলিল সম্পূর্ণভাবে কাল্পনিক ও কৃত্রিম (সিন্থেটিক)। এটি কোনো সরকারি পোর্টাল (land.gov.bd বা eporcha) থেকে নেওয়া নয় বা স্ক্র্যাপ করা হয়নি। এটি কেবল ক্রয়পূর্ব সিদ্ধান্ত সহায়ক প্রোটোটাইপ, মালিকানার আইনি সনদ নয়।',
  aboutSourcesTitle: 'উপাত্ত ও তথ্যের উৎস',
  aboutSourcesMouza: 'সিন্থেটিক ডেমো মৌজা: "নতুন চর", মানিকগঞ্জ সদর (বীজ: jomi-bongsho-2026)',
  aboutSourcesMap: 'বেসম্যাপ: OpenFreeMap © OpenMapTiles, তথ্যসূত্র © OpenStreetMap অবদানকারীগণ',
  aboutSourcesFees:
    'সরকারি ফি হার: অর্থ মন্ত্রণালয় ও সাব-রেজিস্ট্রি গেজেট রিপোর্ট (২০২৫-২৬ বাজেট)',
  aboutAiTitle: 'এআই ও প্রযুক্তি ব্যবহারের ঘোষণা',
  aboutAiDesc:
    'গুগল অ্যান্টিগ্র্যাভিটি (Antigravity IDE) এবং জেমিনাই (Gemini) মডেলের সহায়তায় কোড তৈরি ও রিফ্যাক্টর করা হয়েছে। সকল জমির আইনগত নিয়ম (শেয়ার লেজার, ফারায়েজ ও ফ্রড চেক) টিমের নিজস্ব বিশ্লেষণে তৈরি এবং ১০০% স্বয়ংক্রিয় টেস্ট দ্বারা পরীক্ষিত।',
  aboutCreditsTitle: 'ওপেন সোর্স ও লাইব্রেরি কৃতজ্ঞতা',
  aboutCreditsDesc:
    'MapLibre GL JS, Turf.js, fraction.js, Zustand, React Router, Tailwind CSS, Motion, Lucide Icons, Vite, Vitest এবং @fontsource ফন্ট পরিবার।',
  aboutVersion: 'সংস্করণ: ০.১.০ (রাউন্ড ১ প্রোটোটাইপ)',
  installedApp: 'অ্যাপটি ইনস্টল করা আছে',
};

export type TranslationKey = keyof typeof bn;
