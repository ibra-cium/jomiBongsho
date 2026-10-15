import React from 'react';
import { Navigation, Compass, AlertCircle, Loader2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { toBanglaDigits } from '@/lib/format';
import type { GpsState } from '@/state/useAppStore';

interface GPSFabProps {
  state: GpsState;
  dagId: string | null;
  onPress: () => void;
  className?: string;
}

export const GPSFab: React.FC<GPSFabProps> = ({ state, dagId, onPress, className = '' }) => {
  const { t, lang } = useT();

  const displayDagNo = dagId ? (lang === 'bn' ? toBanglaDigits(dagId) : dagId) : null;

  // Visual variants depending on GPS state
  let buttonStyle = 'bg-accent text-accent-ink hover:opacity-90 shadow-lg';
  let icon = <Navigation className="w-6 h-6" />;
  let label = lang === 'bn' ? 'আমার অবস্থান খুঁজুন' : 'Find my location';

  if (state === 'locating') {
    buttonStyle = 'bg-accent text-accent-ink shadow-lg ring-4 ring-accent/30';
    icon = <Loader2 className="w-6 h-6 animate-spin" />;
    label = lang === 'bn' ? 'অবস্থান খোঁজা হচ্ছে...' : 'Locating...';
  } else if (state === 'found') {
    buttonStyle = 'bg-accent text-accent-ink ring-2 ring-ok shadow-xl';
    icon = <Navigation className="w-5 h-5 fill-current" />;
    label = displayDagNo
      ? lang === 'bn'
        ? `আপনি দাগ ${displayDagNo}-এ আছেন`
        : `You are on Dag ${displayDagNo}`
      : lang === 'bn'
        ? 'অবস্থান পাওয়া গেছে'
        : 'Location found';
  } else if (state === 'outside') {
    buttonStyle = 'bg-paper-2 text-warn border-2 border-warn shadow-lg';
    icon = <AlertCircle className="w-6 h-6" />;
    label = t('locationOutside');
  } else if (state === 'denied' || state === 'unsupported') {
    buttonStyle = 'bg-paper-2 text-ink-3 border border-line shadow-md';
    icon = <Compass className="w-6 h-6" />;
    label = lang === 'bn' ? 'অবস্থান অনুমতি প্রয়োজন' : 'Location permission required';
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <button
        type="button"
        onClick={onPress}
        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${buttonStyle}`}
        aria-label={label}
        title={label}
      >
        {icon}
        {state === 'found' && displayDagNo && (
          <span className="text-[10px] font-bold font-serif -mt-0.5 leading-none px-1 rounded bg-paper/20">
            {displayDagNo}
          </span>
        )}
      </button>

      {/* Pulsing indicator when found */}
      {state === 'found' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-ok border-2 border-paper text-[8px] font-bold text-white items-center justify-center">
            ✓
          </span>
        </span>
      )}
    </div>
  );
};
