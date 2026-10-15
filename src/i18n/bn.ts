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
};

export type TranslationKey = keyof typeof bn;
