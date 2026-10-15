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

  // Map overlay
  oldMap: 'পুরনো নকশা',
  digitalMap: 'মানচিত্র',

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
};

export type TranslationKey = keyof typeof bn;
