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
};
